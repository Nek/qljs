import * as React from "react";
import * as ReactDOM from "react-dom";

const parserNoMatch = (id: string, key: string | number | symbol): void => {
  console.warn(`${String(id)} parser for "${String(key)}" is missing.`);
};
const alreadyDefined = (id: string, key: string | number | symbol): void => {
  throw new Error(
    `${String(id)} parser is already defined for "${String(key)}".`
  );
};

const metaParser = (name, dict) => (id, parser) => {
  const maybeParser = dict[id];
  if (maybeParser) {
    alreadyDefined(name, id);
  } else {
    dict[id] = parser;
  }
};

export type ReadParser = (term: Term, env: Env, state: unknown) => Json;
const readDict: { [tag: string]: ReadParser } = {};
const read = metaParser("Read", readDict);

export type MutateParser = (term: Term, env: Env, state: unknown) => Json;
const mutateDict: { [tag: string]: MutateParser } = {};
const mutate = metaParser("Mutate", mutateDict);

export type RemoteParser = (term: Term, state: unknown) => Term;
const remoteDict: { [tag: string]: RemoteParser } = {};
const remote = metaParser("Remote", remoteDict);

export type SyncParser = (
  term: Term,
  result: Json,
  env: Env,
  state: unknown
) => void;
const syncDict: { [tag: string]: SyncParser } = {};
const sync = metaParser("Sync", syncDict);

export const parsers = {
  read,
  mutate,
  remote,
  sync
};

type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];

const render = (
  ctx: QLProps | Array<QLProps>,
  Component: QLComponent
): JSX.Element | JSX.Element[] =>
  Array.isArray(ctx) ? (
    ctx.map(ctx => (
      <Component
        {...ctx}
        transact={(query: Query): void => transact(ctx, query)}
        render={render}
      />
    ))
  ) : (
    <Component
      {...ctx}
      transact={(query: Query): void => transact(ctx, query)}
      render={render}
    />
  );

export type QLComponent = React.FunctionComponent<QLProps>;

let RootComponent: QLComponent;
let element: HTMLElement;
let state: object;

let remoteHandler: (
  tag: string,
  params?: Params
) => Promise<Params[]> | boolean;

type Attributes = {
  [propName: string]: string | number | [] | {} | boolean | Attributes;
  key: string;
};

type Context = {
  __env: Env;
  __query: Query;
};

type Utils = {
  render: (
    ctx: QLProps | Array<QLProps>,
    Component: QLComponent
  ) => JSX.Element | JSX.Element[];
  transact: (query: Query) => void;
};

export type QLProps = Attributes & Context & Utils;

const registry: Map<QLComponent, Query> = new Map();

type Tag = string;
type Params = { [property: string]: Json };
function isParams(term: unknown | Params): term is Params {
  return Object.prototype.toString.call(term) === "[object Object]";
}

type Term = [Tag, Params, ...Term[]];
function isTerm(curr: Term | Query | QLComponent): curr is Term {
  return typeof curr[0] === "string";
}

type Query = Term[];
function isQuery(curr: Query | QLComponent): curr is Query {
  return Array.isArray(curr[0]);
}

type ShortTerm = Tag | [Tag, Params?, ...(Query | Term | QLComponent)[]];
type ShortQuery = ShortTerm[];

type StrictlyParametrizedTerm = [
  Tag,
  Params,
  ...(Term | QLComponent | Query)[]
];
function isStrictlyParametrizedTerm(
  term: [Tag, ...(Term | QLComponent | Query)[]] | StrictlyParametrizedTerm
): term is StrictlyParametrizedTerm {
  return term.length > 1 && isParams(term[1]);
}

function normalize(rest: (Term | Query | QLComponent)[]): Term[] {
  return rest.reduce<Term[]>(
    (res: Term[], curr: Term | Query | QLComponent): Term[] => {
      if (isTerm(curr)) {
        return [...res, curr];
      } else if (isQuery(curr)) {
        return [...res, ...curr];
      } else {
        const query = getQuery(curr);
        return [...res, ...query];
      }
    },
    []
  );
}

function tagToTerm(tag: Tag | ShortTerm) {
  return typeof tag === "string" ? [tag] : tag;
}

function addParamsAndNormalize(
  term: [Tag, ...(Term | QLComponent | Query)[]] | StrictlyParametrizedTerm
): Term {
  if (isStrictlyParametrizedTerm(term)) {
    const [, , ...rest]: [
      Tag,
      Params,
      ...(Term | QLComponent | Query)[]
    ] = term;
    return [term[0], term[1], ...normalize(rest)];
  } else {
    const [, ...rest]: [Tag, ...(Term | QLComponent | Query)[]] = term;
    return [term[0], {}, ...normalize(rest)];
  }
}

export const component = (dsl: ShortQuery, key: QLComponent): QLComponent => {
  const query: Query = dsl
    // Convert query tag to a Term ['todoId'] -> [['todoId', {}]]
    .map(tagToTerm)
    .map(addParamsAndNormalize);

  registry.set(key, query);
  return key;
};

export function getQuery(key: QLComponent): Query {
  return registry.get(key);
}

export function clearRegistry(): void {
  registry.clear();
}

