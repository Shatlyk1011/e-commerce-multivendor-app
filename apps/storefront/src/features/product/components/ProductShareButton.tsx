'use client'

import * as React from 'react'

import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

const ProductSharePopover = React.lazy(() => import('./ProductSharePopover'))

export function ProductShareButton() {
  const [isPopoverLoaded, setIsPopoverLoaded] = React.useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsPopoverLoaded(true)}
      onFocusCapture={() => setIsPopoverLoaded(true)}
    >
      <Button type="button" variant="ghost" size="xs" aria-haspopup="menu">
        <Share2 className="size-4" />
        <span>Поделиться</span>
      </Button>
      {isPopoverLoaded && (
        <React.Suspense fallback={null}>
          <ProductSharePopover />
        </React.Suspense>
      )}
    </div>
  )
}
