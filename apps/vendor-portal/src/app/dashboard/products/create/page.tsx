'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip } from '@/components/ui/tooltip'
import { medusa } from '@/lib/medusa'

// Categories requested
const MOCK_CATEGORIES = [
  { id: 'cat_electronics', name: 'Электроника' },
  { id: 'cat_clothing', name: 'Одежда и Обувь' },
  { id: 'cat_home', name: 'Дом и Кухня' },
  { id: 'cat_books', name: 'Книги' },
  { id: 'cat_sports', name: 'Спорт и Отдых' },
]

// Origin Countries
const COUNTRIES = [
  { code: 'TM', name: 'Туркменистан' },
  { code: 'TR', name: 'Турция' },
  { code: 'UZ', name: 'Узбекистан' },
  { code: 'CN', name: 'Китай' },
  { code: 'DE', name: 'Германия' },
  { code: 'US', name: 'США' },
]

interface ProductOption {
  title: string
  values: string[]
  inputValue: string // temporary for adding tags
}

interface ProductVariant {
  title: string
  options: Record<string, string>
  sku: string
  barcode: string
  manage_inventory: boolean
  inventory_quantity: number
  price: string // in TMT (decimal)
}

function slugify(text: string) {
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

export default function CreateProductPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. General state (Step 1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(MOCK_CATEGORIES[0].id)
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // 2. Media state (Step 2)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  // 3. Dimensions & Logistics (Step 3)
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [originCountry, setOriginCountry] = useState('TM')
  const [material, setMaterial] = useState('')

  // 4. Options & Variants state (Step 3)
  const [options, setOptions] = useState<ProductOption[]>([
    { title: 'Размер', values: ['S', 'M', 'L'], inputValue: '' },
  ])
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Handle parsing tags on comma/enter
  const handleAddTag = () => {
    const trimmed = tagsInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagsInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Handle thumbnail preview upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnail(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle gallery image upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Options Handlers
  const addOption = () => {
    setOptions([...options, { title: '', values: [], inputValue: '' }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOptionTitle = (index: number, title: string) => {
    const updated = [...options]
    updated[index].title = title
    setOptions(updated)
  }

  const addOptionValue = (index: number) => {
    const option = options[index]
    const val = option.inputValue.trim()
    if (val && !option.values.includes(val)) {
      const updated = [...options]
      updated[index].values = [...option.values, val]
      updated[index].inputValue = ''
      setOptions(updated)
    }
  }

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const updated = [...options]
    updated[optIndex].values = updated[optIndex].values.filter((_, i) => i !== valIndex)
    setOptions(updated)
  }

  // Generate Cartesian Product of Option values for Variants
  const generateVariants = () => {
    const validOptions = options.filter((o) => o.title.trim() !== '' && o.values.length > 0)

    if (validOptions.length === 0) {
      toast.warning('Добавьте хотя бы одну характеристику с ее значениями.')
      return
    }

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce(
        (acc, curr) => {
          return acc.flatMap((d) => curr.map((e) => [...d, e]))
        },
        [[]] as string[][],
      )
    }

    const valueArrays = validOptions.map((o) => o.values)
    const combinations = cartesian(valueArrays)

    const generated: ProductVariant[] = combinations.map((combo) => {
      const optionMap: Record<string, string> = {}
      validOptions.forEach((opt, idx) => {
        optionMap[opt.title] = combo[idx]
      })

      const variantTitle = combo.join(' / ')
      return {
        title: variantTitle,
        options: optionMap,
        sku: `${slugify(title)}-${combo.map((c) => slugify(c)).join('-')}`,
        barcode: '',
        manage_inventory: true,
        inventory_quantity: 10,
        price: '150.00', // Default TMT price
      }
    })

    setVariants(generated)
    toast.success(`Сгенерировано ${generated.length} вариантов товара.`)
  }

  const updateVariant = <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => {
    const updated = [...variants]
    updated[index][key] = value
    setVariants(updated)
  }

  // Next / Back buttons check
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error('Заполните название товара')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!thumbnail.trim()) {
        toast.error('Главное изображение (миниатюра) обязательно для заполнения')
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Required check
    if (!title.trim()) {
      setCurrentStep(1)
      toast.error('Заполните название товара')
      return
    }

    if (!thumbnail.trim()) {
      setCurrentStep(2)
      toast.error('Главное изображение обязательно')
      return
    }

    // Verify variants details if variants were generated
    if (variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const priceVal = parseFloat(variants[i].price)
        if (isNaN(priceVal) || priceVal <= 0) {
          toast.error(`Укажите корректную цену для варианта "${variants[i].title}"`)
          return
        }
      }
    }

    setIsSubmitting(true)

    // Form final payload mapping variants or adding a single default variant if custom ones aren't defined
    const processedVariants =
      variants.length > 0
        ? variants.map((v) => ({
            title: v.title,
            options: v.options,
            sku: v.sku.trim() || null,
            barcode: v.barcode.trim() || null,
            manage_inventory: v.manage_inventory,
            inventory_quantity: v.manage_inventory ? Number(v.inventory_quantity) : undefined,
            prices: [
              {
                currency_code: 'tmt',
                amount: Math.round(parseFloat(v.price) * 100),
              },
            ],
          }))
        : [
            {
              title: 'Standard',
              options: {},
              sku: `${slugify(title)}-default`,
              prices: [
                {
                  currency_code: 'tmt',
                  amount: 15000, // 150 TMT standard fallback price
                },
              ],
            },
          ]

    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const generatedHandle = `${slugify(title.trim())}-${randomDigits}`

    const payload = {
      title: title.trim(),
      handle: generatedHandle,
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      images: images.map((url) => ({ url })),
      status: 'draft',
      categories: [{ id: category }],
      tags: tags.map((t) => ({ id: `tag_${slugify(t)}` })),
      options:
        variants.length > 0
          ? options
              .filter((o) => o.title.trim() !== '' && o.values.length > 0)
              .map((o) => ({
                title: o.title.trim(),
                values: o.values,
              }))
          : [],
      variants: processedVariants,
      weight: weight ? parseFloat(weight) : null,
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      origin_country: originCountry,
      material: material.trim() || null,
    }

    try {
      const response = await medusa.client.fetch('/vendors/products', {
        method: 'POST',
        body: payload,
      })

      toast.success('Товар успешно создан!', {
        description: 'Ваш товар отправлен на модерацию в качестве черновика.',
      })
      router.push('/dashboard/products')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error creating product:', err)
      toast.error('Не удалось создать товар', {
        description: err.message || 'Внутренняя ошибка сервера.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepsInfo = [
    { step: 1, label: 'Описание', desc: 'Основные параметры' },
    { step: 2, label: 'Медиа', desc: 'Загрузка изображений' },
    { step: 3, label: 'Характеристики', desc: 'Дополнительные свойства' },
  ]

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-4xl">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/products"
            className="text-apple-primary text-apple-button-utility mb-4 inline-flex items-center font-medium hover:underline"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Назад к товарам
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-apple-display-md text-apple-ink font-semibold tracking-tight">Новый товар</h1>
              <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
                Пошаговое заполнение карточки товара. Поля с меткой * обязательны.
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator Header (Apple Styling) */}
        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg mb-8 border p-6 shadow-xs">
          <div className="relative flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
            {stepsInfo.map((info, idx) => (
              <React.Fragment key={info.step}>
                <div className="z-10 flex items-center gap-3">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full border text-[14px] font-semibold transition-colors ${
                      currentStep === info.step
                        ? 'bg-apple-primary text-apple-on-primary border-apple-primary'
                        : currentStep > info.step
                          ? 'border-green-200 bg-green-50 text-green-600'
                          : 'bg-apple-canvas-parchment text-apple-ink-muted-48 border-apple-hairline'
                    }`}
                  >
                    {currentStep > info.step ? <Check className="size-4" /> : info.step}
                  </div>
                  <div>
                    <h3 className="text-apple-ink text-[14px] font-semibold tracking-tight">{info.label}</h3>
                    <p className="text-apple-ink-muted-48 mt-0.5 text-[11px] leading-none">{info.desc}</p>
                  </div>
                </div>
                {idx < stepsInfo.length - 1 && <div className="bg-apple-hairline mx-4 h-px flex-1 max-sm:hidden" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: GENERAL (Required fields - text details) */}
          {currentStep === 1 && (
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg animate-fade-in space-y-6 border p-8 shadow-xs max-md:p-5">
              <div className="border-apple-divider-soft border-b pb-4">
                <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 1: Основное описание</h2>
                <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                  Укажите ключевые текстовые параметры вашего товара.
                </p>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="title">
                    Название товара <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Понятное название товара, например 'Смартфон Apple iPhone 15 Pro Max'" />
                </div>
                <Input
                  id="title"
                  placeholder="Введите название..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="description">Описание товара</Label>
                  <Tooltip content="Описание товара с его свойствами и преимуществами." />
                </div>
                <Textarea
                  id="description"
                  placeholder="Расскажите покупателям об этом товаре..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="category">
                    Категория <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Выберите подходящую категорию для размещения товара в каталоге." />
                </div>
                <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {MOCK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Tags Structure */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="tags">Теги / Поисковые слова</Label>
                  <Tooltip content="Помогут покупателям находить товар через поиск. Введите тег и нажмите Enter или запятую." />
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Например: новинка, премиум"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-10" onClick={handleAddTag}>
                    Добавить
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-[13px] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleRemoveTag(tag)}
                        title="Нажмите, чтобы удалить"
                      >
                        {tag}
                        <Trash2 className="size-3 shrink-0 opacity-60" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: MEDIA (Required main image thumbnail, optional gallery) */}
          {currentStep === 2 && (
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg animate-fade-in space-y-6 border p-8 shadow-xs max-md:p-5">
              <div className="border-apple-divider-soft border-b pb-4">
                <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 2: Изображения товара</h2>
                <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                  Добавьте обязательное главное изображение и дополнительные снимки галереи.
                </p>
              </div>

              {/* Thumbnail URL / Upload */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label>
                    Главное изображение (Миниатюра) <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Основное изображение, которое выводится на витрине каталога. Обязательно к заполнению." />
                </div>
                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex flex-col items-center justify-center border p-4 text-center">
                    <input
                      type="file"
                      id="thumb-file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                    />
                    <label
                      htmlFor="thumb-file"
                      className="text-apple-ink hover:text-apple-primary text-apple-caption-strong flex cursor-pointer flex-col items-center gap-2 transition-colors"
                    >
                      <Upload className="text-apple-ink-muted-48 size-8" />
                      <span>Загрузить изображение</span>
                      <span className="text-apple-ink-muted-48 text-[11px] font-normal">PNG, JPG до 5MB</span>
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="thumb-url" className="text-apple-ink-muted-48 text-[13px]">
                      Или вставьте URL-ссылку:
                    </Label>
                    <Input
                      id="thumb-url"
                      placeholder="https://example.com/image.jpg"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                    />
                  </div>
                </div>

                {thumbnail && (
                  <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative w-32 border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="rounded-apple-sm h-24 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnail('')}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images (Optional) */}
              <div className="border-apple-divider-soft space-y-4 border-t pt-6">
                <div className="flex items-center">
                  <Label>Галерея дополнительных изображений (Опционально)</Label>
                  <Tooltip content="Дополнительные ракурсы товара для карточки товара на детальном просмотре." />
                </div>
                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex flex-col items-center justify-center border p-4 text-center">
                    <input
                      type="file"
                      id="gallery-files"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                    <label
                      htmlFor="gallery-files"
                      className="text-apple-ink hover:text-apple-primary text-apple-caption-strong flex cursor-pointer flex-col items-center gap-2 transition-colors"
                    >
                      <Upload className="text-apple-ink-muted-48 size-8" />
                      <span>Загрузить файлы</span>
                      <span className="text-apple-ink-muted-48 text-[11px] font-normal">Можно выбрать несколько</span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="gallery-url" className="text-apple-ink-muted-48 text-[13px] font-medium">
                      Или добавить одну ссылку:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="gallery-url"
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const trimmed = newImageUrl.trim()
                          if (trimmed && !images.includes(trimmed)) {
                            setImages([...images, trimmed])
                            setNewImageUrl('')
                          }
                        }}
                      >
                        Добавить
                      </Button>
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-6 gap-3 max-md:grid-cols-4 max-sm:grid-cols-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative border p-1.5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Gallery preview ${idx}`}
                          className="rounded-apple-sm h-16 w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                        >
                          <Trash2 className="size-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONAL FIELDS (Dimensions, logistics, variants/prices matrix) */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-6">
              {/* Optional Dimensions & Logistics Card */}
              <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg space-y-6 border p-8 shadow-xs max-md:p-5">
                <div className="border-apple-divider-soft border-b pb-4">
                  <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 3: Характеристики и Габариты</h2>
                  <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                    Укажите габариты упаковки и логистические параметры (опционально).
                  </p>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="weight">Вес (грамм)</Label>
                      <Tooltip content="Точный вес товара в упаковке в граммах." />
                    </div>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      placeholder="500"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="length">Длина (см)</Label>
                      <Tooltip content="Длина упаковки в сантиметрах." />
                    </div>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="width">Ширина (см)</Label>
                      <Tooltip content="Ширина упаковки в сантиметрах." />
                    </div>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      placeholder="20"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="height">Высота (см)</Label>
                      <Tooltip content="Высота упаковки в сантиметрах." />
                    </div>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                {/* Origin Country and Material */}
                <div className="border-apple-divider-soft grid grid-cols-2 gap-4 border-t pt-6 max-sm:grid-cols-1">
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="country">Страна происхождения</Label>
                      <Tooltip content="Страна, где был произведен товар." />
                    </div>
                    <Select id="country" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)}>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="material">Материал</Label>
                      <Tooltip content="Материал или состав изделия, например: 'Кожа', 'Металл', 'Шерсть'." />
                    </div>
                    <Input
                      id="material"
                      placeholder="Например: Хлопок..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Options Configurator (Optional) */}
              <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg space-y-6 border p-8 shadow-xs max-md:p-5">
                <div className="border-apple-divider-soft flex items-center justify-between border-b pb-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <div>
                    <h2 className="text-apple-ink text-[17px] font-semibold">Варианты товара (Характеристики)</h2>
                    <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                      Добавьте свойства (размеры, цвета), чтобы автоматически сгенерировать варианты.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="shadow-xs active:scale-[0.98]"
                  >
                    <Plus className="mr-1 size-4" /> Добавить свойство
                  </Button>
                </div>

                {options.length === 0 ? (
                  <div className="text-apple-ink-muted-48 py-6 text-center text-[14px]">
                    Свойства не заданы. Товар будет создан в единственном стандартном варианте.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-md relative border p-5"
                      >
                        <button
                          type="button"
                          onClick={() => removeOption(optIdx)}
                          className="text-apple-ink-muted-48 absolute top-4 right-4 transition-colors hover:text-red-600"
                          title="Удалить свойство"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                          {/* Title */}
                          <div className="grid gap-1.5">
                            <Label>Название свойства</Label>
                            <Input
                              placeholder="Цвет, Размер..."
                              value={opt.title}
                              onChange={(e) => updateOptionTitle(optIdx, e.target.value)}
                            />
                          </div>

                          {/* Value inputs */}
                          <div className="col-span-2 grid gap-1.5">
                            <Label>Значения свойства</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Введите значение и нажмите Добавить"
                                value={opt.inputValue}
                                onChange={(e) => {
                                  const updated = [...options]
                                  updated[optIdx].inputValue = e.target.value
                                  setOptions(updated)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addOptionValue(optIdx)
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                                onClick={() => addOptionValue(optIdx)}
                              >
                                Добавить
                              </Button>
                            </div>

                            {/* Tags list */}
                            {opt.values.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {opt.values.map((val, valIdx) => (
                                  <span
                                    key={valIdx}
                                    className="bg-apple-canvas text-apple-ink border-apple-hairline rounded-apple-pill inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-0.5 text-[13px] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => removeOptionValue(optIdx, valIdx)}
                                    title="Нажмите для удаления"
                                  >
                                    {val}
                                    <Trash2 className="size-3 opacity-60" />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={generateVariants}
                        className="bg-apple-primary/10 text-apple-primary border-apple-primary/20 hover:bg-apple-primary/15 border shadow-xs transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="mr-1.5 size-4" />
                        Сгенерировать матрицу вариантов
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Variants table */}
              {variants.length > 0 && (
                <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg space-y-6 border p-8 shadow-xs max-md:p-5">
                  <div className="border-apple-divider-soft border-b pb-4">
                    <h2 className="text-apple-ink text-[17px] font-semibold">Варианты товара ({variants.length})</h2>
                    <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                      Задайте цену, SKU и складские запасы для сгенерированных вариантов.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-apple-hairline text-apple-ink-muted-48 border-b text-[12px] font-semibold uppercase">
                          <th className="px-2 py-3">Вариант</th>
                          <th className="px-2 py-3">Цена (TMT)</th>
                          <th className="px-2 py-3">Артикул (SKU)</th>
                          <th className="px-2 py-3">Учет запасов</th>
                          <th className="px-2 py-3">Кол-во</th>
                          <th className="px-2 py-3">Штрихкод</th>
                        </tr>
                      </thead>
                      <tbody className="divide-apple-divider-soft divide-y text-[14px]">
                        {variants.map((variant, idx) => (
                          <tr key={idx} className="hover:bg-apple-canvas-parchment/30">
                            <td className="text-apple-ink px-2 py-4 font-semibold">{variant.title}</td>
                            <td className="w-28 px-2 py-4">
                              <div className="relative">
                                <span className="text-apple-ink-muted-48 absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px]">
                                  m.
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="h-9 pl-7 text-[13px]"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="w-36 px-2 py-4">
                              <Input
                                placeholder="SKU"
                                className="h-9 text-[13px]"
                                value={variant.sku}
                                onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                              />
                            </td>
                            <td className="w-20 px-2 py-4 text-center">
                              <Switch
                                checked={variant.manage_inventory}
                                onCheckedChange={(checked) => updateVariant(idx, 'manage_inventory', checked)}
                              />
                            </td>
                            <td className="w-20 px-2 py-4">
                              <Input
                                type="number"
                                min="0"
                                className="h-9 text-[13px]"
                                disabled={!variant.manage_inventory}
                                value={variant.inventory_quantity}
                                onChange={(e) => updateVariant(idx, 'inventory_quantity', Number(e.target.value))}
                              />
                            </td>
                            <td className="w-32 px-2 py-4">
                              <Input
                                placeholder="Barcode"
                                className="h-9 text-[13px]"
                                value={variant.barcode}
                                onChange={(e) => updateVariant(idx, 'barcode', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions footer */}
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg flex items-center justify-between border p-5 shadow-sm">
            <span className="text-apple-ink-muted-48 text-[13px]">
              {currentStep < 3 ? (
                <span>* Обязательные поля для перехода далее</span>
              ) : (
                <span>Все обязательные данные заполнены. Готово к отправке.</span>
              )}
            </span>
            <div className="flex gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="shadow-xs active:scale-[0.98]"
                  onClick={handlePrevStep}
                >
                  <ChevronLeft className="mr-1.5 size-4" />
                  Назад
                </Button>
              ) : (
                <Link href="/dashboard/products">
                  <Button type="button" variant="outline" className="shadow-xs active:scale-[0.98]">
                    Отмена
                  </Button>
                </Link>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  className="bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus shadow-xs transition-all active:scale-[0.98]"
                  onClick={handleNextStep}
                >
                  Далее
                  <ChevronRight className="ml-1.5 size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus shadow-xs transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    'Создать товар'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
