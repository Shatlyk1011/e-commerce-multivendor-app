import turkmen from './locales/tk.json'

export type Locale = 'ru' | 'tk'

export const LOCALE_COOKIE = 'storefront_locale'

export function isLocale(value: string | undefined): value is Locale {
  return value === 'ru' || value === 'tk'
}

export function intlLocale(locale: Locale): string {
  return locale === 'tk' ? 'tk-TM' : 'ru-RU'
}

const translations: Record<string, string> = turkmen
const phrases = Object.entries(translations).sort((a, b) => b[0].length - a[0].length)

export function translate(source: string, locale: Locale): string {
  if (locale === 'ru' || !/[А-Яа-яЁё]/.test(source)) return source

  const normalized = source.replace(/\s+/g, ' ').trim()
  const searchResults = normalized.match(/^Результаты поиска по запросу «(.+)»$/)
  if (searchResults) return `«${searchResults[1]}» gözlegi boýunça netijeler`

  const rating = normalized.match(/^Оценка (\d+(?:[.,]\d+)?) из 5(?: на основе (\d+) отзывов)?$/)
  if (rating) return rating[2] ? `Baha: 5-den ${rating[1]}, ${rating[2]} syn` : `Baha: 5-den ${rating[1]}`

  const storeRating = normalized.match(/^Оценка магазина (\d+(?:[.,]\d+)?) из 5, отзывов: (\d+)$/)
  if (storeRating) return `Dükanyň bahasy: 5-den ${storeRating[1]}, synlaryň sany: ${storeRating[2]}`

  const setRating = normalized.match(/^Поставить (\d+) из 5$/)
  if (setRating) return `5-den ${setRating[1]} baha bermek`

  const translated = translations[normalized]
  if (translated) {
    const leading = source.match(/^\s*/)?.[0] ?? ''
    const trailing = source.match(/\s*$/)?.[0] ?? ''
    return `${leading}${translated}${trailing}`
  }

  // React can render interpolated values as one text node (for example, "Заказ #123").
  // Translate the static phrases around those values without changing the values themselves.
  let result = source
  for (const [russian, turkmen] of phrases) {
    if (russian.length < 5 || !result.includes(russian)) continue
    result = result.replaceAll(russian, turkmen)
  }
  return result
}
