import { type Config } from 'jest'

const config: Config = {
  roots: ['<rootDir>'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    '<rootDir>/modules/**/*.ts',
    '!<rootDir>/modules/**/*.module.ts',
    '!<rootDir>/main.ts'
  ],
  coverageDirectory: '../build/coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  passWithNoTests: true
}

export default config
