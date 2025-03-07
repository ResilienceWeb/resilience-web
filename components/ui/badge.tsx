import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@components/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm',
        outline: 'text-foreground',
      },
      clickable: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        clickable: true,
        variant: 'default',
        className: 'hover:bg-primary/80 cursor-pointer',
      },
      {
        clickable: true,
        variant: 'secondary',
        className: 'hover:bg-secondary/80 cursor-pointer',
      },
      {
        clickable: true,
        variant: 'destructive',
        className: 'hover:bg-destructive/80 cursor-pointer',
      },
    ],
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  clickable?: boolean
}

function Badge({ className, variant, clickable, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, clickable }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
