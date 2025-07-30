import '@testing-library/jest-dom'

import { installGlobals } from '@remix-run/node'

installGlobals()

// @ts-expect-error @typescript-eslint/no-explicit-any
globalThis.IS_REACT_ACT_ENVIRONMENT = true
