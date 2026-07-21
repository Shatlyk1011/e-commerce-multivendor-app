'use client'

import { Copy, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductSharePopover() {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Ссылка скопирована')
    } catch {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  const handleTelegramShare = async () => {
    const popupWidth = 640
    const popupHeight = 700
    const popupLeft = Math.max(0, window.screenX + (window.outerWidth - popupWidth) / 2)
    const popupTop = Math.max(0, window.screenY + (window.outerHeight - popupHeight) / 2)
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`
    const telegramWindow = window.open(
      telegramUrl,
      'telegram-share',
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${Math.round(popupLeft)},top=${Math.round(popupTop)}`,
    )

    if (telegramWindow) {
      telegramWindow.opener = null
      return
    }

    try {
      await navigator.clipboard.writeText(telegramUrl)
      toast.warning('Не удалось открыть окно Telegram. Ссылка скопирована.')
    } catch {
      toast.error('Не удалось открыть окно Telegram и скопировать ссылку')
    }
  }

  return (
    <div
      role="menu"
      className="bg-apple-canvas border-apple-hairline rounded-apple-md pointer-events-none invisible absolute top-full right-0 z-20 mt-2 min-w-48 border p-1 opacity-0 shadow-lg transition-all duration-150 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
    >
      <button
        type="button"
        role="menuitem"
        onClick={handleCopyLink}
        className="text-apple-ink hover:bg-apple-canvas-parchment rounded-apple-sm flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left text-[13px] font-medium transition-colors"
      >
        <Copy className="text-apple-ink-muted-48 size-4" />
        <span>Скопировать ссылку</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={handleTelegramShare}
        className="text-apple-ink hover:bg-apple-canvas-parchment rounded-apple-sm flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left text-[13px] font-medium transition-colors"
      >
        <Send className="text-apple-ink-muted-48 size-4" />
        <span>Поделиться в Telegram</span>
      </button>
    </div>
  )
}
