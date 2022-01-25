/* eslint-disable no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      admin: boolean;
      id: string;
      name?: string;
      email?: string;
      image?: string;
    }
  }

  interface User {
      admin: boolean;
  }
}