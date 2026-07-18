'use client'

import { useEffect, useMemo, useState } from 'react'

import type { VendorOrder, VendorOrdersResponse } from '@dtc/api-contracts'
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { medusa } from '@/lib/medusa'

const PAGE_SIZE = 20

const statusLabels: Record<string, string> = {
  pending: 'Новый',
  completed: 'Завершён',
  archived: 'Архивирован',
  canceled: 'Отменён',
  requires_action: 'Требует действия',
}

function formatStatus(status?: string) {
  return statusLabels[status || ''] || status || 'Неизвестно'
}

function statusClass(status?: string) {
  if (status === 'completed') return 'border-green-200 bg-green-50 text-green-700'
  if (status === 'canceled' || status === 'archived') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatMoney(amount: number | undefined, currency: string) {
  return `${(amount || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadOrders() {
      setIsLoading(true)
      try {
        const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
        if (status !== 'all') query.set('status', status)
        const response = await medusa.client.fetch<VendorOrdersResponse>(`/vendors/orders?${query.toString()}`)
        if (active) {
          setOrders(response.orders || [])
          setCount(response.count || 0)
        }
      } catch (error) {
        if (active)
          toast.error('Ошибка загрузки заказов', {
            description: error instanceof Error ? error.message : 'Не удалось загрузить заказы.',
          })
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadOrders()
    return () => {
      active = false
    }
  }, [offset, status])

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return orders
    return orders.filter((order) =>
      String(order.display_id || order.id)
        .toLowerCase()
        .includes(term),
    )
  }, [orders, search])

  const page = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="border-apple-hairline mb-6 flex items-end justify-between gap-4 border-b pb-6 max-md:flex-col max-md:items-start">
          <div>
            <p className="text-apple-primary mb-2 text-[12px] font-semibold tracking-[0.12em] uppercase">Продажи</p>
            <h1 className="text-apple-display-md text-apple-ink font-semibold tracking-tight">Заказы</h1>
            <p className="text-apple-caption text-apple-ink-muted-48 mt-1">Отслеживайте заказы и статус исполнения.</p>
          </div>
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-md flex items-center gap-2 border px-3 py-2 text-[13px]">
            <ClipboardList className="text-apple-primary size-4" />
            <span className="font-semibold">{count}</span>
            <span className="text-apple-ink-muted-48">всего заказов</span>
          </div>
        </div>

        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg mb-4 flex gap-3 border p-4 max-sm:flex-col">
          <div className="relative flex-1">
            <Search className="text-apple-ink-muted-48 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по номеру заказа..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              setOffset(0)
            }}
          >
            <SelectTrigger className="h-full w-48 max-sm:w-full">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">Новые</SelectItem>
              <SelectItem value="completed">Завершённые</SelectItem>
              <SelectItem value="canceled">Отменённые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg overflow-hidden border">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="text-apple-primary size-7 animate-spin" />
              <p className="text-apple-ink-muted-48 mt-3 text-sm">Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
              <CalendarDays className="text-apple-ink-muted-48 mb-3 size-8 opacity-50" />
              <h2 className="font-heading text-apple-ink text-lg font-semibold">Заказы не найдены</h2>
              <p className="text-apple-ink-muted-48 mt-1 text-sm">
                Новые заказы появятся здесь после оформления покупки.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Заказ</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Товары</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-semibold">#{order.display_id || order.id.slice(-8)}</div>
                        {order.metadata?.parent_order_id && (
                          <div className="text-apple-ink-muted-48 mt-0.5 text-[11px]">Составной заказ</div>
                        )}
                      </TableCell>
                      <TableCell className="text-apple-ink-muted-80 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[260px] truncate">
                          {order.items?.[0]?.variant?.product?.title || order.items?.[0]?.title || 'Товары'}
                        </div>
                        <div className="text-apple-ink-muted-48 text-[12px]">
                          {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} шт.
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusClass(order.status)}>{formatStatus(order.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        {formatMoney(order.total, order.currency_code)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {count > 0 && (
          <div className="text-apple-ink-muted-48 mt-4 flex items-center justify-between text-[13px]">
            <span>
              Показано {offset + 1}-{Math.min(offset + PAGE_SIZE, count)} из {count}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft />
              </Button>
              <span className="flex min-w-16 items-center justify-center">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={offset + PAGE_SIZE >= count}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
