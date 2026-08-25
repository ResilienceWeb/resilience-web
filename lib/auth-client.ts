import { adminClient, emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from '@auth'

export const authClient = createAuthClient({
  plugins: [adminClient(), emailOTPClient()],
})

/**
 * The session as the browser sees it.
 *
 * Better Auth types its client by walking the server's route table, and each
 * step of that walk tests an endpoint's `options.metadata` against shapes like
 * `{ isAction: false }`. With `strictNullChecks` off (see tsconfig.json) an
 * absent `metadata` satisfies every one of those shapes, so all the endpoints
 * are discarded as non-callable and `authClient.useSession().data` collapses
 * to `never`. The server instance infers the same session — plugin fields and
 * all — without going through the route table, so take the shape from there.
 */
export type Session = typeof auth.$Infer.Session

export type AUTH_ERROR_CODE = keyof typeof authClient.$ERROR_CODES

export const ERROR_MESSAGES: Partial<Record<AUTH_ERROR_CODE, string>> = {
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_EMAIL: 'The email address is invalid.',
  USER_NOT_FOUND: 'No account found with this email address.',
  FAILED_TO_CREATE_USER:
    'Unable to create your account. Please try again or contact support.',
  USER_ALREADY_EXISTS:
    'An account with this email already exists. Please sign in instead.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'This email is already registered. Please use a different email or sign in.',
  FAILED_TO_CREATE_SESSION:
    'Unable to create your session. Please try again or contact support.',
  FAILED_TO_UPDATE_USER:
    'Unable to update your account. Please try again or contact support.',
  FAILED_TO_GET_SESSION:
    'Unable to retrieve your session. Please try signing in again.',
  INVALID_PASSWORD: 'The password you entered is incorrect.',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password. Please try again.',
  SOCIAL_ACCOUNT_ALREADY_LINKED:
    'This social account is already linked to another user.',
  PROVIDER_NOT_FOUND:
    'Authentication provider not found. Please try a different sign-in method.',
  ID_TOKEN_NOT_SUPPORTED:
    'This authentication method is not supported. Please try a different sign-in method.',
  FAILED_TO_GET_USER_INFO:
    'Unable to retrieve your account information. Please try again.',
  USER_EMAIL_NOT_FOUND:
    'No email address found for this account. Please contact support.',
  EMAIL_NOT_VERIFIED:
    'Please verify your email address before signing in. Check your inbox for a verification link.',
  PASSWORD_TOO_SHORT:
    'Password is too short. Please use at least 8 characters.',
  PASSWORD_TOO_LONG:
    'Password is too long. Please use fewer than 128 characters.',
  EMAIL_CAN_NOT_BE_UPDATED:
    'Unable to update your email address. Please contact support.',
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    'No password-based account found. Please sign in using a different method.',
  FAILED_TO_UNLINK_LAST_ACCOUNT:
    'Cannot remove your last sign-in method. Please add another method first.',
  ACCOUNT_NOT_FOUND:
    'Account not found. Please check your details and try again.',
  USER_ALREADY_HAS_PASSWORD:
    'This account already has a password set. Please sign in with your password.',
  INVALID_OTP: 'Invalid code. Please check and try again.',
  OTP_EXPIRED: 'This code has expired. Please request a new one.',
}

export const { signIn, signOut } = authClient

export const useSession: () => Omit<
  ReturnType<typeof authClient.useSession>,
  'data'
> & { data: Session | null } = authClient.useSession
