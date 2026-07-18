export const productStatus: Record<string, { label: string; className: string }> = {
  published: {
    label: 'Опубликован',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  draft: {
    label: 'В модерации',
    className: 'border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-48',
  },
}
