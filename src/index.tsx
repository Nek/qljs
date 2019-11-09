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

export type ReadParser = (term: FullTerm, env: Env, state: any) => any;
const readDict: { [tag: string]: ReadParser } = {};
const read = metaParser("Read", readDict);

export type MutateParser = (term: FullTerm, env: Env, state: any) => any;
const mutateDict: { [tag: string]: MutateParser } = {};
const mutate = metaParser("Mutate", mutateDict);

export type RemoteParser = (term: FullTerm, state: any) => FullTerm;
const remoteDict: { [tag: string]: RemoteParser } = {};
const remote = metaParser("Remote", remoteDict);

export type SyncParser = (
  term: FullTerm,
  result: object,
  env: Env,
  state: any
) => void;
const syncDict: { [tag: string]: SyncParser } = {};
const sync = metaParser("Sync", syncDict);

export const parsers = {
  read,
  mutate,
  remote,
  sync
};

const render = (
  ctx: QLProps | Array<QLProps>,
  Component: QLComponent
): JSX.Element | JSX.Element[] =>
  Array.isArray(ctx) ? (
    ctx.map(ctx => (
      <Component
        {...ctx}
        transact={(query: FullQuery): void => transact(ctx, query)}
        render={render}
      />
    ))
  ) : (
    <Component
      {...ctx}
      transact={(query: FullQuery): void => transact(ctx, query)}
      render={render}
    />
  );

export type QLComponent = React.FunctionComponent<QLProps>;

let RootComponent: QLComponent;
let element: HTMLElement;
let state: object;
let remoteHandler: (tag: string, params: object) => Promise<[FullTerm, any][]>;

type FullQuery = FullTerm[];

type FullTerm = [string, object, ...FullTerm[]];

type FoldedQuery = Term[];

type TermItem = Term | QLComponent;

type Term = [string, (object | TermItem), ...TermItem[]];

type Attributes = {
  [propName: string]: string | number | [] | {} | boolean | Attributes;
  key: string;
};

type Context = {
  __env: Env;
  __query: FullQuery;
};

type Utils = {
  render: (
    ctx: QLProps | Array<QLProps>,
    Component: QLComponent
  ) => JSX.Element | JSX.Element[];
  transact: (query: FullQuery) => void;
};

export type QLProps = Attributes & Context & Utils;

const registry: Map<any, FoldedQuery> = new Map();

export const component = (query: FoldedQuery, key: QLComponent) => {
  registry.set(key, query);
  return key;
};

export function getQuery(key: QLComponent): FoldedQuery {
  return registry.get(key);
}

export function clearRegistry(): void {
  registry.clear();
}

type Env = {
  __parentEnv?: Env;
  __queryKey?: string;
};

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
): Attributes & Context {
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

function parseQueryRemote(query: FullQuery): FullTerm[] {
  const result = query.reduce((acc, term) => {
    const remote = remoteDict[term[0]];
    if (remote) {
      const v: FullTerm = remote(term, state);
      return v ? [...acc, v] : acc;
    } else {
      return acc;
    }
  }, []);
  return result;
}

export function parseChildrenRemote([dispatchKey, params, ...chi]: FullTerm) {
  const chiRemote = parseQueryRemote(chi);
  return [...[dispatchKey, params], ...chiRemote];
}

function parseQueryTermSync(term: FullTerm, result: object, __env: Env): void {
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
function performRemoteQuery(query: FullQuery): void {
  if (remoteHandler && Array.isArray(query) && query.length > 0) {
    const [term] = query;
    const [tag, params] = compressTerm(term);
    remoteHandler(tag, params).then(results => {
      zip(query, results).forEach(([k, v]: [FullTerm, any]) => {
        parseQueryTermSync(compressTerm(k), v, {});
      });
      refresh({ skipRemote: true });
    });
  }
}

function refresh({ skipRemote }) {
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
      <RootComponent
        {...props}
        transact={(query: FullQuery): void => transact(props, query)}
        render={render}
      />,
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

export function parseChildren(
  term: FullTerm,
  __env: Env,
  _state = state
): Attributes & Context {
  const [, , ...query] = term;
  const newEnv = { ...__env, __parentEnv: { ...__env, __queryKey: term[0] } };
  return parseQueryIntoProps(query, newEnv, _state);
}

export function makeRootQuery(__env: Env, query: FullQuery): FullTerm[] {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv);
  });
}
export function transact(
  { __env, __query: componentQuery },
  query: FullQuery,
  _state = state
): void {
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
