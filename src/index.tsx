import React from "react";
import ReactDOM from "react-dom";

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

const readDict = {};
const read = metaParser("Read", readDict);

const mutateDict = {};
const mutate = metaParser("Mutate", mutateDict);

const remoteDict = {};
const remote = metaParser("Remote", remoteDict);

const syncDict = {};
const sync = metaParser("Sync", syncDict);

export const parsers = {
  read,
  mutate,
  remote,
  sync
};

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

let RootComponent: React.FunctionComponent<Attributes & Context>;
let element: HTMLElement;
let state: object;
let remoteHandler: Function;

type FullQuery = Array<FullTerm>;

type FullTerm = [string, object, ...FullTerm[]];

type FoldedQuery = Array<Term>;

type TermItem = Term | RenderFunction;

type Term = [string, (object | TermItem), ...TermItem[]];

type Attributes = {
  [propName: string]: string | number | [] | {} | boolean | Attributes;
  key?: string;
}

type QLProps = Attributes & Context;

type Context = {
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

type Env = {
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

function makeProps(res: object, [k, v]: [string, object]): object {
  return { ...res, [k]: v };
}

export function parseQueryIntoProps(
  __query: FullQuery,
  __env: Env = {},
  _state: object = state
): QLProps {
  const queryNames: string[] = __query.map(v => v[0]);
  const queryResult = parseQuery(__query, __env);

  const props = zip(queryNames, queryResult).reduce(makeProps, {});
  const key = props[queryNames[0]];
  return {
    __env,
    __query,
    key: typeof key === "string" ? key : "unique",
    ...props
  };
}

function parseQueryRemote(query: FullQuery) {
  const result = query.reduce((acc, term) => {
    const remote = remoteDict[term[0]];
    if (remote) {
      const v = remote(term, state);
      return v ? [...acc, v] : acc;
    } else {
      return acc;
    }
  }, []);
  return result;
}

export function parseChildrenRemote([dispatchKey, params, ...chi]: FullTerm) {
  const chiRemote = parseQueryRemote(chi);
  return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote];
}

function parseQueryTermSync(term: FullTerm, result: object, __env: Env) {
  const syncFun = syncDict[term[0]];
  if (syncFun) {
    syncFun(term, result, __env, state);
  } else {
    parserNoMatch("Sync", term[0]);
  }
}

export function zip<T, U>(a1: Array<T>, a2: Array<U>): (T | U)[][] {
  return a1.map((x, i) => [x, a2[i]]);
}

function compressTerm(term): FullTerm {
  const compressInner = (term, res) => {
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
function performRemoteQuery(query: FullQuery) {
  if (remoteHandler && Array.isArray(query) && query.length > 0) {
    const [term] = query;
    const [tag, params] = compressTerm(term);
    remoteHandler(tag, params).then(results => {
      zip(query, results).forEach(([k, v]: [FullTerm, any]) => {
        parseQueryTermSync(compressTerm(k), v, {});
      });
      refresh();
    });
  }
}

function refresh({ skipRemote } = { skipRemote: true }) {
  if (RootComponent !== undefined) {
    const perfRQ = skipRemote
      ? v => v
      : (query: FullQuery) => {
          performRemoteQuery(parseQueryRemote(query));
          return query;
        };
    const props = parseQueryIntoProps(
      perfRQ(unfoldQuery(getQuery(RootComponent)))
    );
    ReactDOM.render(
      <RootComponent {...props} transact={query => transact(props, query)} />,
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

export function parseChildren(term: FullTerm, __env: Env, _state = state) {
  const [, , ...query] = term;
  const newEnv = { ...__env, __parentEnv: { ...__env, __queryKey: term[0] } };
  return parseQueryIntoProps(query, newEnv, _state);
}

export function makeRootQuery(__env: Env, query: FullQuery) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv);
  });
}
export function transact(
  { __env, __query: componentQuery },
  query: FullQuery,
  _state = state
) {
  const rootQuery = [...query, ...componentQuery].map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv);
  });
  parseQuery(rootQuery, __env);
  performRemoteQuery(parseQueryRemote(rootQuery));
  refresh({ skipRemote: false });
}

export function componentToQuery(something: any): FullQuery {
  const query: FullQuery = unfoldQuery(getQuery(something));
  return query || something;
}

export function unfoldQueryTerm(term: Term): FullTerm {
  let terms: (string | object | TermItem)[];
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

export function init({ state: _st, remoteHandler: _rh }) {
  state = _st;
  remoteHandler = _rh;
  return ({ Component, element: _el }) => {
    RootComponent = Component;
    element = _el;
    refresh();
  };
}
