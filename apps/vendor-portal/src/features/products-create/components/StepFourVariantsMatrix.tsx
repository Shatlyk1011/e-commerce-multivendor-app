'use client'

import { HelpCircle, RefreshCw, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { FieldErrors, ProductVariant } from '../utils'

interface StepFourVariantsMatrixProps {
  variants: ProductVariant[]
  onUpdateVariant: <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => void
  hasOptionsConfigured: boolean
  fieldErrors: FieldErrors
  onRegenerateVariants?: () => void
  onRemoveVariant?: (index: number) => void
}

export function StepFourVariantsMatrix({
  variants,
  onUpdateVariant,
  hasOptionsConfigured,
  fieldErrors,
  onRegenerateVariants,
  onRemoveVariant,
}: StepFourVariantsMatrixProps) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg space-y-6 border p-8 shadow-xs max-md:p-5">
        <div className="border-apple-divider-soft flex items-start justify-between gap-4 border-b pb-4 max-sm:flex-col">
          <div>
            <h2 className="text-apple-ink text-[17px] font-semibold">Шаг 4: Цены и артикулы вариантов</h2>
            <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
              Измените название, SKU, штрихкод, цену и остаток каждого варианта.
            </p>
          </div>
          {onRegenerateVariants && (
            <Button type="button" variant="outline" size="sm" onClick={onRegenerateVariants}>
              <RefreshCw className="size-4" />
              Синхронизировать
            </Button>
          )}
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
                  <th className="px-2 py-3">SKU</th>
                  <th className="px-2 py-3">Штрихкод</th>
                  <th className="px-2 py-3">Цена (TMT)</th>
                  <th className="px-2 py-3">Доступно (шт.)</th>
                  {onRemoveVariant && <th className="w-10 px-2 py-3" aria-label="Действия" />}
                </tr>
              </thead>
              <tbody className="divide-apple-divider-soft divide-y text-[14px]">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="hover:bg-apple-canvas-parchment/30">
                    <td className="min-w-48 px-2 py-4">
                      <Input
                        value={variant.title}
                        onChange={(event) => onUpdateVariant(idx, 'title', event.target.value)}
                        aria-label={`Название варианта ${idx + 1}`}
                      />
                    </td>
                    <td className="min-w-48 px-2 py-4">
                      <Input
                        value={variant.sku}
                        onChange={(event) => onUpdateVariant(idx, 'sku', event.target.value)}
                        aria-label={`SKU варианта ${idx + 1}`}
                      />
                    </td>
                    <td className="min-w-44 px-2 py-4">
                      <Input
                        value={variant.barcode}
                        onChange={(event) => onUpdateVariant(idx, 'barcode', event.target.value)}
                        placeholder="Не указан"
                        aria-label={`Штрихкод варианта ${idx + 1}`}
                      />
                    </td>
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
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-9 text-[13px]"
                        value={variant.inventory}
                        onChange={(e) => onUpdateVariant(idx, 'inventory', e.target.value)}
                      />
                    </td>
                    {onRemoveVariant && (
                      <td className="px-2 py-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemoveVariant(idx)}
                          disabled={variants.length === 1}
                          aria-label={`Удалить вариант ${variant.title}`}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </td>
                    )}
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
