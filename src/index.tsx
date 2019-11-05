import React from "react";
import ReactDOM from "react-dom";

interface Multimethod extends Function {}

const noMatchWarningDefault = (id: string, key: string): void => {
  console.warn(`No match for "${key}" on multimethod "${id}".`);
};
const alreadyDefinedErrorDefault = (
  id: string,
  key: string | number | symbol
): void => {
  throw new Error(`Multimethod ${id} already has "${String(key)}" method.`);
};

/**
Ad-hoc polymorphism for JS.
dispatch - function that takes incoming parameteres and returns the actual method name
defaultMethod - default action for missing methods
alreadyDefined - overwriting existing method error message formatter
noMatchWarning -  missing method call warning message formatter
**/
export function multimethod(
  dispatch: Function,
  id: string = "default",
  defaultMethod: Function = () => null,
  alreadyDefined: Function = alreadyDefinedErrorDefault,
  noMatchWarning: Function = noMatchWarningDefault
): Multimethod {
  const dict = {};

  return new Proxy<Function>(defaultMethod, {
    set(_, property, value) {
      if (dict[property] !== undefined) {
        alreadyDefined(id, property);
      }
      dict[property] = value;
      return true;
    },
    get(_, property) {
      return dict[property];
    },
    apply(target, thisArg, args) {
      const key = dispatch.apply(null, args);
      const func =
        key && dict.hasOwnProperty(key)
          ? dict[key]
          : dict.hasOwnProperty("noMatch")
          ? dict["noMatch"]
          : (...args) => {
              noMatchWarning(id, key);
              return target(...args);
            };
      return func.apply(thisArg, args);
    }
  });
}

function first<T>(a: Array<T>): T {
  return a[0];
}

const parserNoMatch = (id: string, key: string | number | symbol): void => {
  console.warn(`${String(id)} parser for "${String(key)}" is missing.`);
};
const alreadyDefined = (id: string, key: string | number | symbol): void => {
  throw new Error(
    `${String(id)} parser is already defined for "${String(key)}".`
  );
};

function id<T>(v: T): T {
  return v;
}

const metaParser = (name, dict) => (id, parser) => {
  const maybeParser = dict[id];
  if (maybeParser) {
    alreadyDefined(name, id);
  } else {
    dict[id] = parser;
  }
};

const readDict = {};
export const read = metaParser("Read", readDict);

const mutateDict = {};
export const mutate = metaParser("Mutate", mutateDict);

const remoteDict = {};
export const remote = metaParser("Remote", remoteDict);

const syncDict = {};
export const sync = metaParser("Sync", syncDict);

export const render = (
  ctx: Context | Array<Context>,
  Component: React.FunctionComponent<Attributes & Context>
) =>
  Array.isArray(ctx) ? (
    ctx.map(ctx => (
      <Component {...ctx} transact={query => transact(ctx, query)} />
    ))
  ) : (
    <Component {...ctx} transact={query => transact(ctx, query)} />
  );

type RenderFunction = React.FunctionComponent;

let Component: React.FunctionComponent<Attributes & Context>;
let element: HTMLElement;
let state: object;
let remoteHandler: Function;

type FullQuery = Array<FullTerm>;

interface FullTerm extends Array<any> {
  0: string;
  1: object;
  2?: FullTerm;
  3?: FullTerm;
  4?: FullTerm;
  5?: FullTerm;
  6?: FullTerm;
  7?: FullTerm;
  8?: FullTerm;
  9?: FullTerm;
  10?: FullTerm;
  11?: FullTerm;
  12?: FullTerm;
  13?: FullTerm;
  14?: FullTerm;
  15?: FullTerm;
  16?: FullTerm;
  17?: FullTerm;
  18?: FullTerm;
}

type FoldedQuery = Array<Term>;

type TermItem = Term | RenderFunction;

interface Term extends Array<any> {
  0: string;
  1?: object | TermItem;
  2?: TermItem;
  3?: TermItem;
  4?: TermItem;
  6?: TermItem;
  5?: TermItem;
  7?: TermItem;
  8?: TermItem;
  9?: TermItem;
  10?: TermItem;
  11?: TermItem;
  12?: TermItem;
  13?: TermItem;
  14?: TermItem;
  15?: TermItem;
  16?: TermItem;
  17?: TermItem;
  18?: TermItem;
}

interface Attributes {
  [propName: string]: string | number | [] | {} | boolean | Attributes;
  key?: string;
}

interface QLProps extends Attributes, Context {}

interface Context {
  __env: Env;
  __query: FullQuery;
}

const registry: Map<any, FoldedQuery> = new Map();

export const component = (query: FoldedQuery, key: RenderFunction) => {
  registry.set(key, query);
  return key;
};

export function getQuery(key: RenderFunction): FoldedQuery {
  return registry.get(key);
}

export function clearRegistry(): void {
  registry.clear();
}

interface Env {
  __parentEnv?: Env;
  __queryKey?: string;
}

const parseQueryTerm = (term: FullTerm, __env: Env): object => {
  const mutateFn = mutateDict[term[0]];
  if (mutateFn) {
    return mutateFn(term, __env, state);
  } else {
    const parser = readDict[term[0]];
    if (parser === undefined) {
      parserNoMatch("Read", term[0]);
      return null;
    }
    return readDict[term[0]](term, __env, state);
  }
};

