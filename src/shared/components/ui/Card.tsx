'use client'

import { cn } from '@/shared/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-white border border-gray-200 p-4 shadow-sm',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
