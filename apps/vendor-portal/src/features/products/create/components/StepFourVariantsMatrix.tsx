'use client'

import { HelpCircle, Sparkles } from 'lucide-react'

import { Input } from '@/components/ui/input'

import type { FieldErrors, ProductVariant } from '../utils'

interface StepFourVariantsMatrixProps {
  variants: ProductVariant[]
  onUpdateVariant: <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => void
  hasOptionsConfigured: boolean
  fieldErrors: FieldErrors
}

export function StepFourVariantsMatrix({
  variants,
  onUpdateVariant,
  hasOptionsConfigured,
  fieldErrors,
}: StepFourVariantsMatrixProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg space-y-6 border p-8 shadow-xs max-md:p-5">
        <div className="border-apple-divider-soft border-b pb-4">
          <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 4: Цены и артикулы вариантов</h2>
          <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
            Настройте стоимость, SKU и штрихкоды для сгенерированных вариантов товара.
          </p>
        </div>

        {!hasOptionsConfigured ? (
          <div className="rounded-apple-md border border-blue-100 bg-blue-50/50 p-4 text-[13px] leading-relaxed text-blue-800">
            <div className="flex gap-2">
              <HelpCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold">Создание стандартного товара</p>
                <p className="mt-0.5 text-blue-700/90">
                  Вы не добавили свойства (размеры, цвета) на предыдущем шаге. Товар будет создан в единственном
                  стандартном варианте. Настройте его параметры ниже.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-apple-md border border-green-100 bg-green-50/50 p-4 text-[13px] leading-relaxed text-green-800">
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-green-500" />
              <div>
                <p className="font-semibold">Матрица вариантов успешно сгенерирована</p>
                <p className="mt-0.5 text-green-700/90">
                  Варианты автоматически созданы на основе настроенных вами свойств. Укажите цены и артикулы для каждой
                  позиции.
                </p>
              </div>
            </div>
          </div>
        )}

        {variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-apple-hairline text-apple-ink-muted-48 border-b text-[12px] font-semibold uppercase">
                  <th className="px-2 py-3">Вариант</th>
                  <th className="px-2 py-3">Цена (TMT)</th>
                  <th className="px-2 py-3">Артикул (SKU)</th>
                </tr>
              </thead>
              <tbody className="divide-apple-divider-soft divide-y text-[14px]">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="hover:bg-apple-canvas-parchment/30">
                    <td className="text-apple-ink px-2 py-4 font-semibold">{variant.title}</td>
                    <td className="w-40 px-2 py-4">
                      <div className="relative">
                        <span className="text-apple-ink-muted-48 absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px]">
                          m.
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          className="h-9 pl-7 text-[13px]"
                          value={variant.price}
                          onChange={(e) => onUpdateVariant(idx, 'price', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="w-40 px-2 py-4">
                      <Input
                        placeholder="SKU"
                        className="h-9 text-[13px]"
                        value={variant.sku}
                        disabled
                        onChange={(e) => onUpdateVariant(idx, 'sku', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-apple-ink-muted-48 py-8 text-center text-[14px]">
            Ошибка генерации вариантов. Пожалуйста, вернитесь на шаг назад.
          </div>
        )}
        {fieldErrors.variants && <p className="text-xs text-red-600">{fieldErrors.variants}</p>}
      </div>
    </div>
  )
}
