import React, { ReactElement, DOMElement, FunctionComponent} from 'react'
import ReactDOM from 'react-dom'

const noMatch = (term: string):void => {
  throw new Error('No match for ' + term)
}

interface Multimethod extends Function {
}

export function multimethod(dispatch: Function): Multimethod {
  const dict = {}
  if (typeof noMatch == 'function') {
    dict['noMatch'] = noMatch
  }

  return new Proxy<Function>(
    () => {
      throw new Error('No match')
    },
    {
      set(target , property, value) {
        dict[property] = value
        return true
      },
      get(target, property, receiver) {
        return dict[property]
      },
      apply(target, thisArg, args) {
        const value = dispatch.apply(null, args)
        const func =
          value && dict.hasOwnProperty(value)
            ? dict[value]
            : dict.hasOwnProperty('noMatch')
              ? dict['noMatch']
              : target
        return func.apply(thisArg, args)
      },
    },
  )
}


let Component: React.FunctionComponent | React.ComponentClass
let element: HTMLElement
let state: object
let remoteHandler: Function
let parsers: {read: Multimethod, mutate: Multimethod, remote: Multimethod, sync: Multimethod}

type FullQuery = FullTerm[]

interface FullTerm extends Array<any> {
  0: string;
  1: object;
  2?: FullTerm;
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

type FoldedQuery = (Term | string)[]

type TermItem = Term | React.FunctionComponent | React.ComponentClass;

interface Term extends Array<any> {
  0: string;
  1?: object | TermItem;
  2?: TermItem;
  4?: TermItem;
  5?: TermItem;
  6?: TermItem;
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

const registry = new Map()

export function query(query: FullQuery, key: Function | React.Component): Function | React.Component {
  registry.set(key, query)
  return key
}

export function getQuery(key: any): FullQuery {
  return registry.get(key)
}

export function clearRegistry(): void {
  registry.clear()
}

interface Env {
  parentEnv?: Env;
  queryKey?: string;
}

const parseQueryTerm = (queryTerm: FullTerm, env: Env): object => {
  const mutateFn = parsers.mutate && parsers.mutate[queryTerm[0]]
  if (mutateFn) {
    return mutateFn(queryTerm, env, state)
  } else {
    return parsers.read(queryTerm, env, state)
  }
}

const parseQuery = (query: FullQuery, env: Env): object[] => {
  if (env === undefined) {
    return parseQuery(query, {})
  }

  return query.map(queryTerm => {
    return parseQueryTerm(queryTerm, env)
  })
}

interface FullQueryIntoMap {
  env: Env,
  query: FullQuery,
  [index: string]: object,
}

function makeAtts(res: object, [k, v]:[string, object]): object {return ({ ...res, [k]: v })}

export function parseQueryIntoMap(
  query: FullQuery,
  env: Env,
  _state: object = state,
  _parsers: {[parser: string]: Function} = parsers,
): FullQueryIntoMap {
  const queryNames: string[] = query.map(v => v[0])
  const queryResult = parseQuery(query, env)

  const atts = zip(queryNames, queryResult).reduce(makeAtts, {})

  return {
    env,
    query,
    ...atts,
  }
}


function parseQueryRemote (query: FullQuery) {
  return query.reduce((acc, item) => {
    if (parsers.remote[item[0]]) {
      const v = parsers.remote(item, state)
      if (v) {
        return [...acc, v]
      } else {
        return acc
      }
    } else {
      return acc
    }
  }, [])
}

export function parseChildrenRemote([dispatchKey, params, ...chi]:FullTerm) {
  const chiRemote = parseQueryRemote(chi)
  return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote]
}

function parseQueryTermSync(queryTerm: FullTerm, result: object, env: Env) {
  const syncFun = parsers.sync[queryTerm[0]]
  if (syncFun) {
    syncFun(queryTerm, result, env, state)
  } else {
    //TODO: Missing sync parser warning
  }
}

export function zip<T, U>(a1:Array<T>, a2:Array<U>):(T | U)[][]
  {return a1.map((x, i) => [x, a2[i]])}

function performRemoteQuery(query: FullQuery) {
  if (Array.isArray(query) && remoteHandler) {
    remoteHandler(query, results => {
      zip(query, results).map(([k, v]: [FullTerm, any]) => parseQueryTermSync(k, v, {}))
      refresh(false)
    })
  }
}

export function mapDelta(map1:{}, map2:{}):{} {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {})
}

export function loopRootQuery(queryTerm: FullTerm, env?: Env): FullTerm {
  if (env) {
    const parentEnv = env.parentEnv
    const newEnv: Env = { ...(parentEnv ? mapDelta(parentEnv, env) : env) }
    delete newEnv.parentEnv
    delete newEnv.queryKey
    return loopRootQuery([env.queryKey, newEnv, queryTerm], parentEnv)
  } else {
    return queryTerm
  }
}

export function makeRootQuery(env: Env, query: FullQuery) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, env.parentEnv)
  })
}

export function parseChildren(term: FullTerm, env: Env, _state = state, _parsers = parsers) {
  const [, , ...query] = term
  const newEnv = { ...env, parentEnv: { ...env, queryKey: term[0] } }
  return parseQueryIntoMap(query, newEnv, _state, _parsers)
}

interface QLProps {
  env: Env,
  query: FullQuery,
  key?: string | number,
  [prop: string]: object | string | number,
}

export function transact(props: QLProps, query: FullQuery, _state = state, _parsers = parsers) {
  const { env, query: componentQuery } = props
  const rootQuery = makeRootQuery(env, [...query, ...componentQuery])
  parseQuery(rootQuery, env)
  const q = parseQueryRemote(rootQuery)
  performRemoteQuery(q)
  refresh(false)
}

export function createInstance(Component: React.FunctionComponent | React.ComponentClass, atts: object, key?: string | number) {
  return React.createElement(Component, {
    ...atts,
    key,
  })
}

export function componentToQuery(something: FullQuery): FullQuery {
  const query: FullQuery = unfoldQuery(getQuery(something))
  return query || something
}

export function unfoldQueryTerm(term: Term): FullTerm {
  let terms: Array<Term>
  const [tag, maybeParams] = term
  let res:FullTerm
  if (maybeParams && (Object.getPrototypeOf(maybeParams) === Object.prototype)) {
    [,,...terms] = term
    res = [tag, maybeParams]
  } else {
    [,...terms] = term
    res = [tag, {}]
  }
  const fullTerms: Array<FullTerm> = terms.map(componentToQuery).reduce(
    (res: Array<FullTerm>, arr) => ([...res, ...arr]), [])
  return [res[0], res[1], ...fullTerms]
}

export function unfoldQuery(query: FoldedQuery): FullQuery {
  return query.map(unfoldQueryTerm)
}

function refresh(isRemoteQuery: boolean): void {
  const query = unfoldQuery(getQuery(Component))
  const atts = parseQueryIntoMap(query, {})
  if (isRemoteQuery) {
    performRemoteQuery(parseQueryRemote(query))
  }
  ReactDOM.render(createInstance(Component, atts), element)
}

export function mount({ state: _st, parsers: _parsers, remoteHandler: _rh }: {state: object, parsers: {read: Multimethod, mutate: Multimethod, remote: Multimethod, sync: Multimethod}, remoteHandler: Function}) {
  state = _st
  parsers = _parsers
  remoteHandler = _rh
  return ({ component, element: _el }: {component: React.FunctionComponent | React.ComponentClass, element: HTMLElement}) => {
    Component = component
    element = _el
    refresh(true)
  }
}
