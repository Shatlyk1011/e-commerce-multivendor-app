import { FC, ReactNode, useRef } from 'react'

import { useClickOutside } from '@/hooks/use-click-outside'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  onClickOutside: () => void
  classes?: string
}

const OnClickOutside: FC<Props> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useClickOutside(wrapperRef, onClickOutside)

  return (
    <div ref={wrapperRef} className={cn(classes)}>
      {children}
    </div>
  )
}

export default OnClickOutside
