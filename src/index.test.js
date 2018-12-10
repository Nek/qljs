import { mount, clearRegistry, parseQueryIntoMap, parseChildren, multimethod, makeRootQuery, mapDelta } from './index'


const dispatch = ([first]) => first
const noMatch = term => {
  throw new Error('No match for ' + term)
}

describe('ql', () => {
  let state
  let sync, read, mutate, remote


  beforeEach(() => {
    state = {
      people: {
        0: { name: 'Nik', age: 37 },
        1: { name: 'Alya', age: 32 },
      },
    }
    let read = multimethod(dispatch)
    let mutate = multimethod(dispatch)
    let sync = multimethod(dispatch)
    let remote = multimethod(dispatch)

    read.name = (term, { personId }, state) => {
      return state.people[personId].name
    }
    read.age = (term, { personId }, state) => {
      return state.people[personId].age
    }
    read.people = (term, env, state) => {
      const [, { personId }] = term
      if (personId) {
        return parseChildren(term, { ...env, personId })
      } else {
        const res = Object.keys(state.people).map(personId =>
                                                  parseChildren(term, { ...env, personId }),
                                                 )
        return res
      }
    }


    mount({ state, parsers: { read }, remoteHandler: v => v })
  })

  describe('parseQueryIntoMap', () => {
    it('should parse a simple query', () => {
      const query = [['name'], ['age']]
      const env = { personId: 0 }
      expect(parseQueryIntoMap(query, env, state, { read })).toEqual({
        name: 'Nik',
        age: 37,
        env: { personId: 0 },
        query,
      })
    })
    it('should parse nested queries', () => {
      const query = [['people', {}, ['name'], ['age']]]
      const env = {}
      expect(parseQueryIntoMap(query, env, state, { read })).toEqual({
        people: expect.anything(),
        env: expect.anything(),
        query: expect.anything(),
      })

      expect(parseQueryIntoMap(query, env, state, { read })).toEqual({
        env: expect.anything(),
        people: [
          {
            name: 'Nik',
            age: 37,

            env: expect.anything(),
            query: expect.anything(),
          },
          {
            name: 'Alya',
            age: 32,

            env: expect.anything(),
            query: expect.anything(),
          },
        ],

        query: expect.anything(),
      })

      expect(parseQueryIntoMap(query, env, state, { read })).toEqual({
        people: [
          {
            age: expect.anything(),
            name: expect.anything(),
            env: expect.anything(),
            query: [['name'], ['age']],
          },
          {
            age: expect.anything(),
            name: expect.anything(),
            env: expect.anything(),
            query: [['name'], ['age']],
          },
        ],
        env: {},
        query,
      })

      expect(parseQueryIntoMap(query, env, state, { read })).toEqual({
        people: [
          {
            name: 'Nik',
            age: 37,
            env: expect.objectContaining({
              parentEnv: { personId: '0', queryKey: 'people' },
              personId: '0',
            }),
            query: [['name'], ['age']],
          },
          {
            name: 'Alya',
            age: 32,
            env: expect.objectContaining({
              parentEnv: { personId: '1', queryKey: 'people' },
              personId: '1',
            }),
            query: [['name'], ['age']],
          },
        ],
        env: expect.anything(),
        query,
      })
    })
  })
  describe('mapDelta', () => {
    it('finds minimal X such that {...map1, ...X} equals {...map1, ...map2}', () => {
      expect(mapDelta({a:1},{b:2})).toEqual({b:2})
      expect(mapDelta({a:1},{a:2, b:2})).toEqual({a:2, b:2})
      expect(mapDelta({a:1, b:2},{a:2, b:2})).toEqual({a:2})
      expect(mapDelta({a:1},{a:1})).toEqual({})
      
      
    })
  })
  describe('makeRootQuery', () => {
    it(`if at the root level and the environment is empty, evaluates to itself`, () => {
      expect(makeRootQuery({}, [['foo']])).toEqual([['foo']])
    })
    it(`if the 'bar' parser set an env variable of id=55, need to add that to the root query`, () => {
      expect(makeRootQuery({parentEnv: {queryKey: 'bar', id: 55}}, [['foo']])).toEqual([['bar', {id: 55}, ['foo']]])
    })
    it(`if the environment has nested parent environments, all env variables end up in the query, but with duplication removed`, () => {
      expect(makeRootQuery({parentEnv: {queryKey: 'bar',
                                        parentEnv: {queryKey: 'baz',
                                                    idB: 66,
                                                    idA: 77},
                                        idA: 55,
                                        idB: 66,
                                       }},
                            [['foo']]
                           )).toEqual(
                             [
                               ['baz', {idB: 66, idA: 77},
                                ['bar', {idA: 55}, ['foo']]]])
    })
  })
  describe('transact', () => {

    beforeEach(() => {

    })
  })
})
