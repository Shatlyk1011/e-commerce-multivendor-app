'use client'

import { Plus, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'

import type { FieldErrors, ProductOption, ProductVariant } from '../utils'
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
  onAddOption: () => void
  onRemoveOption: (index: number) => void
  onUpdateOptionTitle: (index: number, title: string) => void
  onUpdateOptionInputValue: (index: number, value: string) => void
  onAddOptionValue: (index: number) => void
  onRemoveOptionValue: (optIndex: number, valIndex: number) => void
  onGenerateVariants: () => void
  // Variants
  variants: ProductVariant[]
  onUpdateVariant: <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => void
  fieldErrors: FieldErrors
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
  onAddOption,
  onRemoveOption,
  onUpdateOptionTitle,
  onUpdateOptionInputValue,
  onAddOptionValue,
  onRemoveOptionValue,
  onGenerateVariants,
  variants,
  onUpdateVariant,
  fieldErrors,
}: StepThreeVariantsProps) {
  return (
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
        <div className="border-apple-divider-soft grid grid-cols-2 gap-4 border-t pt-6 max-sm:grid-cols-1">
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
            onClick={onAddOption}
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
                  onClick={() => onRemoveOption(optIdx)}
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
                      onChange={(e) => onUpdateOptionTitle(optIdx, e.target.value)}
                    />
                  </div>

                  {/* Value inputs */}
                  <div className="col-span-2 grid gap-1.5">
                    <Label>Значения свойства</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Введите значение и нажмите Добавить"
                        value={opt.inputValue}
                        onChange={(e) => onUpdateOptionInputValue(optIdx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            onAddOptionValue(optIdx)
                          }
                        }}
                      />
                      <Button type="button" variant="outline" className="h-10" onClick={() => onAddOptionValue(optIdx)}>
                        Добавить
                      </Button>
                    </div>

                    {opt.values.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {opt.values.map((val, valIdx) => (
                          <span
                            key={valIdx}
                            className="bg-apple-canvas text-apple-ink border-apple-hairline rounded-apple-pill inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-0.5 text-[13px] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onRemoveOptionValue(optIdx, valIdx)}
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
                onClick={onGenerateVariants}
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
              Задайте цену, SKU и штрихкод для сгенерированных вариантов.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-apple-hairline text-apple-ink-muted-48 border-b text-[12px] font-semibold uppercase">
                  <th className="px-2 py-3">Вариант</th>
                  <th className="px-2 py-3">Цена (TMT)</th>
                  <th className="px-2 py-3">Артикул (SKU)</th>
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
                          onChange={(e) => onUpdateVariant(idx, 'price', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="w-36 px-2 py-4">
                      <Input
                        placeholder="SKU"
                        className="h-9 text-[13px]"
                        value={variant.sku}
                        onChange={(e) => onUpdateVariant(idx, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="w-32 px-2 py-4">
                      <Input
                        placeholder="Barcode"
                        className="h-9 text-[13px]"
                        value={variant.barcode}
                        onChange={(e) => onUpdateVariant(idx, 'barcode', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {fieldErrors.variants && <p className="text-xs text-red-600">{fieldErrors.variants}</p>}
    </div>
  )
}
