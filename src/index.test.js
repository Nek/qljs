import { mount, clearRegistry, parseQueryIntoMap, parseChildren, multimethod } from './index'


const dispatch = ([first]) => first
const noMatch = term => {
  throw new Error('No match for ' + term)
}

let read = multimethod(dispatch)
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

describe('ql', () => {
  let state

  beforeEach(() => {
    state = {
      people: {
        0: { name: 'Nik', age: 37 },
        1: { name: 'Alya', age: 32 },
      },
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
})
