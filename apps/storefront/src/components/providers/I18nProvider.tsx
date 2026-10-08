'use client'

import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'

import { LOCALE_COOKIE, type Locale, translate } from '@/lib/i18n'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (source: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)
const translatedAttributes = ['aria-label', 'alt', 'placeholder', 'title'] as const

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const textSources = useRef(new WeakMap<Text, { source: string; rendered: string }>())
  const attributeSources = useRef(new WeakMap<Element, Map<string, { source: string; rendered: string }>>())

  const setLocale = (nextLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    setLocaleState(nextLocale)
  }

  useLayoutEffect(() => {
    document.documentElement.lang = locale

    const ignored = (element: Element | null) =>
      !!element?.closest('script, style, noscript, code, pre, [contenteditable="true"], [data-i18n-ignore]')

    const updateText = (node: Text) => {
      if (ignored(node.parentElement)) return
      const current = node.textContent ?? ''
      const previous = textSources.current.get(node)
      const source = previous && current === previous.rendered ? previous.source : current
      const rendered = translate(source, locale)
      textSources.current.set(node, { source, rendered })
      if (current !== rendered) node.textContent = rendered
    }

    const updateAttributes = (element: Element) => {
      if (ignored(element)) return
      let sources = attributeSources.current.get(element)
      for (const attribute of translatedAttributes) {
        const current = element.getAttribute(attribute)
        if (current === null) continue
        if (!sources) {
          sources = new Map()
          attributeSources.current.set(element, sources)
        }
        const previous = sources.get(attribute)
        const source = previous && current === previous.rendered ? previous.source : current
        const rendered = translate(source, locale)
        sources.set(attribute, { source, rendered })
        if (rendered !== current) element.setAttribute(attribute, rendered)
      }
    }

    const updateTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        updateText(root as Text)
        return
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return
      const element = root as Element
      if (ignored(element)) return
      updateAttributes(element)
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        if (walker.currentNode.nodeType === Node.TEXT_NODE) updateText(walker.currentNode as Text)
        else updateAttributes(walker.currentNode as Element)
      }
    }

    updateTree(document.documentElement)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') updateText(mutation.target as Text)
        else if (mutation.type === 'attributes') updateAttributes(mutation.target as Element)
        else for (const node of mutation.addedNodes) updateTree(node)
      }
    })
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    })
    return () => observer.disconnect()
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: (source) => translate(source, locale) }}>
      {children}
    </I18nContext.Provider>
  )
}
