export const flatten = (acc, val) => [...acc, ...val]
export const extractJson = body => body.json()
export const zip = (a1, a2) => a1.map((x, i) => [x, a2[i]])
