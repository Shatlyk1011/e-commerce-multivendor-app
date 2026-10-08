'use client'

import type { ProductOptionTemplate } from '@dtc/api-contracts'
import { Check, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors, ProductOption } from '../utils'
import { COUNTRIES } from '../utils'

interface StepThreeVariantsProps {
  // Dimensions
  weight: string
  onWeightChange: (value: string) => void
  length: string
  onLengthChange: (value: string) => void
  width: string
  onWidthChange: (value: string) => void
  height: string
  onHeightChange: (value: string) => void
  originCountry: string
  onOriginCountryChange: (value: string) => void
  material: string
  onMaterialChange: (value: string) => void
  // Options
  options: ProductOption[]
  optionTemplates: ProductOptionTemplate[]
  isLoadingOptionTemplates: boolean
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onUpdateOptionTitle: (index: number, title: string) => void
  onToggleOptionValue: (index: number, value: string) => void
  fieldErrors: FieldErrors
  mode?: 'create' | 'edit'
}

export function StepThreeVariants({
  weight,
  onWeightChange,
  length,
  onLengthChange,
  width,
  onWidthChange,
  height,
  onHeightChange,
  originCountry,
  onOriginCountryChange,
  material,
  onMaterialChange,
  options,
  optionTemplates,
  isLoadingOptionTemplates,
  onAddOption,
  onRemoveOption,
  onUpdateOptionTitle,
  onToggleOptionValue,
  mode = 'create',
}: StepThreeVariantsProps) {
  return (
    <div
      className={
        mode === 'edit' ? 'animate-fade-in grid items-start gap-4 xl:grid-cols-2' : 'animate-fade-in space-y-6'
      }
    >
      {/* Optional Dimensions & Logistics Card */}
      <Card
        size={mode === 'edit' ? 'sm' : 'default'}
        className={mode === 'edit' ? 'gap-0 space-y-4 p-5 max-md:p-4' : 'gap-0 space-y-6 p-8 shadow-xs max-md:p-5'}
      >
        <div className={`border-apple-divider-soft border-b ${mode === 'edit' ? 'pb-3' : 'pb-4'}`}>
          <h2 className="text-apple-ink text-[17px] font-semibold">
            {mode === 'edit' ? 'Характеристики и габариты' : 'Шаг 3: Характеристики и Габариты'}
          </h2>
          <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
            {mode === 'edit'
              ? 'Вес и размеры упаковки, страна производства и материал.'
              : 'Укажите габариты упаковки и логистические параметры (опционально).'}
          </p>
        </div>

        {/* Dimensions Grid */}
        <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
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
              onChange={(e) => onWeightChange(e.target.value)}
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
              onChange={(e) => onLengthChange(e.target.value)}
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
              onChange={(e) => onWidthChange(e.target.value)}
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
              onChange={(e) => onHeightChange(e.target.value)}
            />
          </div>
        </div>

        {/* Origin Country and Material */}
        <div className="border-apple-divider-soft grid grid-cols-2 gap-3 border-t pt-4 max-sm:grid-cols-1">
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="country">Страна происхождения</Label>
              <Tooltip content="Страна, где был произведен товар." />
            </div>
            <Select value={originCountry} onValueChange={onOriginCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
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
              onChange={(e) => onMaterialChange(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Options Configurator (Optional) */}
      <Card
        size={mode === 'edit' ? 'sm' : 'default'}
        className={mode === 'edit' ? 'gap-0 space-y-4 p-5 max-md:p-4' : 'gap-0 space-y-6 p-8 shadow-xs max-md:p-5'}
      >
        <div className="border-apple-divider-soft flex items-center justify-between border-b pb-3 max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <div>
            <h2 className="text-apple-ink text-[17px] font-semibold">
              {mode === 'edit' ? 'Свойства товара' : 'Варианты товара (размер, цвет и т.д.)'}
            </h2>
            <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
              {mode === 'edit'
                ? 'Размер, цвет и другие значения для вариантов товара.'
                : 'Выберите свойства и их значения, утверждённые администратором.'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddOption}
            disabled={isLoadingOptionTemplates || optionTemplates.length === 0}
            className="shadow-xs active:scale-[0.98]"
          >
            <Plus className="mr-1 size-4" /> Добавить свойство
          </Button>
        </div>

        {isLoadingOptionTemplates ? (
          <div className="text-apple-ink-muted-48 py-6 text-center text-[14px]">Загрузка доступных свойств…</div>
        ) : optionTemplates.length === 0 ? (
          <div className="text-apple-ink-muted-48 py-6 text-center text-[14px]">
            Администратор ещё не настроил свойства товара. Товар будет создан в единственном стандартном варианте.
          </div>
        ) : options.length === 0 ? (
          <div className="text-apple-ink-muted-48 py-6 text-center text-[14px]">
            Свойства не заданы. Товар будет создан в единственном стандартном варианте.
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((opt, optIdx) => (
              <div
                key={optIdx}
                className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-md relative border p-4"
              >
                <button
                  type="button"
                  onClick={() => onRemoveOption(optIdx)}
                  className="text-apple-ink-muted-48 absolute top-4 right-4 transition-colors hover:text-red-600"
                  title="Удалить свойство"
                  aria-label={`Удалить свойство ${opt.title || optIdx + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>

                <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                  <div className="grid gap-1.5">
                    <Label>Название свойства</Label>
                    <Select value={opt.title} onValueChange={(value) => onUpdateOptionTitle(optIdx, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите свойство" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionTemplates
                          .filter(
                            (template) =>
                              template.title === opt.title || !options.some((item) => item.title === template.title),
                          )
                          .map((template) => (
                            <SelectItem key={template.id} value={template.title}>
                              {template.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 grid gap-1.5">
                    <Label>Значения свойства</Label>
                    {!opt.title ? (
                      <p className="text-apple-ink-muted-48 text-[13px]">Сначала выберите свойство.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {optionTemplates
                          .find((template) => template.title === opt.title)
                          ?.values.map((templateValue) => {
                            const selected = opt.values.includes(templateValue.value)
                            return (
                              <button
                                key={templateValue.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => onToggleOptionValue(optIdx, templateValue.value)}
                                className={`rounded-apple-pill inline-flex min-h-9 items-center gap-1.5 border px-3 text-[13px] transition-colors ${
                                  selected
                                    ? 'border-apple-primary bg-apple-primary text-apple-on-primary'
                                    : 'bg-apple-canvas text-apple-ink border-apple-hairline hover:border-apple-primary'
                                }`}
                              >
                                {selected && <Check className="size-3.5" />}
                                {templateValue.value}
                              </button>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
