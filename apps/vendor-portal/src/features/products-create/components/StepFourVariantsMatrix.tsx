'use client'

import { HelpCircle, RefreshCw, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { FieldErrors, ProductVariant } from '../utils'

interface StepFourVariantsMatrixProps {
  variants: ProductVariant[]
  onUpdateVariant: <K extends keyof ProductVariant>(index: number, key: K, value: ProductVariant[K]) => void
  hasOptionsConfigured: boolean
  fieldErrors: FieldErrors
  onRegenerateVariants?: () => void
  onRemoveVariant?: (index: number) => void
  mode?: 'create' | 'edit'
}

export function StepFourVariantsMatrix({
  variants,
  onUpdateVariant,
  hasOptionsConfigured,
  fieldErrors,
  onRegenerateVariants,
  onRemoveVariant,
  mode = 'create',
}: StepFourVariantsMatrixProps) {
  return (
    <div className="animate-fade-in">
      <Card
        size={mode === 'edit' ? 'sm' : 'default'}
        className={mode === 'edit' ? 'gap-0 space-y-4 p-5 max-md:p-4' : 'gap-0 space-y-6 p-8 shadow-xs max-md:p-5'}
      >
        <div className="border-apple-divider-soft flex items-start justify-between gap-4 border-b pb-3 max-sm:flex-col">
          <div>
            <h2 className="text-apple-ink text-[17px] font-semibold">
              {mode === 'edit' ? 'Цены и остатки' : 'Шаг 4: Цены и артикулы вариантов'}
            </h2>
            <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
              Название, артикул, штрихкод, цена и доступное количество для каждого варианта.
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
          <div className="rounded-apple-md border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-80 border p-3 text-[13px] leading-relaxed">
            <div className="flex gap-2">
              <HelpCircle className="text-apple-primary mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Стандартный вариант</p>
                <p className="mt-0.5">Свойства не добавлены. Настройте цену и остаток для одного варианта ниже.</p>
              </div>
            </div>
          </div>
        ) : mode === 'create' ? (
          <div className="rounded-apple-md border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-80 border p-3 text-[13px] leading-relaxed">
            <div className="flex gap-2">
              <Sparkles className="text-apple-primary mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Варианты готовы</p>
                <p className="mt-0.5">Укажите цену и остаток для каждого варианта.</p>
              </div>
            </div>
          </div>
        ) : null}

        {variants.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2">Вариант</TableHead>
                  <TableHead className="px-2">Артикул (SKU)</TableHead>
                  <TableHead className="px-2">Штрихкод</TableHead>
                  <TableHead className="px-2">Цена (TMT)</TableHead>
                  <TableHead className="px-2">Остаток (шт.)</TableHead>
                  {onRemoveVariant && <TableHead className="w-10 px-2" aria-label="Действия" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, idx) => (
                  <TableRow key={variant.id ?? idx}>
                    <TableCell className="min-w-40 px-2 py-2">
                      <Input
                        value={variant.title}
                        onChange={(event) => onUpdateVariant(idx, 'title', event.target.value)}
                        aria-label={`Название варианта ${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell className="min-w-40 px-2 py-2">
                      <Input
                        value={variant.sku}
                        onChange={(event) => onUpdateVariant(idx, 'sku', event.target.value)}
                        aria-label={`SKU варианта ${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell className="min-w-36 px-2 py-2">
                      <Input
                        value={variant.barcode}
                        onChange={(event) => onUpdateVariant(idx, 'barcode', event.target.value)}
                        placeholder="Не указан"
                        aria-label={`Штрихкод варианта ${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell className="w-36 px-2 py-2">
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
                          aria-label={`Цена варианта ${idx + 1}`}
                          onChange={(e) => onUpdateVariant(idx, 'price', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="w-36 px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-9 text-[13px]"
                        value={variant.inventory}
                        aria-label={`Остаток варианта ${idx + 1}`}
                        onChange={(e) => onUpdateVariant(idx, 'inventory', e.target.value)}
                      />
                    </TableCell>
                    {onRemoveVariant && (
                      <TableCell className="px-2 py-2">
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
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-apple-ink-muted-48 py-8 text-center text-[14px]">
            Вариантов пока нет. Добавьте свойства и синхронизируйте варианты.
          </div>
        )}
        {fieldErrors.variants && <p className="text-xs text-red-600">{fieldErrors.variants}</p>}
      </Card>
    </div>
  )
}
