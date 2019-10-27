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

function pipe(...fns) {
  return function reduce<T, U>(x:T):U {
    return fns.reduce((v, f) => f(v), x)
  }
}

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
      set(_ , property, value) {
        if (dict[property] !== undefined) {
          alreadyDefined(id, property)
        }
        dict[property] = value
        return true
      },
      get(_, property) {
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

function id<T>(v:T):T {
  return v
}

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

interface Attributes {
  [propName: string]: (string | number | [] | {} | boolean | Attributes);
}

interface FullQueryMap extends Attributes {
  __env: Env;
  __query: FullQuery;
  key: any;
}


const registry: Map<QueryKey, FullQuery> = new Map()
const idRegistry: Map<QueryKey, string> = new Map()

export const query = (query: FullQuery, id: string) => (key: QueryKey) => {
  registry.set(key, query)
  id && idRegistry.set(key, id)
  return key
}

export const instance = (Component: React.FunctionComponent | React.ComponentClass)=> (atts: FullQueryMap) =>
  React.createElement(Component, {...atts, key: atts['__env'][getId(Component)]})


export function getQuery(key: QueryKey): FullQuery {
  return registry.get(key)
}

export function getId(key: QueryKey): string {
  return idRegistry.get(key) || 'single'
}

export function clearRegistry(): void {
  registry.clear()
  idRegistry.clear()
}

interface Env {
  __parentEnv?: Env;
  __queryKey?: string;
}

const parseQueryTerm = (term: FullTerm, __env: Env): object => {
  const mutateFn = parsers.mutate && parsers.mutate[term[0]]
  if (mutateFn) {
    return mutateFn(term, __env, state)
  } else {
    return parsers.read(term, __env, state)
  }
}

const parseQuery = (query: FullQuery, __env: Env): Array<object> => {
  if (__env === undefined) {
    return parseQuery(query, {})
  }

  return query.map(queryTerm => parseQueryTerm(queryTerm, __env))
}

function makeAtts(res: object, [k, v]:[string, object]): object {return ({ ...res, [k]: v })}

export function parseQueryIntoMap(
  __query: FullQuery,
  __env: Env = {},
  _state: object = state,
  _parsers: {[parser: string]: Function} = parsers,
): FullQueryMap {
  const queryNames: string[] = __query.map(v => v[0])
  const queryResult = parseQuery(__query, __env)

  const atts = zip(queryNames, queryResult).reduce(makeAtts, {})
  const key = atts[queryNames[0]]
  return {
    __env,
    __query,
    key: typeof key === 'string' ? key : 'unique',
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

function parseQueryTermSync(queryTerm: FullTerm, result: object, __env: Env) {
  const syncFun = parsers.sync[queryTerm[0]]
  if (syncFun) {
    syncFun(queryTerm, result, __env, state)
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
    const perfRQ = skipRemote ? v => v : (query:FullQuery) => {
      performRemoteQuery(parseQueryRemote(query))
      return query
    }
    ReactDOM.render(instance(Component)(pipe(getQuery, unfoldQuery, perfRQ, parseQueryIntoMap)(Component) ), element)
  }
}

export function mapDelta(map1:{}, map2:{}):{} {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {})
}

export function loopRootQuery(queryTerm: FullTerm, __env?: Env): FullTerm {
  if (__env) {
    const __parentEnv = __env.__parentEnv
    const newEnv: Env = { ...(__parentEnv ? mapDelta(__parentEnv, __env) : __env) }
    delete newEnv.__parentEnv
    delete newEnv.__queryKey
    return loopRootQuery([__env.__queryKey, newEnv, queryTerm], __parentEnv)
  } else {
    return queryTerm
  }
}

export function makeRootQuery(__env: Env, query: FullQuery) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, __env.__parentEnv)
  })
}

export function parseChildren(term: FullTerm, __env: Env, _state = state, _parsers = parsers) {
  const [, , ...query] = term
  const newEnv = { ...__env, __parentEnv: { ...__env, __queryKey: term[0] } }
  return parseQueryIntoMap(query, newEnv, _state, _parsers)
}

interface QLProps {
  __env: Env,
  __query: FullQuery,
  key?: string,
  [prop: string]: object | string | number,
}

export function transact(props: QLProps, query: FullQuery, _state = state, _parsers = parsers) {
  const { __env, __query: componentQuery } = props
  const rootQuery = makeRootQuery(__env, [...query, ...componentQuery])
  parseQuery(rootQuery, __env)
  performRemoteQuery(parseQueryRemote(rootQuery))
  refresh({skipRemote:false})
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
