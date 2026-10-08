'use client'

import { X } from 'lucide-react'

import { CategorySelector } from '@/components/CategorySelector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors } from '../utils'

interface StepOneGeneralProps {
  title: string
  onTitleChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  tagsInput: string
  onTagsInputChange: (value: string) => void
  tags: string[]
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  fieldErrors: FieldErrors
  mode?: 'create' | 'edit'
  handle?: string
  onHandleChange?: (value: string) => void
}

export function StepOneGeneral({
  title,
  onTitleChange,
  category,
  onCategoryChange,
  tagsInput,
  onTagsInputChange,
  tags,
  onAddTag,
  onRemoveTag,
  fieldErrors,
  mode = 'create',
  handle,
  onHandleChange,
}: StepOneGeneralProps) {
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
          {mode === 'edit' ? 'Основная информация' : 'Шаг 1: Основное описание'}
        </h2>
        <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
          {mode === 'edit'
            ? 'Название, категория и данные для поиска товара.'
            : 'Укажите ключевые текстовые параметры вашего товара.'}
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
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
        {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
      </div>

      {mode === 'edit' && onHandleChange && (
        <div className="grid gap-1.5">
          <Label htmlFor="handle">URL товара</Label>
          <Input
            id="handle"
            value={handle ?? ''}
            onChange={(event) => onHandleChange(event.target.value.toLowerCase())}
            aria-invalid={Boolean(fieldErrors.handle)}
          />
          <p className="text-apple-ink-muted-48 text-[12px]">
            Адрес страницы товара в магазине. Используйте латинские буквы, цифры и дефисы.
          </p>
          {fieldErrors.handle && <p className="text-xs text-red-600">{fieldErrors.handle}</p>}
        </div>
      )}

      {/* Category */}
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="category">
            Категория <span className="text-red-500">*</span>
          </Label>
          <Tooltip content="Выберите подходящую категорию для размещения товара в каталоге." />
        </div>
        <CategorySelector value={category} onChange={onCategoryChange} placeholder="Выберите категорию..." />
        {fieldErrors.category && <p className="text-xs text-red-600">{fieldErrors.category}</p>}
      </div>

      {/* Tags */}
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
            onChange={(e) => onTagsInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                onAddTag()
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" className="h-10" onClick={onAddTag}>
            Добавить
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill focus-visible:outline-apple-primary inline-flex items-center gap-1.5 border px-2.5 py-1 text-[13px] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => onRemoveTag(tag)}
                aria-label={`Удалить тег ${tag}`}
              >
                {tag}
                <X className="size-3 shrink-0 opacity-60" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        {fieldErrors.tags && <p className="text-xs text-red-600">{fieldErrors.tags}</p>}
      </div>
    </Card>
  )
}
