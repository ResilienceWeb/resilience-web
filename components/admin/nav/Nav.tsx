'use client'
import { useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSession, signOut } from 'next-auth/react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { BsPersonCircle } from 'react-icons/bs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import GetInTouchButton from '@components/feedback-dialog/GetInTouchButton'

const WebSelector = dynamic(() => import('./web-selector'))

const Nav = ({ onOpen }) => {
  const { data: session } = useSession()

  const handleSignOut = useCallback(() => {
    signOut()
  }, [])

  return (
    <div className="flex-1 max-w-[100vw] bg-[#fafafa] px-4 border-b border-gray-200">
      <div className="flex h-16 items-center justify-between">
        <button
          onClick={onOpen}
          className="lg:hidden mr-4 p-2 rounded-md border border-gray-300 hover:bg-gray-100"
          aria-label="open menu"
        >
          <RxHamburgerMenu className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-between w-full">
          <div className="mr-4">
            <WebSelector />
          </div>

          <div className="flex gap-4">
            <GetInTouchButton />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full text-gray-600 hover:text-gray-900">
                  <BsPersonCircle className="h-8 w-8" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session?.user.email && (
                  <>
                    <DropdownMenuLabel className="text-xs text-gray-600">
                      Signed in as {session.user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/user-settings">User settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nav