type Env = {
  __parentEnv?: Env;
  __queryKey?: string;
};

const parseQueryTerm = (term: Term, __env: Env): Json => {
  const mutateFn = mutateDict[term[0]];
  if (mutateFn) {
    return mutateFn(term, __env, state);
  } else {
    const parser = readDict[term[0]];
    if (parser === undefined) {
      parserNoMatch("Read", term[0]);
      return null;
    }
    return parser(term, __env, state);
  }
};

const parseQuery = (query: Query, __env: Env): Json[] => {
  if (__env === undefined) {
    return parseQuery(query, {});
  }

  return query.map(queryTerm => parseQueryTerm(queryTerm, __env));
};

function makeProps(
  res: { [property: string]: Json },
  [k, v]: [string, Json]
): { [property: string]: Json } {
  return { ...res, [k]: v };
}

function parseQueryIntoProps(
  __query: Query,
  __env: Env = {},
  _state: object = state
): Attributes & Context {
  const queryNames: string[] = __query.map(v => v[0]);
  const queryResult = parseQuery(__query, __env);

  const props = zip(queryNames, queryResult).reduce<{
    [property: string]: Json;
  }>(makeProps, {});
  const key = props[queryNames[0]];
  return {
    __env,
    __query,
    key: typeof key === "string" ? key : "unique",
    ...props
  };
}

function parseQueryRemote(query: Query): Query {
  const result = query.reduce((acc, term) => {
    const remote = remoteDict[term[0]];
    if (remote) {
      const v: Term = remote(term, state);
      return v ? [...acc, v] : acc;
    } else {
      return acc;
    }
  }, []);
  return result;
}

export function parseChildrenRemote([dispatchKey, params, ...chi]: Term) {
  const chiRemote = parseQueryRemote(chi);
  return [dispatchKey, params, ...chiRemote];
}

function parseQueryTermSync(term: Term, result: Json, __env: Env): void {
  const syncFun = syncDict[term[0]];
  if (syncFun) {
    syncFun(term, result, __env, state);
  } else {
    const hasRemote = remoteHandler(term[0]);
    hasRemote && parserNoMatch("Sync", term[0]);
  }
}

function zip<T, U>(a1: Array<T>, a2: Array<U>): (T | U)[][] {
  return a1.map((x, i) => [x, a2[i]]);
}

function compressTerm(term: Term): Term {
  const compressInner = (
    term: Term,
    res: { tags: Tag[]; params: Params[] }
  ) => {
    if (term === undefined) {
      return res;
    } else {
      res.tags.push(term[0]);
      res.params.push(term[1]);
      return compressInner(term[2], res);
    }
  };
  const { tags, params } = compressInner(term, { tags: [], params: [] });
  return [tags.reverse()[0], params.reduce((res, p) => ({ ...res, ...p }), {})];
}

/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query: Query): void {
  const [firstTerm] = query;
  const [tag, params] = compressTerm(firstTerm);
  const remoteResult = remoteHandler(tag, params);
  if (typeof remoteResult !== "boolean") {
    remoteResult.then((results: Params[]) => {
      zip<Term, Params>(query, results).forEach(([k, v]: [Term, Params]) => {
        parseQueryTermSync(compressTerm(k), v, {});
      });
      refresh({ skipRemote: true });
    });
  }
}

function refresh({ skipRemote }) {
  if (RootComponent !== undefined) {
    const rootQuery = getQuery(RootComponent);
    !skipRemote && performRemoteQuery(parseQueryRemote(rootQuery));
    const props = parseQueryIntoProps(rootQuery);
    ReactDOM.render(
      <RootComponent
        {...props}
        transact={(query: Query): void => transact(props, query)}
        render={render}
      />,
      element
    );
  }
}

function mapDelta(map1: {}, map2: {}): {} {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {});
}

function loopRootQuery(queryTerm: Term, __env?: Env): Term {
  if (__env) {
    const newEnv: Env = {
      ...(__env.__parentEnv ? mapDelta(__env.__parentEnv, __env) : __env),
      __parentEnv: undefined,
      __queryKey: undefined
    };
    return loopRootQuery(
      [__env.__queryKey, newEnv, queryTerm],
      __env.__parentEnv
    );
  } else {
    return queryTerm;
  }
}

export function parseChildren(
  term: Term,
  __env: Env,
  _state = state
): Attributes & Context {
  const [, , ...query] = term;
  const newEnv = { ...__env, __parentEnv: { ...__env, __queryKey: term[0] } };
  return parseQueryIntoProps(query, newEnv, _state);
}

function transact(
  { __env, __query: componentQuery },
  query: Query,
  _state = state
): void {
  const rootQuery = [...query, ...componentQuery].map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv);
  });
  parseQuery(rootQuery, __env);
  performRemoteQuery(parseQueryRemote(rootQuery));
  refresh({ skipRemote: false });
}

export function init({
  state: _st,
  remoteHandler: _rh
}): ({
  Component,
  element
}: {
  Component: QLComponent;
  element: HTMLElement;
}) => void {
  state = _st;
  remoteHandler = _rh;
  return ({ Component, element: _el }) => {
    RootComponent = Component;
    element = _el;
    refresh({ skipRemote: true });
  };
}
