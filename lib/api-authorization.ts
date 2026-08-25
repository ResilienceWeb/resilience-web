/**
 * Web-scoped authorization for the route handlers under `app/api`. A session
 * answers "who is this", not "may they write to *this* web".
 *
 * The guards return a `Response` when the caller is not allowed and `null` when
 * they are, so a handler reads:
 *
 *   const denied = await requireWebEditor(request, webId)
 *   if (denied) return denied
 *
 * A global admin (Better Auth's `role === 'admin'`) passes every check.
 */
import type { NextRequest } from 'next/server'
import { getSessionSafe } from '@auth'
import { canUserEditWeb, isUserOwnerOfWeb } from '@db/webAccessRepository'

export interface Caller {
  id: string
  email: string
  name?: string | null
  role?: string
}

export async function getCaller(request: NextRequest): Promise<Caller | null> {
  const session = await getSessionSafe(request.headers)
  return session?.user ?? null
}

const forbidden = () =>
  Response.json(
    { error: "You don't have enough permissions to perform this action." },
    { status: 403 },
  )

export async function callerCanEditWeb(
  caller: Caller | null,
  webId: number,
): Promise<boolean> {
  if (!caller?.email || !Number.isInteger(webId)) {
    return false
  }
  if (caller.role === 'admin') {
    return true
  }
  return canUserEditWeb(caller.email, webId)
}

export async function callerOwnsWeb(
  caller: Caller | null,
  webId: number,
): Promise<boolean> {
  if (!caller?.email || !Number.isInteger(webId)) {
    return false
  }
  if (caller.role === 'admin') {
    return true
  }
  return isUserOwnerOfWeb(caller.email, webId)
}

export async function requireWebEditor(
  request: NextRequest,
  webId: number,
): Promise<Response | null> {
  const caller = await getCaller(request)
  return (await callerCanEditWeb(caller, webId)) ? null : forbidden()
}

export async function requireWebOwner(
  request: NextRequest,
  webId: number,
): Promise<Response | null> {
  const caller = await getCaller(request)
  return (await callerOwnsWeb(caller, webId)) ? null : forbidden()
}
