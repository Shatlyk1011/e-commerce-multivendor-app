'use client'

import * as React from 'react'
import { useCallback } from 'react'

import { Trash2, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { toast } from 'sonner'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors } from '../utils'

interface StepTwoMediaProps {
  thumbnail: string // local object URL or empty
  images: string[] // local object URLs
  onThumbnailChange: (url: string, file: File | null) => void
  onImagesChange: (urls: string[], files: Array<File | null>) => void
  thumbnailFile: File | null
  galleryFiles: Array<File | null>
  fieldErrors: FieldErrors
  mode?: 'create' | 'edit'
}

export function StepTwoMedia({
  thumbnail,
  images,
  onThumbnailChange,
  onImagesChange,
  galleryFiles,
  fieldErrors,
  mode = 'create',
}: StepTwoMediaProps) {
  // Main Image (Thumbnail) Dropzone
  const onDropThumbnail = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        // Create local object URL
        const localUrl = URL.createObjectURL(file)
        // If there was an old thumbnail object URL, the caller can revoke it, or we handle it here
        onThumbnailChange(localUrl, file)
        toast.success('Главное изображение добавлено локально')
      }
    },
    [onThumbnailChange],
  )

  const {
    getRootProps: getThumbRootProps,
    getInputProps: getThumbInputProps,
    isDragActive: isThumbDragActive,
  } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  })

  // Gallery Dropzone
  const onDropGallery = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = 10 - images.length
      if (remainingSlots <= 0) {
        toast.warning('В галерее можно хранить не более 10 изображений')
        return
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots)
      const newUrls = filesToAdd.map((file) => URL.createObjectURL(file))

      onImagesChange([...images, ...newUrls], [...galleryFiles, ...filesToAdd])

      if (acceptedFiles.length > remainingSlots) {
        toast.warning(`Добавлено только ${remainingSlots} изображений. Лимит 10.`)
      } else {
        toast.success(`Добавлено изображений: ${filesToAdd.length}`)
      }
    },
    [images, galleryFiles, onImagesChange],
  )

  const {
    getRootProps: getGalleryRootProps,
    getInputProps: getGalleryInputProps,
    isDragActive: isGalleryDragActive,
  } = useDropzone({
    onDrop: onDropGallery,
    accept: { 'image/*': [] },
    maxFiles: 10 - images.length,
    disabled: images.length >= 10,
  })

  const removeThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (thumbnail.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnail)
    }
    onThumbnailChange('', null)
  }

  const removeGalleryImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const urlToRemove = images[indexToRemove]
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove)
    }
    const newUrls = images.filter((_, i) => i !== indexToRemove)
    const newFiles = galleryFiles.filter((_, i) => i !== indexToRemove)
    onImagesChange(newUrls, newFiles)
  }

  return (
    <Card
      size={mode === 'edit' ? 'sm' : 'default'}
      className={
        mode === 'edit'
          ? 'animate-fade-in gap-0 space-y-4 p-5 max-md:p-4'
          : 'animate-fade-in gap-0 space-y-6 p-8 shadow-xs max-md:p-5'
      }
    >
      <div className={`border-apple-divider-soft border-b ${mode === 'edit' ? 'pb-3' : 'pb-4'}`}>
        <h2 className="text-apple-ink text-[17px] font-semibold">
          {mode === 'edit' ? 'Изображения' : 'Шаг 2: Изображения товара'}
        </h2>
        <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
          {mode === 'edit'
            ? 'Главное изображение показывается в каталоге. Дополнительные снимки появятся в галерее.'
            : 'Добавьте обязательное главное изображение и дополнительные снимки галереи. Загрузка в хранилище произойдет при сохранении товара.'}
        </p>
      </div>

      {/* Thumbnail Upload Area */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Label>
            Главное изображение (Миниатюра) <span className="text-red-500">*</span>
          </Label>
          <Tooltip content="Основное изображение, которое выводится на витрине каталога. Обязательно к заполнению." />
        </div>

        {thumbnail ? (
          <div className="relative inline-block">
            <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative w-32 border p-2">
              <Zoom>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="rounded-apple-sm h-24 w-full cursor-zoom-in object-contain"
                />
              </Zoom>
              <button
                type="button"
                onClick={removeThumbnail}
                aria-label="Удалить главное изображение"
                className="focus-visible:outline-apple-primary absolute -top-1.5 -right-1.5 z-10 rounded-full bg-red-500 p-1 text-white shadow-md transition-opacity hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getThumbRootProps()}
            className={`border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-4 text-center transition-all ${
              isThumbDragActive
                ? 'border-apple-primary bg-apple-primary/5 scale-[0.99]'
                : 'hover:border-apple-primary/45 hover:bg-apple-surface-pearl/70'
            }`}
          >
            <input {...getThumbInputProps()} />
            <Upload
              className={`mb-2 size-8 transition-transform ${isThumbDragActive ? 'text-apple-primary scale-110' : 'text-apple-ink-muted-48'}`}
            />
            <span className="text-apple-ink text-apple-caption-strong">
              {isThumbDragActive ? 'Отпустите для загрузки' : 'Перетащите или выберите главное изображение'}
            </span>
            <span className="text-apple-ink-muted-48 mt-1 text-[11px] font-normal">PNG, JPG, WebP до 10MB</span>
          </div>
        )}
        {fieldErrors.thumbnail && <p className="text-xs text-red-600">{fieldErrors.thumbnail}</p>}
      </div>

      {/* Gallery Images Area */}
      <div className="border-apple-divider-soft space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Label>Галерея дополнительных изображений (Опционально)</Label>
            <Tooltip content="Дополнительные ракурсы товара для карточки товара на детальном просмотре." />
          </div>
          <span className="text-apple-ink-muted-48 text-[12px]">{images.length} / 10</span>
        </div>

        {images.length < 10 && (
          <div
            {...getGalleryRootProps()}
            className={`border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-4 text-center transition-all ${
              isGalleryDragActive
                ? 'border-apple-primary bg-apple-primary/5 scale-[0.99]'
                : 'hover:border-apple-primary/45 hover:bg-apple-surface-pearl/70'
            }`}
          >
            <input {...getGalleryInputProps()} />
            <Upload
              className={`mb-2 size-8 transition-transform ${isGalleryDragActive ? 'text-apple-primary scale-110' : 'text-apple-ink-muted-48'}`}
            />
            <span className="text-apple-ink text-apple-caption-strong">
              {isGalleryDragActive ? 'Отпустите для загрузки' : 'Перетащите или выберите изображения для галереи'}
            </span>
            <span className="text-apple-ink-muted-48 mt-1 text-[11px] font-normal">До 10 изображений в галерее</span>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2.5 max-md:grid-cols-4 max-sm:grid-cols-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative flex flex-col items-center justify-center border p-1.5"
              >
                <Zoom>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Gallery preview ${idx}`}
                    className="rounded-apple-sm h-24 w-full cursor-zoom-in object-contain"
                  />
                </Zoom>
                <button
                  type="button"
                  onClick={(e) => removeGalleryImage(idx, e)}
                  aria-label={`Удалить изображение ${idx + 1}`}
                  className="focus-visible:outline-apple-primary absolute -top-1.5 -right-1.5 z-10 rounded-full bg-red-500 p-1 text-white shadow-md transition-opacity hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                >
                  <Trash2 className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
