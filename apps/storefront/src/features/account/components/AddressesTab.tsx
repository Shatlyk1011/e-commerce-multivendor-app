'use client'

import { useState } from 'react'

import type { StoreCustomerAddress } from '@medusajs/types'
import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { useDeleteAddress, useUpdateAddress } from '../api/queries'
import { AddressModal } from './AddressModal'

interface AddressesTabProps {
  addresses: StoreCustomerAddress[]
}

export function AddressesTab({ addresses }: AddressesTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<StoreCustomerAddress | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const deleteMutation = useDeleteAddress()
  const updateMutation = useUpdateAddress()

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (addr: StoreCustomerAddress) => {
    setEditingAddress(addr)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteMutation.mutateAsync(deleteTargetId)
      setDeleteTargetId(null)
    }
  }

  const handleSetDefault = async (addr: StoreCustomerAddress) => {
    await updateMutation.mutateAsync({
      addressId: addr.id,
      data: { is_default_shipping: true },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-apple-ink flex items-center gap-2 text-xl font-semibold tracking-[-0.28px]">
            <MapPin className="text-apple-primary h-5 w-5" /> Мои адреса
          </h2>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5">
            Управление адресами доставки для быстрой покупки
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-apple-primary gap-1.5 self-start rounded-full px-5 text-xs font-semibold text-white sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Добавить новый адрес
        </Button>
      </div>

      {/* Address Book Grid */}
      {addresses.length === 0 ? (
        <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas border p-12 text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
          <h3 className="text-apple-ink text-base font-semibold">У вас пока нет сохраненных адресов</h3>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-1 mb-4">
            Добавьте адрес доставки, чтобы быстро оформлять заказы.
          </p>
          <Button
            onClick={handleOpenAdd}
            className="bg-apple-primary rounded-full px-6 text-xs font-semibold text-white"
          >
            + Добавить адрес
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`rounded-apple-lg bg-apple-canvas flex flex-col justify-between border p-5 transition-all ${
                addr.is_default_shipping
                  ? 'border-apple-primary ring-apple-primary/20 ring-1'
                  : 'border-apple-hairline hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-apple-ink text-[15px] font-semibold">{addr.address_name || 'Адрес доставки'}</h3>
                  {addr.is_default_shipping && (
                    <Badge
                      variant="outline"
                      className="bg-apple-primary/10 text-apple-primary border-apple-primary/20 text-[10px]"
                    >
                      По умолчанию
                    </Badge>
                  )}
                </div>

                <p className="text-apple-ink text-[14px] font-medium">
                  {[addr.first_name, addr.last_name].filter(Boolean).join(' ') || ''}
                </p>

                <p className="text-apple-ink-muted-80 text-apple-caption mt-1 leading-relaxed">
                  {[addr.city, addr.address_1, addr.address_2, addr.province, addr.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>

                {addr.phone && <p className="text-apple-ink-muted-48 mt-2 font-mono text-[12px]">Тел: {addr.phone}</p>}
              </div>

              <div className="border-apple-divider-soft mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  {!addr.is_default_shipping && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr)}
                      className="text-apple-primary text-xs font-medium hover:underline"
                    >
                      Сделать основным
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(addr)}
                    className="text-apple-ink-muted-80 hover:text-apple-ink h-8 rounded-full px-2.5 text-xs"
                  >
                    <Edit2 className="mr-1 h-3.5 w-3.5" /> Редактировать
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="text-destructive h-8 rounded-full px-2.5 text-xs hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add / Edit */}
      <AddressModal address={editingAddress} open={modalOpen} onOpenChange={setModalOpen} />

      {/* Delete confirmation */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить адрес?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Адрес будет удалён из вашей адресной книги.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="py-4">
            <AlertDialogCancel className="rounded-full text-[13px] font-semibold">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 rounded-full text-[13px] font-semibold text-white disabled:opacity-40"
            >
              {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
