module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
      "^.+\\.(t|j)sx?$": "ts-jest"
  },
  verbose: true,
  coverageReporters: ['lcov']
};
