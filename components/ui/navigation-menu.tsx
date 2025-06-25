import * as React from 'react'
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui'
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'

import { cn } from '@components/lib/utils'

const NavigationMenu = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>) => (
  <NavigationMenuPrimitive.Root
    className={cn(
      'relative z-10 flex max-w-max flex-1 items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
)
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>) => (
  <NavigationMenuPrimitive.List
    className={cn(
      'group flex flex-1 list-none items-center justify-center space-x-1',
      className,
    )}
    {...props}
  />
)
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-md font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50',
)

const NavigationMenuTrigger = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>) => (
  <NavigationMenuPrimitive.Trigger
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
)
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>) => (
  <NavigationMenuPrimitive.Content
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto',
      className,
    )}
    {...props}
  />
)
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className,
      )}
      {...props}
    />
  </div>
)
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>) => (
  <NavigationMenuPrimitive.Indicator
    className={cn(
      'top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
)
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
