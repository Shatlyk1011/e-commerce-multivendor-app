'use client'

import { Trash2 } from 'lucide-react'

import { CategorySelector } from '@/components/CategorySelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors } from './utils'

interface StepOneGeneralProps {
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  tagsInput: string
  onTagsInputChange: (value: string) => void
  tags: string[]
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  fieldErrors: FieldErrors
}

export function StepOneGeneral({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  tagsInput,
  onTagsInputChange,
  tags,
  onAddTag,
  onRemoveTag,
  fieldErrors,
}: StepOneGeneralProps) {
  return (
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
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
        {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="description">Описание товара</Label>
          <Tooltip content="Описание товара с его свойствами и преимуществами." />
        </div>
        <Textarea
          id="description"
          className="min-h-[140px]"
          placeholder="Расскажите покупателям об этом товаре..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
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
              <span
                key={tag}
                className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-[13px] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => onRemoveTag(tag)}
                title="Нажмите, чтобы удалить"
              >
                {tag}
                <Trash2 className="size-3 shrink-0 opacity-60" />
              </span>
            ))}
          </div>
        )}
        {fieldErrors.tags && <p className="text-xs text-red-600">{fieldErrors.tags}</p>}
      </div>
    </div>
  )
}
