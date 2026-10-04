'use client'

import type { ResponsiveBones } from 'boneyard-js'
import { Skeleton as BonesSkeleton } from 'boneyard-js/react'
import { AlertCircle, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const accountPageBones: ResponsiveBones = {
  breakpoints: {
    0: {
      name: 'account-page',
      viewportWidth: 375,
      width: 375,
      height: 520,
      bones: [
        [0, 0, 42, 28, 8],
        [0, 40, 78, 16, 6],
        [0, 80, 100, 190, 18],
        [20, 100, 11, 40, '50%'],
        [20, 156, 62, 16, 6],
        [20, 184, 92, 16, 6],
        [20, 212, 72, 16, 6],
        [20, 244, 36, 44, 999],
        [0, 294, 100, 190, 18],
        [20, 314, 11, 40, '50%'],
        [20, 370, 62, 16, 6],
        [20, 398, 92, 16, 6],
        [20, 426, 72, 16, 6],
        [20, 458, 36, 44, 999],
      ],
    },
    640: {
      name: 'account-page',
      viewportWidth: 800,
      width: 800,
      height: 330,
      bones: [
        [0, 0, 22, 28, 8],
        [0, 40, 42, 16, 6],
        [0, 80, 48.75, 210, 18],
        [2.5, 100, 5, 40, '50%'],
        [2.5, 156, 31, 16, 6],
        [2.5, 184, 43, 16, 6],
        [2.5, 212, 35, 16, 6],
        [2.5, 242, 18, 44, 999],
        [51.25, 80, 48.75, 210, 18],
        [53.75, 100, 5, 40, '50%'],
        [53.75, 156, 31, 16, 6],
        [53.75, 184, 43, 16, 6],
        [53.75, 212, 35, 16, 6],
        [53.75, 242, 18, 44, 999],
      ],
    },
  },
}

function AccountPageSkeletonFixture({ cards }: { cards: number }) {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-7 w-52" />
        <div className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="rounded-apple-lg h-[190px] border p-5">
            <div className="size-10 rounded-full" />
            <div className="mt-5 h-4 w-2/3" />
            <div className="mt-3 h-4 w-full" />
            <div className="mt-2 h-4 w-4/5" />
            <div className="mt-5 h-11 w-32 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccountPageSkeleton({ cards = 2 }: { cards?: number }) {
  const fixture = <AccountPageSkeletonFixture cards={cards} />

  return (
    <BonesSkeleton
      loading
      name="account-page"
      initialBones={accountPageBones}
      fixture={fixture}
      animate="shimmer"
      color="#e6e8ec"
      className="w-full"
    >
      {fixture}
    </BonesSkeleton>
  )
}

export function AccountPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="items-center p-8 text-center" role="alert">
      <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
        <AlertCircle className="size-5" />
      </div>
      <h1 className="text-apple-ink mt-4 text-lg font-semibold">Не удалось загрузить данные</h1>
      <p className="text-apple-ink-muted-48 mt-1 max-w-sm text-sm">Проверьте подключение и попробуйте ещё раз.</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-5 min-h-11">
        <RotateCcw className="size-4" /> Повторить
      </Button>
    </Card>
  )
}