const parseQuery = (query: FullQuery, __env: Env): Array<object> => {
  if (__env === undefined) {
    return parseQuery(query, {});
  }

  return query.map(queryTerm => parseQueryTerm(queryTerm, __env));
};

function makeCtx(res: object, [k, v]: [string, object]): object {
  return { ...res, [k]: v };
}

export function parseQueryIntoProps(
  __query: FullQuery,
  __env: Env = {},
  _state: object = state
): QLProps {
  const queryNames: string[] = __query.map(v => v[0]);
  const queryResult = parseQuery(__query, __env);

  const props = zip(queryNames, queryResult).reduce(makeCtx, {});
  const key = props[queryNames[0]];
  return {
    __env,
    __query,
    key: typeof key === "string" ? key : "unique",
    ...props
  };
}

function parseQueryRemote(query: FullQuery) {
  return query.reduce((acc, term) => {
    const remote = remoteDict[term[0]];
    if (remote) {
      const v = remote(term, state);
      return v ? [...acc, v] : acc;
    } else {
      return acc;
    }
  }, []);
}

export function parseChildrenRemote([dispatchKey, params, ...chi]: FullTerm) {
  const chiRemote = parseQueryRemote(chi);
  return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote];
}

function parseQueryTermSync(queryTerm: FullTerm, result: object, __env: Env) {
  const syncFun = syncDict[queryTerm[0]];
  console.log('!!!!!',queryTerm[0])
  if (syncFun) {
    syncFun(queryTerm, result, __env, state);
  } else {
    parserNoMatch("Sync", queryTerm[0]);
    //TODO: Missing sync parser warning
  }
}

export function zip<T, U>(a1: Array<T>, a2: Array<U>): (T | U)[][] {
  return a1.map((x, i) => [x, a2[i]]);
}

/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query: FullQuery) {
  if (remoteHandler && Array.isArray(query) && query.length > 0) {
    remoteHandler(query).then(results => {
      zip(query, results).forEach(([k, v]: [FullTerm, any]) =>
        parseQueryTermSync(k, v, {})
      );
      refresh();
    });
  }
}

function refresh({ skipRemote } = { skipRemote: true }) {
  if (Component !== undefined) {
    const perfRQ = skipRemote
      ? v => v
      : (query: FullQuery) => {
          performRemoteQuery(parseQueryRemote(query));
          return query;
        };
    const props = parseQueryIntoProps(perfRQ(unfoldQuery(getQuery(Component))));
    ReactDOM.render(
      <Component {...props} transact={query => transact(props, query)} />,
      element
    );
  }
}

export function mapDelta(map1: {}, map2: {}): {} {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {});
}

export function loopRootQuery(queryTerm: FullTerm, __env?: Env): FullTerm {
  if (__env) {
    const __parentEnv = __env.__parentEnv;
    const newEnv: Env = {
      ...(__parentEnv ? mapDelta(__parentEnv, __env) : __env)
    };
    delete newEnv.__parentEnv;
    delete newEnv.__queryKey;
    return loopRootQuery([__env.__queryKey, newEnv, queryTerm], __parentEnv);
  } else {
    return queryTerm;
  }
}

export function makeRootQuery(__env: Env, query: FullQuery) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv);
  });
}

export function parseChildren(term: FullTerm, __env: Env, _state = state) {
  const [, , ...query] = term;
  const newEnv = { ...__env, __parentEnv: { ...__env, __queryKey: term[0] } };
  return parseQueryIntoProps(query, newEnv, _state);
}

interface QLProps {
  __env: Env;
  __query: FullQuery;
  key?: string;
  [prop: string]: object | string | number;
}

export function transact(
  { __env, __query: componentQuery },
  query: FullQuery,
  _state = state
) {
  const rootQuery = makeRootQuery(__env, [...query, ...componentQuery]);
  parseQuery(rootQuery, __env);
  performRemoteQuery(parseQueryRemote(rootQuery));
  refresh({ skipRemote: false });
}

export function componentToQuery(something: any): FullQuery {
  const query: FullQuery = unfoldQuery(getQuery(something));
  return query || something;
}

export function unfoldQueryTerm(term: Term): FullTerm {
  let terms: Array<Term>;
  const [tag, maybeParams] = term;
  let res: FullTerm;
  if (maybeParams && Object.getPrototypeOf(maybeParams) === Object.prototype) {
    [, , ...terms] = term;
    res = [tag, maybeParams];
  } else {
    [, ...terms] = term;
    res = [tag, {}];
  }
  const fullTerms: Array<FullTerm> = terms
    .map(componentToQuery)
    .reduce((res: Array<FullTerm>, arr) => [...res, ...arr], []);
  return [res[0], res[1], ...fullTerms];
}

export function unfoldQuery(query: FoldedQuery): FullQuery {
  return query.map(unfoldQueryTerm);
}

export function mount({
  state: _st,
  remoteHandler: _rh,
  component,
  element: _el
}) {
  state = _st;
  remoteHandler = _rh;
  Component = component;
  element = _el;

  refresh();
}
