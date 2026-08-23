/**
 * Controls the session that route handlers see.
 *
 * Route handlers call `getSessionSafe()` from `@auth`; integration tests mock
 * that module (see `setup/external-mocks.ts`) to read from this store, so a
 * test can switch identity with `signInAs()` without re-mocking anything.
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
