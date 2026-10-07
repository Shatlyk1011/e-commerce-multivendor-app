'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import type {
  ProductOptionTemplate,
  VendorMediaResponse,
  VendorProduct,
  VendorProductOptionTemplatesResponse,
  VendorProductResponse,
} from '@dtc/api-contracts'
import { ArrowLeft, Loader2, PackageSearch, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepFourVariantsMatrix } from '@/features/products-create/components/StepFourVariantsMatrix'
import { StepOneGeneral } from '@/features/products-create/components/StepOneGeneral'
import { StepThreeVariants } from '@/features/products-create/components/StepThreeVariants'
import { StepTwoMedia } from '@/features/products-create/components/StepTwoMedia'
import {
  generateVariantSku,
  getFieldErrors,
  stepFourSchema,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema,
} from '@/features/products-create/utils'
import type { FieldErrors, ProductOption, ProductVariant } from '@/features/products-create/utils'
import { productStatus } from '@/lib/constants'
import { medusa } from '@/lib/medusa'

function getVariantOptions(variant: NonNullable<VendorProduct['variants']>[number]) {
  return Object.fromEntries(
    (variant.options ?? [])
      .filter((option) => option.option?.title)
      .map((option) => [option.option!.title, option.value]),
  )
}

function sameOptions(left: Record<string, string>, right: Record<string, string>) {
  const leftEntries = Object.entries(left).sort(([a], [b]) => a.localeCompare(b))
  const rightEntries = Object.entries(right).sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries)
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<VendorProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [title, setTitle] = useState('')
  const [handle, setHandle] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [thumbnail, setThumbnail] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [galleryFiles, setGalleryFiles] = useState<Array<File | null>>([])
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [originCountry, setOriginCountry] = useState('TM')
  const [material, setMaterial] = useState('')
  const [options, setOptions] = useState<ProductOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [optionTemplates, setOptionTemplates] = useState<ProductOptionTemplate[]>([])
  const [isLoadingOptionTemplates, setIsLoadingOptionTemplates] = useState(true)
  const skuSuffix = useRef(id.replace(/^prod_/, '').slice(-6) || crypto.randomUUID().slice(0, 6))

  const hydrateForm = useCallback((nextProduct: VendorProduct) => {
    setProduct(nextProduct)
    setTitle(nextProduct.title)
    setHandle(nextProduct.handle)
    setCategory(nextProduct.categories?.[0]?.id ?? '')
    setTags(nextProduct.metadata?.keywords ?? [])
    setThumbnail(nextProduct.thumbnail ?? '')
    setThumbnailFile(null)
    setImages((nextProduct.images ?? []).map((image) => image.url))
    setGalleryFiles((nextProduct.images ?? []).map(() => null))
    setWeight(nextProduct.weight == null ? '' : String(nextProduct.weight))
    setLength(nextProduct.length == null ? '' : String(nextProduct.length))
    setWidth(nextProduct.width == null ? '' : String(nextProduct.width))
    setHeight(nextProduct.height == null ? '' : String(nextProduct.height))
    setOriginCountry(nextProduct.origin_country ?? 'TM')
    setMaterial(nextProduct.material ?? '')
    setOptions(
      (nextProduct.options ?? []).map((option) => ({
        id: option.id,
        title: option.title,
        values: option.values.map((value) => value.value),
      })),
    )
    setVariants(
      (nextProduct.variants ?? []).map((variant) => {
        const tmtPrice = variant.prices?.find((price) => price.currency_code.toLowerCase() === 'tmt')
        return {
          id: variant.id,
          title: variant.title,
          options: getVariantOptions(variant),
          sku: variant.sku ?? '',
          barcode: variant.barcode ?? '',
          price: String(tmtPrice?.amount ?? ''),
          priceId: tmtPrice?.id,
          inventory: String(variant.inventory_quantity ?? 0),
        }
      }),
    )
  }, [])

  useEffect(() => {
    let isActive = true
    async function loadPage() {
      try {
        const [productResponse, templatesResponse] = await Promise.all([
          medusa.client.fetch<VendorProductResponse>(`/vendors/products/${id}`),
          medusa.client.fetch<VendorProductOptionTemplatesResponse>('/vendors/product-option-templates'),
        ])
        if (!isActive) return
        hydrateForm(productResponse.product)
        setOptionTemplates(templatesResponse.product_option_templates)
      } catch (error) {
        if (!isActive) return
        setHasLoadError(true)
        toast.error('Ошибка загрузки товара', {
          description: error instanceof Error ? error.message : 'Не удалось получить данные товара.',
        })
      } finally {
        if (isActive) {
          setIsLoading(false)
          setIsLoadingOptionTemplates(false)
        }
      }
    }
    void loadPage()
    return () => {
      isActive = false
    }
  }, [hydrateForm, id])

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

  const handleAddTag = () => {
    const value = tagsInput.trim()
    if (value && !tags.includes(value)) {
      setTags((current) => [...current, value])
      setTagsInput('')
    }
  }

  const addOption = () => setOptions((current) => [...current, { title: '', values: [] }])
  const removeOption = (index: number) => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))
  const updateOptionTitle = (index: number, optionTitle: string) => {
    setOptions((current) =>
      current.map((option, itemIndex) => (itemIndex === index ? { title: optionTitle, values: [] } : option)),
    )
  }
  const toggleOptionValue = (index: number, value: string) => {
    setOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex !== index
          ? option
          : {
              ...option,
              values: option.values.includes(value)
                ? option.values.filter((candidate) => candidate !== value)
                : [...option.values, value],
            },
      ),
    )
  }

  const regenerateVariants = () => {
    const validOptions = options.filter((option) => option.title.trim() && option.values.length > 0)
    if (validOptions.length === 0) {
      const existing = variants.find((variant) => Object.keys(variant.options).length === 0) ?? variants[0]
      setVariants([
        existing ?? {
          title: 'Стандартный',
          options: {},
          sku: generateVariantSku(title, ['default'], skuSuffix.current),
          barcode: '',
          price: '150',
          inventory: '0',
        },
      ])
      return
    }

    const combinations = validOptions
      .map((option) => option.values)
      .reduce<
        string[][]
      >((current, values) => current.flatMap((combination) => values.map((value) => [...combination, value])), [[]])
    setVariants(
      combinations.map((combination, index) => {
        const variantOptions = Object.fromEntries(
          validOptions.map((option, optionIndex) => [option.title, combination[optionIndex]]),
        )
        const existing = variants.find((variant) => sameOptions(variant.options, variantOptions))
        return (
          existing ?? {
            title: combination.join(' / '),
            options: variantOptions,
            sku: generateVariantSku(title, combination, `${skuSuffix.current}-${index + 1}`),
            barcode: '',
            price: '150',
            inventory: '0',
          }
        )
      }),
    )
  }

  const updateVariant = <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => {
    setVariants((current) =>
      current.map((variant, itemIndex) => (itemIndex === index ? { ...variant, [key]: value } : variant)),
    )
  }

  const validateForm = () => {
    const validations = [
      stepOneSchema.safeParse({ title, category, tags }),
      stepTwoSchema.safeParse({ thumbnail, images }),
      stepThreeSchema.safeParse({ options, weight, length, width, height }),
      stepFourSchema.safeParse({ variants }),
    ]
    const failed = validations.find((result) => !result.success)
    if (failed && !failed.success) {
      const errors = getFieldErrors(failed.error)
      setFieldErrors(errors)
      toast.error(Object.values(errors)[0])
      return false
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) {
      setFieldErrors({ handle: 'URL должен содержать только латинские буквы, цифры и дефисы.' })
      toast.error('Проверьте URL товара.')
      return false
    }
    const validOptions = new Map(options.map((option) => [option.title, new Set(option.values)]))
    const invalidVariant = variants.find((variant) =>
      Object.entries(variant.options).some(([optionTitle, value]) => !validOptions.get(optionTitle)?.has(value)),
    )
    if (invalidVariant) {
      setFieldErrors({ variants: 'Синхронизируйте варианты после изменения свойств товара.' })
      toast.error('Синхронизируйте варианты перед сохранением.')
      return false
    }
    setFieldErrors({})
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!product || !validateForm()) return
    setIsSubmitting(true)
    try {
      let nextThumbnail = thumbnail
      if (thumbnailFile) {
        const [uploadedThumbnail] = await uploadVendorMedia([thumbnailFile])
        nextThumbnail = uploadedThumbnail.url
      }

      const pendingGalleryFiles = galleryFiles.filter((file): file is File => file !== null)
      const uploadedGalleryFiles = pendingGalleryFiles.length > 0 ? await uploadVendorMedia(pendingGalleryFiles) : []
      let uploadedIndex = 0
      const nextImages = images.map((url, index) => {
        if (galleryFiles[index]) {
          const uploaded = uploadedGalleryFiles[uploadedIndex++]
          return { url: uploaded.url }
        }
        const existingImage = product.images?.find((image) => image.url === url)
        return existingImage ? { id: existingImage.id, url } : { url }
      })

      const response = await medusa.client.fetch<VendorProductResponse>(`/vendors/products/${id}`, {
        method: 'POST',
        body: {
          title: title.trim(),
          handle: handle.trim(),
          thumbnail: nextThumbnail || null,
          images: nextImages,
          categories: [{ id: category }],
          metadata: { keywords: tags },
          weight: weight ? Number(weight) : null,
          length: length ? Number(length) : null,
          width: width ? Number(width) : null,
          height: height ? Number(height) : null,
          origin_country: originCountry || null,
          material: material.trim() || null,
          options: options.map((option) => ({
            id: option.id,
            title: option.title.trim(),
            values: option.values,
          })),
          variants: variants.map((variant) => ({
            id: variant.id,
            title: variant.title.trim(),
            sku: variant.sku.trim() || null,
            barcode: variant.barcode.trim() || null,
            options: variant.options,
            price: Number(variant.price),
            price_id: variant.priceId,
            inventory: Number(variant.inventory),
          })),
        },
      })
      hydrateForm(response.product)
      toast.success('Изменения сохранены')
    } catch (error) {
      toast.error('Не удалось обновить товар', {
        description: error instanceof Error ? error.message : 'Попробуйте ещё раз.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
        <Loader2 className="text-apple-primary size-8 animate-spin" />
        <p className="text-apple-caption text-apple-ink-muted-48 mt-4">Загрузка товара...</p>
      </div>
    )
  }

  if (!product || hasLoadError) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg max-w-md border p-8 text-center">
          <PackageSearch className="text-apple-ink-muted-48 mx-auto size-10" />
          <h1 className="text-apple-tagline text-apple-ink mt-5">Не удалось открыть товар</h1>
          <p className="text-apple-caption text-apple-ink-muted-48 mt-2">
            Товар не найден, был удалён или больше не принадлежит вашему магазину.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/dashboard/products">
              <ArrowLeft />К товарам
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const status = productStatus[product.status] ?? {
    label: product.status,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return (
    <form onSubmit={handleSubmit} className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="border-apple-hairline flex items-start justify-between gap-6 border-b pb-6 max-sm:flex-col">
          <div>
            <Link
              href="/dashboard/products"
              className="text-apple-primary text-apple-button-utility inline-flex items-center font-medium hover:underline"
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Все товары
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-apple-display-md text-apple-ink font-semibold tracking-tight">
                Редактирование товара
              </h1>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
              Измените данные, изображения, свойства, варианты, цены и остатки товара.
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting} className="min-w-36 shadow-xs">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <StepOneGeneral
          title={title}
          onTitleChange={setTitle}
          category={category}
          onCategoryChange={setCategory}
          tagsInput={tagsInput}
          onTagsInputChange={setTagsInput}
          tags={tags}
          onAddTag={handleAddTag}
          onRemoveTag={(tag) => setTags((current) => current.filter((item) => item !== tag))}
          fieldErrors={fieldErrors}
        />

        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg border p-8 shadow-xs max-md:p-5">
          <div className="grid gap-2">
            <Label htmlFor="handle">URL товара</Label>
            <Input id="handle" value={handle} onChange={(event) => setHandle(event.target.value.toLowerCase())} />
            <p className="text-apple-ink-muted-48 text-[12px]">Используется в ссылке на карточку товара.</p>
            {fieldErrors.handle && <p className="text-xs text-red-600">{fieldErrors.handle}</p>}
          </div>
        </div>

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
          optionTemplates={optionTemplates}
          isLoadingOptionTemplates={isLoadingOptionTemplates}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onUpdateOptionTitle={updateOptionTitle}
          onToggleOptionValue={toggleOptionValue}
          fieldErrors={fieldErrors}
        />

        <StepFourVariantsMatrix
          variants={variants}
          onUpdateVariant={updateVariant}
          hasOptionsConfigured={options.some((option) => option.title && option.values.length > 0)}
          fieldErrors={fieldErrors}
          onRegenerateVariants={regenerateVariants}
          onRemoveVariant={(index) => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}
        />

        <div className="border-apple-hairline flex justify-end gap-3 border-t pt-6">
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard/products">Отмена</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </form>
  )
}
