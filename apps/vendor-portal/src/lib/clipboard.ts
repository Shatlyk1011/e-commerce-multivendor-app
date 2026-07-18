/**
 * Copies the given text to the system clipboard.
 * Falls back to `document.execCommand` for browsers that don't support
 * the modern Clipboard API (e.g. older mobile WebViews).
 */
export const copyToClipboard = async (textToCopy: string): Promise<void> => {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(textToCopy)
  } else {
    document.execCommand('copy', true, textToCopy)
  }
}
