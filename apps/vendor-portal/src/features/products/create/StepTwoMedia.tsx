'use client'

import * as React from 'react'

import { Trash2, Upload } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors } from './utils'

interface StepTwoMediaProps {
  thumbnail: string
  onThumbnailChange: (url: string) => void
  images: string[]
  onImagesChange: (images: string[]) => void
  isUploadingMedia: boolean
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fieldErrors: FieldErrors
}

export function StepTwoMedia({
  thumbnail,
  onThumbnailChange,
  images,
  onImagesChange,
  isUploadingMedia,
  onThumbnailUpload,
  onGalleryUpload,
  fieldErrors,
}: StepTwoMediaProps) {
  return (
    <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg animate-fade-in space-y-6 border p-8 shadow-xs max-md:p-5">
      <div className="border-apple-divider-soft border-b pb-4">
        <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 2: Изображения товара</h2>
        <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
          Добавьте обязательное главное изображение и дополнительные снимки галереи.
        </p>
      </div>

      {/* Thumbnail upload */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Label>
            Главное изображение (Миниатюра) <span className="text-red-500">*</span>
          </Label>
          <Tooltip content="Основное изображение, которое выводится на витрине каталога. Обязательно к заполнению." />
        </div>
        <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex flex-col items-center justify-center border p-4 text-center">
          <input
            type="file"
            id="thumb-file"
            accept="image/*"
            className="hidden"
            disabled={isUploadingMedia}
            onChange={onThumbnailUpload}
          />
          <label
            htmlFor="thumb-file"
            aria-disabled={isUploadingMedia}
            className="text-apple-ink hover:text-apple-primary text-apple-caption-strong flex cursor-pointer flex-col items-center gap-2 transition-colors aria-disabled:cursor-wait aria-disabled:opacity-50"
          >
            <Upload className="text-apple-ink-muted-48 size-8" />
            <span>{isUploadingMedia ? 'Загрузка в MinIO…' : 'Загрузить изображение'}</span>
            <span className="text-apple-ink-muted-48 text-[11px] font-normal">PNG, JPG, WebP до 10MB</span>
          </label>
        </div>

        {thumbnail && (
          <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative w-32 border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail} alt="Thumbnail preview" className="rounded-apple-sm h-24 w-full object-contain" />
            <button
              type="button"
              onClick={() => onThumbnailChange('')}
              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        )}
        {fieldErrors.thumbnail && <p className="text-xs text-red-600">{fieldErrors.thumbnail}</p>}
      </div>

      {/* Gallery Images (Optional) */}
      <div className="border-apple-divider-soft space-y-4 border-t pt-6">
        <div className="flex items-center">
          <Label>Галерея дополнительных изображений (Опционально)</Label>
          <Tooltip content="Дополнительные ракурсы товара для карточки товара на детальном просмотре." />
        </div>
        <div className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl flex flex-col items-center justify-center border p-4 text-center">
          <input
            type="file"
            id="gallery-files"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploadingMedia}
            onChange={onGalleryUpload}
          />
          <label
            htmlFor="gallery-files"
            aria-disabled={isUploadingMedia}
            className="text-apple-ink hover:text-apple-primary text-apple-caption-strong flex cursor-pointer flex-col items-center gap-2 transition-colors aria-disabled:cursor-wait aria-disabled:opacity-50"
          >
            <Upload className="text-apple-ink-muted-48 size-8" />
            <span>{isUploadingMedia ? 'Загрузка в MinIO…' : 'Загрузить файлы'}</span>
            <span className="text-apple-ink-muted-48 text-[11px] font-normal">До 10 изображений в галерее</span>
          </label>
        </div>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-6 gap-3 max-md:grid-cols-4 max-sm:grid-cols-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="border-apple-hairline rounded-apple-sm bg-apple-surface-pearl group relative border p-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Gallery preview ${idx}`} className="rounded-apple-sm h-16 w-full object-contain" />
                <button
                  type="button"
                  onClick={() => onImagesChange(images.filter((_, i) => i !== idx))}
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
  )
}
