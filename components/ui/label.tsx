'use client'

import * as React from 'react'
import { Label as LabelPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@components/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

const Label = ({ 
  className, 
  ...props 
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & 
  VariantProps<typeof labelVariants>) => (
  <LabelPrimitive.Root
    className={cn(labelVariants(), className)}
    {...props}
  />
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
