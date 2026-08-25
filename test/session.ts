/**
 * Controls who is signed in, for both test suites.
 *
 * Route handlers call `getSessionSafe()` from `@auth`, and components call
 * `useSession()` from `@auth-client`. Each suite's setup file mocks its own
 * side to read from this store, so either kind of test switches identity with
 * `signInAs()` without re-mocking anything.
 */

export interface TestSessionUser {
  id: string
  email: string
  name?: string | null
  /** Better Auth's global role — 'admin' unlocks the admin-only endpoints. */
  role?: string
}

export const sessionStore: { current: { user: TestSessionUser } | null } = {
  current: null,
}

export function signInAs(user: TestSessionUser) {
  sessionStore.current = { user }
}

export function signOut() {
  sessionStore.current = null
}
