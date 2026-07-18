import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { code: 'TM', name: 'Туркменистан' },
  { code: 'TR', name: 'Турция' },
  { code: 'UZ', name: 'Узбекистан' },
  { code: 'CN', name: 'Китай' },
  { code: 'DE', name: 'Германия' },
  { code: 'US', name: 'США' },
]

export const STEPS_INFO = [
  { step: 1, label: 'Описание', desc: 'Основные параметры' },
  { step: 2, label: 'Медиа', desc: 'Загрузка изображений' },
  { step: 3, label: 'Характеристики', desc: 'Дополнительные свойства' },
] as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductOption {
  title: string
  values: string[]
  inputValue: string // temporary for adding tags
}

export interface ProductVariant {
  title: string
  options: Record<string, string>
  sku: string
  barcode: string
  price: string // in TMT (decimal)
}

export type FieldErrors = Record<string, string>

// ─── Schemas ──────────────────────────────────────────────────────────────────

const productOptionSchema = z.object({
  title: z.string().trim().min(1, 'Укажите название характеристики.'),
  values: z
    .array(z.string().trim().min(1, 'Значение характеристики не может быть пустым.'))
    .min(1, 'Добавьте значение характеристики.'),
})

const productVariantSchema = z.object({
  title: z.string().trim().min(1, 'Укажите название варианта.'),
  options: z.record(z.string(), z.string()),
  sku: z.string().trim().max(255, 'SKU не может быть длиннее 255 символов.'),
  barcode: z.string().trim().max(255, 'Штрихкод не может быть длиннее 255 символов.'),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Укажите цену с точностью до двух знаков.')
    .refine((value) => Number(value) > 0, 'Цена должна быть больше нуля.'),
})

export const stepOneSchema = z.object({
  title: z.string().trim().min(1, 'Укажите название товара.'),
  category: z.string().trim().min(1, 'Выберите категорию.'),
  tags: z
    .array(z.string().trim().min(1, 'Тег не может быть пустым.').max(64, 'Тег не может быть длиннее 64 символов.'))
    .max(20, 'Можно добавить не более 20 ключевых слов.'),
})

export const stepTwoSchema = z.object({
  thumbnail: z.string().url('Загрузите корректное главное изображение.'),
  images: z
    .array(z.string().url('Галерея содержит некорректный URL изображения.'))
    .max(10, 'Можно добавить не более 10 изображений.'),
})

export const stepThreeSchema = z
  .object({
    options: z.array(productOptionSchema),
    variants: z.array(productVariantSchema),
    weight: z.string(),
    length: z.string(),
    width: z.string(),
    height: z.string(),
  })
  .superRefine((value, context) => {
    const configuredOptions = value.options.filter((option) => option.title.trim() && option.values.length)

    if (configuredOptions.length && !value.variants.length) {
      context.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'Сгенерируйте варианты для добавленных характеристик.',
      })
    }

    for (const [field, input] of Object.entries({
      weight: value.weight,
      length: value.length,
      width: value.width,
      height: value.height,
    })) {
      if (input && (!Number.isFinite(Number(input)) || Number(input) <= 0)) {
        context.addIssue({ code: 'custom', path: [field], message: 'Введите положительное число.' })
      }
    }
  })

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getFieldErrors(error: z.ZodError): FieldErrors {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join('.'), issue.message]))
}

export function slugify(text: string) {
  const rus: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }
  return text
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      return rus[lower] !== undefined ? rus[lower] : lower
    })
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
