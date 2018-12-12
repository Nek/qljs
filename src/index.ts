import React, { ReactElement, DOMElement} from 'react'
import ReactDOM from 'react-dom'

const noMatch = (term: string):void => {
  throw new Error('No match for ' + term)
}

export function multimethod(dispatch: Function): Function {
  const dict = {}
  if (typeof noMatch == 'function') {
    dict['noMatch'] = noMatch
  }

  return new Proxy<Function>(
    () => {
      throw new Error('No match')
    },
    {
      set(target, property, value) {
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


let Component
let element
let state
let remoteHandler
let parsers

const isMutationQuery = ([tag]) => {
  return parsers.mutate[tag] ? true : false
}

type Query = Term[]

interface Term extends Array<any> {
  0: string;
  1?: object | Term;
  2?: Term;
  4?: Term;
  5?: Term;
  6?: Term;
  7?: Term;
  8?: Term;
  9?: Term;
  10?: Term;
  11?: Term;
  12?: Term;
  13?: Term;
  14?: Term;
  15?: Term;
  16?: Term;
  17?: Term;
  18?: Term;
}

type FoldedQuery = FoldedTerm[]

interface FoldedTerm extends Array<any> {
  [Symbol.iterator]()
  0: string;
  1?: object | FoldedTerm | Function | React.Component;
  2?: FoldedTerm;
  4?: FoldedTerm;
  5?: FoldedTerm;
  6?: FoldedTerm;
  7?: FoldedTerm;
  8?: FoldedTerm;
  9?: FoldedTerm;
  10?: FoldedTerm;
  11?: FoldedTerm;
  12?: FoldedTerm;
  13?: FoldedTerm;
  14?: FoldedTerm;
  15?: FoldedTerm;
  16?: FoldedTerm;
  17?: FoldedTerm;
  18?: FoldedTerm;
}

const registry = new Map()

export function query(query: Query, key: Function | React.Component): Function | React.Component {
  registry.set(key, query)
  return key
}


export function getQuery(key: any): Query {
  return registry.get(key)
}

export function clearRegistry(): void {
  registry.clear()
}

interface Env {
  parentEnv?: Env;
  queryKey?: string;
}

const parseQueryTerm = (queryTerm: Term, env: Env): object => {
  const mutateFn = parsers.mutate && parsers.mutate[queryTerm[0]]
  if (mutateFn) {
    return mutateFn(queryTerm, env, state)
  } else {
    return parsers.read(queryTerm, env, state)
  }
}

const parseQuery = (query: Query, env: Env): object[] => {
  if (env === undefined) {
    return parseQuery(query, {})
  }

  return query.map(queryTerm => {
    return parseQueryTerm(queryTerm, env)
  })
}

interface QueryIntoMap {
  env: Env,
  query: Query,
  [index: string]: object,
}

function makeAtts(res: object, [k, v]:[string, object]): object {return ({ ...res, [k]: v })}

export function parseQueryIntoMap(
  query: Query,
  env: Env,
  _state: object = state,
  _parsers: {[parser: string]: Function} = parsers,
): QueryIntoMap {
  const queryNames: string[] = query.map(v => v[0])
  const queryResult = parseQuery(query, env)

  const atts = zip(queryNames, queryResult).reduce(makeAtts, {})

  return {
    env,
    query,
    ...atts,
  }
}


function parseQueryRemote (query: Query) {
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

export function parseChildrenRemote([dispatchKey, params, ...chi]) {
  const chiRemote = parseQueryRemote(chi)
  return Array.isArray(chiRemote) && [...[dispatchKey, params], ...chiRemote]
}

function parseQueryTermSync(queryTerm, result, env) {
  const syncFun = parsers.sync[queryTerm[0]]
  if (syncFun) {
    syncFun(queryTerm, result, env, state)
  } else {
    //TODO: Missing sync parser warning
  }
}

export function zip<T, U>(a1:Array<T>, a2:Array<U>):(T | U)[][]
  {return a1.map((x, i) => [x, a2[i]])}

function performRemoteQuery(query: Query) {
  if (Array.isArray(query) && remoteHandler) {
    remoteHandler(query, results => {
      zip(query, results).map(([k, v]) => parseQueryTermSync(k, v, {}))
      refresh(false)
    })
  }
}

export function mapDelta(map1:{}, map2:{}):{} {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {})
}

export function loopRootQuery(queryTerm: Term, env?: Env): Term {
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

export function makeRootQuery(env: Env, query: Query) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, env.parentEnv)
  })
}

export function parseChildren(term: Term, env: Env, _state = state, _parsers = parsers) {
  const [, , ...query] = term
  const newEnv = { ...env, parentEnv: { ...env, queryKey: term[0] } }
  return parseQueryIntoMap(query, newEnv, _state, _parsers)
}

export function transact(props, query: Query, _state = state, _parsers = parsers) {
  const { env, query: componentQuery } = props
  const rootQuery = makeRootQuery(env, [...query, ...componentQuery])
  parseQuery(rootQuery, env)
  const q = parseQueryRemote(rootQuery)
  performRemoteQuery(q)
  refresh(false)
}

export function createInstance(Component, atts: {env, query}, key?: string | number) {
  const { env, query } = atts
  return React.createElement(Component, {
    ...atts,
    env,
    query,
    key,
  })
}

export function componentToQuery(something: Query): Query {
  const query: Query = unfoldQuery(getQuery(something))
  return query || something
}

export function unfoldQueryTerm(foldedTerm: FoldedTerm): Term {
  let foldedTerms: Array<FoldedTerm>
  const [tag, maybeParams] = foldedTerm
  let res:Term
  if (maybeParams && (Object.getPrototypeOf(maybeParams) === Object.prototype)) {
    [,,...foldedTerms] = foldedTerm
    res = [tag, maybeParams]
  } else {
    [,...foldedTerms] = foldedTerm
    res = [tag]
  }
  const terms: Array<Term> = foldedTerms.map(componentToQuery).reduce(
    (res: Array<Term>, arr) => ([...res, ...arr]), [])
  return res.length === 1 ? [res[0], ...terms] : [res[0], res[1], ...terms]
}

export function unfoldQuery(query: FoldedQuery): Query {
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

export function mount({ state: _st, parsers: _parsers, remoteHandler: _rh }) {
  state = _st
  parsers = _parsers
  remoteHandler = _rh
  return ({ component, element: _el }: {component: Function | React.Component, element: HTMLElement}) => {
    Component = component
    element = _el
    refresh(true)
  }
}
