// import { getServerSession } from "next-auth/next"

import { auth as getServerSession } from '../app/auth'

export async function getCurrentUser() {
  const session = await getServerSession()

  return session?.user
}
