import { setupServer } from 'msw/node'
import { handlers } from './handlers.ts'

/**
 * One server for the whole component suite, started and reset by
 * `test/setup/components.ts`.
 */
export const server = setupServer(...handlers)
