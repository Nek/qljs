import React  from 'react'
import ReactDOM from 'react-dom'

interface Multimethod extends Function {
}

const noMatchWarningDefault = (id: string, key: string): void => {
  console.warn(`No match for "${key}" on multimethod "${id}".`)
}
const alreadyDefinedErrorDefault = (id: string, key: string | number | symbol): void => {
  throw new Error(`Multimethod ${id} already has "${String(key)}" method.`)
}

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

/**
Ad-hoc polymorphism for JS.
dispatch - function that takes incoming parameteres and returns the actual method name
defaultMethod - default action for missing methods
alreadyDefined - overwriting existing method error message formatter
noMatchWarning -  missing method call warning message formatter
**/
export function multimethod(dispatch: Function,
                            id: string = 'default',
                            defaultMethod: Function = () => null,
                            alreadyDefined: Function = alreadyDefinedErrorDefault,
                            noMatchWarning: Function = noMatchWarningDefault,
                           ): Multimethod {
  const dict = {}

  return new Proxy<Function>(
    defaultMethod
    ,
    {
      set(target , property, value) {
        if (dict[property] !== undefined) {
          alreadyDefined(id, property)
        }
        dict[property] = value
        return true
      },
      get(target, property, receiver) {
         return dict[property]
      },
      apply(target, thisArg, args) {
        const key = dispatch.apply(null, args)
        const func =
          key && dict.hasOwnProperty(key)
            ? dict[key]
            : dict.hasOwnProperty('noMatch')
              ? dict['noMatch']
          : (...args) => {
            noMatchWarning(id, key)
            return target(...args)
          }
        return func.apply(thisArg, args)
      },
    },
  )
}

function first<T>(a: Array<T>): T {return a[0]}

const parserNoMatch = (id: string, key: string | number | symbol): void => {
  console.warn(`${String(id)} parser method for "${String(key)}" is missing.`)
}
const alreadyDefined = (id: string, key: string | number | symbol): void => {throw new Error(`${String(id)} parser already has method for "${String(key)}".`)}
const id = v => v
const read: Multimethod = multimethod(first, 'read', id, alreadyDefined, parserNoMatch)
const mutate: Multimethod =  multimethod(first, 'mutate', id, alreadyDefined, parserNoMatch)
const remote: Multimethod = multimethod(first, 'remote', id, alreadyDefined, parserNoMatch)
const sync: Multimethod = multimethod(first, 'sync', id, alreadyDefined, parserNoMatch)

export const parsers = {
  read,
  mutate,
  remote,
  sync,
}

type QueryKey = React.FunctionComponent | React.ComponentClass

let Component: QueryKey
let element: HTMLElement
let state: object
let remoteHandler: Function

type FullQuery = Array<FullTerm>

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

type FoldedQuery = Array<Term>

type TermItem = Term | QueryKey

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

const registry: Map<QueryKey, FullQuery> = new Map()

export function query(query: FullQuery, key: QueryKey): QueryKey {
  registry.set(key, query)
  return key
}

export function getQuery(key: QueryKey): FullQuery {
  return registry.get(key)
}

export function clearRegistry(): void {
  registry.clear()
}

interface Env {
  parentEnv?: Env;
  queryKey?: string;
}

const parseQueryTerm = (term: FullTerm, env: Env): object => {
  const mutateFn = parsers.mutate && parsers.mutate[term[0]]
  if (mutateFn) {
    return mutateFn(term, env, state)
  } else {
    return parsers.read(term, env, state)
  }
}

const parseQuery = (query: FullQuery, env: Env): Array<object> => {
  if (env === undefined) {
    return parseQuery(query, {})
  }

  return query.map(queryTerm => parseQueryTerm(queryTerm, env))
}

interface FullQueryMap {
  env: Env;
  query: FullQuery;
  [index: string]: object;
}

function makeAtts(res: object, [k, v]:[string, object]): object {return ({ ...res, [k]: v })}

export function parseQueryIntoMap(
  query: FullQuery,
  env: Env = {},
  _state: object = state,
  _parsers: {[parser: string]: Function} = parsers,
): FullQueryMap {
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
  return query.reduce((acc, term) => {
    if (parsers.remote[term[0]]) {
      const v = parsers.remote(term, state)
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

/*
Call remote handler for a query and zip result to
*/
function performRemoteQuery(query: FullQuery) {
  if (remoteHandler && Array.isArray(query) && query.length > 0) {
    remoteHandler(query).then(results => {
      zip(query, results).forEach(([k, v]: [FullTerm, any]) => parseQueryTermSync(k, v, {}))
      refresh()
    })
  }
}

function refresh({skipRemote} = {skipRemote: true}) {
  if (Component !== undefined)
  {
    const perfRQ = (query) => {
      performRemoteQuery(parseQueryRemote(query))
      return query
    }
    ReactDOM.render(createInstance(Component,pipe(getQuery, unfoldQuery, skipRemote ? v => v : perfRQ, parseQueryIntoMap)(Component) ), element)
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
  performRemoteQuery(parseQueryRemote(rootQuery))
  refresh({skipRemote:false})
}

export function createInstance(Component: React.FunctionComponent | React.ComponentClass, atts: object, key?: string | number) {
  return React.createElement(Component, {
    ...atts,
    key,
  })
}

export function componentToQuery(something: any): FullQuery {
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

export function mount({ state: _st, remoteHandler: _rh }: {state: object, remoteHandler: Function}) {
  state = _st
  remoteHandler = _rh

  return ({ component, element: _el }: {component: React.FunctionComponent | React.ComponentClass, element: HTMLElement}) => {
    Component = component
    element = _el

    refresh()
  }
}
