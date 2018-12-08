import React from 'react'
import ReactDOM from 'react-dom'
import { first, zip } from './utils'
const noMatch = term => {
  throw new Error('No match for ' + term)
}

export function multimethod(dispatch) {
  const dict = {}
  if (typeof noMatch == 'function') {
    dict.noMatch = noMatch
  }

  return new Proxy(
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

const registry = new Map()

export function query(query, key) {
  registry.set(key, query)
  return key
}

export function getQuery(key) {
  return registry.get(key)
}

export function clearRegistry() {
  registry.clear()
}

const parseQueryTerm = (queryTerm, env) => {
  const mutateFn = (parsers.mutate && parsers.mutate[queryTerm[0]])
  const remoteFn = (parsers.remote && parsers.remote[queryTerm[0]])
  if (mutateFn) {
    mutateFn(queryTerm, env, state)
  } else {
    return parsers.read(queryTerm, env, state)
  }
}

const parseQuery = (query, env) => {
  if (env === undefined) {
    return parseQuery(query, {})
  }

  return query.map(queryTerm => {
    return parseQueryTerm(queryTerm, env)
  })
}

export function parseQueryIntoMap(
  query,
  env,
  _state = state,
  _parsers = parsers,
) {
  const queryName = query.map(first)
  const queryResult = parseQuery(query, env)
  const atts = zip(queryName, queryResult).reduce(
    (res, [k, v]) => ({ ...res, [k]: v }),
    {},
  )

  return {
    env,
    query,
    ...atts,
  }
}

export function parseQueryRemote(query) {
  console.log('parse', query)
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

export function parseChildrenRemote([dispatchKey, params, ...children]) {
  const childrenRemote = parseQueryRemote(children)
  console.log(childrenRemote)
  return Array.isArray(childrenRemote) && [...[dispatchKey, params], ...childrenRemote]
}

export function parseQueryTermSync(queryTerm, result, env) {
  const syncFun = parsers.sync[queryTerm[0]]
  if (syncFun) {
    syncFun(queryTerm, result, env, state)
  } else {
    //TODO: Missing sync parser warning
  }
}

export function performRemoteQuery(query) {
  if (Array.isArray(query) && remoteHandler) {
    remoteHandler(query, results => {
      zip(query, results).map(([k, v]) => parseQueryTermSync(k, v, {}))
      refresh(false)
    })
  }
}

export function mapDelta(map1, map2) {
  return Object.entries(map2)
    .filter(([k, v]) => v !== map1[k])
    .reduce((res, [k, v]) => ({ ...res, [k]: v }), {})
}

export function loopRootQuery(queryTerm, env) {
  if (env) {
    const parentEnv = env.parentEnv
    const newEnv = { ...(parentEnv ? mapDelta(parentEnv, env) : env) }
    delete newEnv.parentEnv
    delete newEnv.queryKey
    return loopRootQuery([env.queryKey, newEnv, queryTerm], parentEnv)
  } else {
    return queryTerm
  }
}

export function makeRootQuery(env, query) {
  return query.map(queryTerm => {
    return loopRootQuery(queryTerm, env.parentEnv)
  })
}

export function parseChildren(term, env, _state = state, _parsers = parsers) {
  const [, , ...query] = term
  const newEnv = { ...env, parentEnv: { ...env, queryKey: term[0] } }
  return parseQueryIntoMap(query, newEnv, _state, _parsers)
}

export function transact(props, query, _state = state, _parsers = parsers) {
  const { env, query: componentQuery } = props
  const rootQuery = makeRootQuery(env, [...query, ...componentQuery])
  parseQuery(rootQuery, env)
  const q = parseQueryRemote(rootQuery)
  performRemoteQuery(q)
  refresh(false)
}

export function createInstance(Component, atts) {
  const { env, query } = atts
  return React.createElement(Component, {
    ...atts,
    env,
    query,
    // key: env.id ? env.id : '_',
  })
}

let refresh = isRemoteQuery => {
  const query = getQuery(Component)
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
  return ({ component, element: _el }) => {
    Component = component
    element = _el
    refresh(true)
  }
}

export function _mount({
  component,
  element: _el,
  state: _st,
  remoteHandler: _rh,
  parsers: _parsers,
}) {
  Component = component
  element = _el
  state = _st
  remoteHandler = _rh
  parsers = _parsers
  refresh(true)
}
