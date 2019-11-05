import {
  mount,
  clearRegistry,
  parseQueryIntoProps,
  parseChildren,
  makeRootQuery,
  mapDelta,
  unfoldQuery,
  component,
  transact,
  parseChildrenRemote,
  sync,
  read,
  mutate,
  remote
} from "./index.tsx";

describe("ql", () => {
  let state;

  read("name", (term, { personId }, state) => {
    return state.people[personId] && state.people[personId].name;
  });

  read("age", (term, { personId }, state) => {
    return state.people[personId] && state.people[personId].age;
  });
  read("people", (term, env, state) => {
    const [, { personId }] = term;
    if (personId) {
      return parseChildren(term, { ...env, personId });
    } else {
      const res = Object.keys(state.people).map(personId =>
        parseChildren(term, { ...env, personId })
      );
      return res;
    }
  });

  mutate("delete", ([key, { personId }], env, state) => {
    delete state.people[personId];
  });

  remote("delete", (term, env, state) => {
    return term;
  });

  beforeEach(() => {
    state = {
      people: {
        0: { name: "Bob", age: 29 },
        1: { name: "John", age: 35 }
      }
    };
    const Component = () => null;
    component([["people"]], Component);
    mount({ state, remoteHandler: () => ({ then: v => v }) }, Component, {});
  });

  describe("parseQueryIntoMap", () => {
    it("should parse a simple query", () => {
      const query = [["name"], ["age"]];
      const env = { personId: "0" };
      expect(parseQueryIntoProps(query, env, state)).toEqual({
        name: "Bob",
        age: 29,
        key: "Bob",
        __env: { personId: "0" },
        __query: query
      });
    });
    it("should parse nested queries", () => {
      const query = [["people", {}, ["name"], ["age"]]];
      const env = {};
      console.log(parseQueryIntoProps(query, env, state));
      expect(parseQueryIntoProps(query, env, state)).toEqual({
        __env: {},
        __query: [["people", {}, expect.anything(), expect.anything()]],
        key: "unique",
        people: [
          {
            __env: expect.anything(),
            __query: [Array],
            key: "Bob",
            name: "Bob",
            age: 29
          },
          {
            __env: expect.anything(),
            __query: expect.anything(),
            key: "John",
            name: "John",
            age: 35
          }
        ]
      });

      expect(parseQueryIntoProps(query, env, state)).toEqual({
        __env: expect.anything(),
        people: [
          {
            name: "Bob",
            age: 29,
            key: "unique",

            __env: expect.anything(),
            __query: expect.anything(),
            __queryKey: expect.anything()
          },
          {
            name: "John",
            age: 35,
            key: "John",

            __env: expect.anything(),
            __query: expect.anything()
          }
        ],

        __query: expect.anything()
      });

      expect(parseQueryIntoProps(query, env, state, { read })).toEqual({
        people: [
          {
            age: expect.anything(),
            name: expect.anything(),
            __env: expect.anything(),
            key: "unique",

            __query: [["name"], ["age"]]
          },
          {
            age: expect.anything(),
            name: expect.anything(),
            __env: expect.anything(),
            key: "unique",

            __query: [["name"], ["age"]]
          }
        ],
        __env: {},
        __query: query
      });

      expect(parseQueryIntoProps(query, env, state, { read })).toEqual({
        people: [
          {
            name: "Bob",
            age: 29,
            env: expect.objectContaining({
              __parentEnv: { personId: "0", queryKey: "people" },
              personId: "0"
            }),
            query: [["name"], ["age"]]
          },
          {
            name: "John",
            age: 35,
            __env: expect.objectContaining({
              __parentEnv: { personId: "1", queryKey: "people" },
              personId: "1"
            }),
            __query: [["name"], ["age"]]
          }
        ],
        __env: expect.anything(),
        __query: query
      });
    });
  });
  describe("mapDelta", () => {
    it("finds minimal X such that {...map1, ...X} equals {...map1, ...map2}", () => {
      expect(mapDelta({ a: 1 }, { b: 2 })).toEqual({ b: 2 });
      expect(mapDelta({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
      expect(mapDelta({ a: 1, b: 2 }, { a: 2, b: 2 })).toEqual({ a: 2 });
      expect(mapDelta({ a: 1 }, { a: 1 })).toEqual({});
    });
  });
  describe("makeRootQuery", () => {
    it(`if at the root level and the environment is empty, evaluates to itself`, () => {
      expect(makeRootQuery({}, [["foo"]])).toEqual([["foo"]]);
    });
    it(`if the 'bar' parser set an env variable of id=55, need to add that to the root query`, () => {
      expect(
        makeRootQuery({ parentEnv: { queryKey: "bar", id: 55 } }, [["foo"]])
      ).toEqual([["bar", { id: 55 }, ["foo"]]]);
    });
    it(`if the environment has nested parent environments, all env variables end up in the query, but with duplication removed`, () => {
      expect(
        makeRootQuery(
          {
            parentEnv: {
              queryKey: "bar",
              parentEnv: { queryKey: "baz", idB: 66, idA: 77 },
              idA: 55,
              idB: 66
            }
          },
          [["foo"]]
        )
      ).toEqual([["baz", { idB: 66, idA: 77 }, ["bar", { idA: 55 }, ["foo"]]]]);
    });
  });
  describe(`unfoldQuery`, () => {
    it("unfolds simple terms", () => {
      expect(unfoldQuery([["data"]])).toEqual([["data", {}]]);
      expect(unfoldQuery([["data"], ["moreData"]])).toEqual([
        ["data", {}],
        ["moreData", {}]
      ]);
    });
    it("unfolds simple terms with params", () => {
      expect(unfoldQuery([["data", { stuff: 1 }]])).toEqual([
        ["data", { stuff: 1 }]
      ]);
    });
    it("unfolds a term with chidlren query", () => {
      const F = () => {};
      component([["data"]], F);
      expect(unfoldQuery([["some", F]])).toEqual([["some", {}, ["data", {}]]]);
      clearRegistry();
    });
  });

  describe("transact", () => {
    it("mutates state", () => {
      transact(
        {
          people: [],
          env: {},
          query: [["people", { personId: "0" }], ["name", {}]]
        },
        [["delete", { personId: "0" }]]
      );
      expect(state.people).toEqual(
        expect.not.objectContaining({ "0": { name: "Bob", age: 29 } })
      );
    });
  });

  describe(`parseChildrenRemote`, () => {
    it(`parses children`, () => {
      expect(parseChildrenRemote(["todos", {}, ["text", {}]])).toEqual([
        "todos",
        {}
      ]);
    });
  });
});
