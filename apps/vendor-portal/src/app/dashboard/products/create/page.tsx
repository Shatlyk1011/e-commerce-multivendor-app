'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { VendorMediaResponse, VendorProductCreateResponse } from '@dtc/api-contracts'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { StepFourVariantsMatrix } from '@/features/products/create/components/StepFourVariantsMatrix'
import { StepOneGeneral } from '@/features/products/create/components/StepOneGeneral'
import { StepThreeVariants } from '@/features/products/create/components/StepThreeVariants'
import { StepTwoMedia } from '@/features/products/create/components/StepTwoMedia'
import {
  STEPS_INFO,
  getFieldErrors,
  slugify,
  stepFourSchema,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema,
} from '@/features/products/create/utils'
import type { FieldErrors, ProductOption, ProductVariant } from '@/features/products/create/utils'
import { medusa } from '@/lib/medusa'

import { useVendor } from '../../layout'

export default function CreateProductPage() {
  const router = useRouter()
  const { vendor } = useVendor()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // 1. General state (Step 1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // 2. Media state (Step 2)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

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

  // ─── Leave-page guard ────────────────────────────────────────────────────────
  const [showLeaveAlert, setShowLeaveAlert] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [hasCreatedProduct, setHasCreatedProduct] = useState(false)
  const hasCreatedProductRef = useRef(false)

  const isDirty =
    !hasCreatedProduct &&
    (title.trim() !== '' ||
      description.trim() !== '' ||
      category !== '' ||
      tags.length > 0 ||
      thumbnail !== '' ||
      images.length > 0 ||
      weight !== '' ||
      length !== '' ||
      width !== '' ||
      height !== '' ||
      material.trim() !== '' ||
      variants.length > 0)

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasCreatedProductRef.current || !isDirty) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleLeave = (href: string) => {
    if (!isDirty) {
      router.push(href)
      return
    }
    setPendingHref(href)
    setShowLeaveAlert(true)
  }

  const confirmLeave = () => {
    setShowLeaveAlert(false)
    if (pendingHref) router.push(pendingHref)
  }

  const cancelLeave = () => {
    setShowLeaveAlert(false)
    setPendingHref(null)
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Tag handlers ─────────────────────────────────────────────────────────────
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

  // ─── Media upload helpers ─────────────────────────────────────────────────────
  const uploadVendorMedia = async (files: File[]) => {
    const body = new FormData()
    files.forEach((file) => body.append('files', file))
    const response = await medusa.client.fetch<VendorMediaResponse>('/vendors/media', {
      method: 'POST',
      body,
      headers: { 'content-type': null },
    })
    return response.files
  }

  // ─── Options handlers ─────────────────────────────────────────────────────────
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

  const updateOptionInputValue = (index: number, value: string) => {
    const updated = [...options]
    updated[index].inputValue = value
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

  const autoGenerateVariants = () => {
    const validOptions = options.filter((o) => o.title.trim() !== '' && o.values.length > 0)
    if (validOptions.length === 0) {
      setVariants([
        {
          title: 'Стандартный',
          options: {},
          sku: `${slugify(title)}-default`,
          barcode: '',
          price: '150.00',
        },
      ])
      return
    }

    const cartesian = (arrays: string[][]): string[][] =>
      arrays.reduce((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]] as string[][])

    const combinations = cartesian(validOptions.map((o) => o.values))
    const generated: ProductVariant[] = combinations.map((combo) => {
      const optionMap: Record<string, string> = {}
      validOptions.forEach((opt, idx) => {
        optionMap[opt.title] = combo[idx]
      })
      const variantTitle = combo.join(' / ')
      const existing = variants.find((v) => v.title === variantTitle)
      return {
        title: variantTitle,
        options: optionMap,
        sku: existing?.sku || `${slugify(title)}-${combo.map((c) => slugify(c)).join('-')}`,
        barcode: existing?.barcode || '',
        price: existing?.price || '150.00',
      }
    })

    setVariants(generated)
  }

  const updateVariant = <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => {
    const updated = [...variants]
    updated[index][key] = value
    setVariants(updated)
  }

  // ─── Step navigation ──────────────────────────────────────────────────────────
  const handleNextStep = () => {
    if (currentStep === 1) {
      const result = stepOneSchema.safeParse({ title, category, tags })
      if (!result.success) {
        const errors = getFieldErrors(result.error)
        setFieldErrors(errors)
        toast.error(Object.values(errors)[0])
        return
      }
      setFieldErrors({})
      setCurrentStep(2)
    } else if (currentStep === 2) {
      const result = stepTwoSchema.safeParse({ thumbnail, images })
      if (!result.success) {
        const errors = getFieldErrors(result.error)
        setFieldErrors(errors)
        toast.error(Object.values(errors)[0])
        return
      }
      setFieldErrors({})
      setCurrentStep(3)
    } else if (currentStep === 3) {
      const result = stepThreeSchema.safeParse({ options, weight, length, width, height })
      if (!result.success) {
        const errors = getFieldErrors(result.error)
        setFieldErrors(errors)
        toast.error(Object.values(errors)[0])
        return
      }
      setFieldErrors({})
      autoGenerateVariants()
      setCurrentStep(4)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) setCurrentStep(1)
    else if (currentStep === 3) setCurrentStep(2)
    else if (currentStep === 4) setCurrentStep(3)
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const stepOneResult = stepOneSchema.safeParse({ title, category, tags })
    if (!stepOneResult.success) {
      const errors = getFieldErrors(stepOneResult.error)
      setFieldErrors(errors)
      setCurrentStep(1)
      toast.error(Object.values(errors)[0])
      return
    }

    const stepTwoResult = stepTwoSchema.safeParse({ thumbnail, images })
    if (!stepTwoResult.success) {
      const errors = getFieldErrors(stepTwoResult.error)
      setFieldErrors(errors)
      setCurrentStep(2)
      toast.error(Object.values(errors)[0])
      return
    }

    const stepThreeResult = stepThreeSchema.safeParse({ options, weight, length, width, height })
    if (!stepThreeResult.success) {
      const errors = getFieldErrors(stepThreeResult.error)
      setFieldErrors(errors)
      setCurrentStep(3)
      toast.error(Object.values(errors)[0])
      return
    }

    const stepFourResult = stepFourSchema.safeParse({ variants })
    if (!stepFourResult.success) {
      const errors = getFieldErrors(stepFourResult.error)
      setFieldErrors(errors)
      setCurrentStep(4)
      toast.error(Object.values(errors)[0])
      return
    }

    setFieldErrors({})

    if (!vendor?.city?.trim()) {
      toast.error('Укажите город магазина', {
        description: 'Обратитесь к администратору, чтобы заполнить город происхождения товара.',
      })
      return
    }

    setIsSubmitting(true)

    let uploadedThumbnailUrl = thumbnail
    let uploadedImageUrls = [...images]

    try {
      if (thumbnailFile) {
        const [uploadedFile] = await uploadVendorMedia([thumbnailFile])
        uploadedThumbnailUrl = uploadedFile.url
      }
      if (galleryFiles.length > 0) {
        const uploadedFiles = await uploadVendorMedia(galleryFiles)
        uploadedImageUrls = uploadedFiles.map((file) => file.url)
      }
    } catch (error) {
      toast.error('Не удалось загрузить изображения', {
        description: error instanceof Error ? error.message : 'Попробуйте ещё раз.',
      })
      setIsSubmitting(false)
      return
    }

    const processedVariants =
      variants.length > 0
        ? variants.map((v) => ({
            title: v.title,
            options: v.options,
            sku: v.sku.trim() || null,
            barcode: v.barcode.trim() || null,
            manage_inventory: false,
            prices: [{ currency_code: 'tmt', amount: Number(v.price) }],
          }))
        : [
            {
              title: 'Standard',
              options: {},
              sku: `${slugify(title)}-default`,
              prices: [{ currency_code: 'tmt', amount: 150 }],
            },
          ]

    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const generatedHandle = `${slugify(title.trim())}-${randomDigits}`

    const payload = {
      title: title.trim(),
      handle: generatedHandle,
      description: description.trim() || null,
      thumbnail: uploadedThumbnailUrl.trim() || null,
      images: uploadedImageUrls.map((url) => ({ url })),
      status: 'draft',
      categories: [{ id: category }],
      metadata: { keywords: tags },
      options:
        variants.length > 0
          ? options
              .filter((o) => o.title.trim() !== '' && o.values.length > 0)
              .map((o) => ({ title: o.title.trim(), values: o.values }))
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
      await medusa.client.fetch<VendorProductCreateResponse>('/vendors/products', {
        method: 'POST',
        body: payload,
      })
      hasCreatedProductRef.current = true
      setHasCreatedProduct(true)
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

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      {/* ── Leave confirmation dialog ── */}
      {showLeaveAlert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancelLeave} aria-hidden="true" />
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg relative z-10 w-full max-w-sm border p-6 shadow-lg">
            <h2 id="leave-dialog-title" className="text-apple-ink text-[17px] font-semibold tracking-tight">
              Выйти без сохранения?
            </h2>
            <p className="text-apple-caption text-apple-ink-muted-48 mt-2">
              Заполненные данные будут потеряны. Это действие нельзя отменить.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" className="shadow-xs" onClick={cancelLeave}>
                Остаться
              </Button>
              <Button type="button" variant="destructive" className="shadow-xs" onClick={confirmLeave}>
                Да, выйти
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => handleLeave('/dashboard/products')}
            className="text-apple-primary text-apple-button-utility mb-4 inline-flex items-center font-medium hover:underline"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Назад к товарам
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-apple-display-md text-apple-ink font-semibold tracking-tight">Новый товар</h1>
              <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
                Пошаговое заполнение карточки товара. Поля с меткой * обязательны.
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator Header */}
        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg mb-8 border p-6 shadow-xs">
          <div className="relative flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
            {STEPS_INFO.map((info, idx) => (
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
                {idx < STEPS_INFO.length - 1 && <div className="bg-apple-hairline mx-4 h-px flex-1 max-sm:hidden" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form className="space-y-6">
          {currentStep === 1 && (
            <StepOneGeneral
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              category={category}
              onCategoryChange={setCategory}
              tagsInput={tagsInput}
              onTagsInputChange={setTagsInput}
              tags={tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              fieldErrors={fieldErrors}
            />
          )}

          {currentStep === 2 && (
            <StepTwoMedia
              thumbnail={thumbnail}
              images={images}
              onThumbnailChange={(url, file) => {
                setThumbnail(url)
                setThumbnailFile(file)
              }}
              onImagesChange={(urls, files) => {
                setImages(urls)
                setGalleryFiles(files)
              }}
              thumbnailFile={thumbnailFile}
              galleryFiles={galleryFiles}
              fieldErrors={fieldErrors}
            />
          )}

          {currentStep === 3 && (
            <StepThreeVariants
              weight={weight}
              onWeightChange={setWeight}
              length={length}
              onLengthChange={setLength}
              width={width}
              onWidthChange={setWidth}
              height={height}
              onHeightChange={setHeight}
              originCountry={originCountry}
              onOriginCountryChange={setOriginCountry}
              material={material}
              onMaterialChange={setMaterial}
              options={options}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onUpdateOptionTitle={updateOptionTitle}
              onUpdateOptionInputValue={updateOptionInputValue}
              onAddOptionValue={addOptionValue}
              onRemoveOptionValue={removeOptionValue}
              fieldErrors={fieldErrors}
            />
          )}

          {currentStep === 4 && (
            <StepFourVariantsMatrix
              variants={variants}
              onUpdateVariant={updateVariant}
              hasOptionsConfigured={options.some((o) => o.title.trim() !== '' && o.values.length > 0)}
              fieldErrors={fieldErrors}
            />
          )}

          {/* Form Actions footer */}
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg flex items-center justify-between border p-5 shadow-sm">
            <div className="flex w-full justify-end gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="shadow-xs active:scale-[0.98]"
                  onClick={handlePrevStep}
                >
                  <ChevronLeft className="size-4" />
                  Назад
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="shadow-xs active:scale-[0.98]"
                  onClick={() => handleLeave('/dashboard/products')}
                >
                  Отмена
                </Button>
              )}

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNextStep}>
                  Далее
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
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
