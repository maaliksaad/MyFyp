import { type Config } from 'jest'

const config: Config = {
  roots: ['<rootDir>/../e2e'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: String.raw`/e2e/.*\.(e2e.test|e2e.spec).(ts|tsx|js)$`,
  collectCoverageFrom: ['/**/*.{js,jsx,tsx,ts}', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/../../coverage',
  coverageReporters: ['json', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1'
  },
  passWithNoTests: true
}

export default config
