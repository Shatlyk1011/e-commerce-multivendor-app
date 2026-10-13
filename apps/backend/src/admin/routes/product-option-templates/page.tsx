import { useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Plus, Tag, Trash } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  Prompt,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sdk } from "../../lib/client";

type ProductOptionValue = {
  id: string;
  value: string;
};

type ProductOptionTemplate = {
  id: string;
  title: string;
  is_active: boolean;
  values: ProductOptionValue[];
};

type ProductOptionTemplatesResponse = {
  product_option_templates: ProductOptionTemplate[];
};

const ProductOptionTemplatesPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [valuesInput, setValuesInput] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<ProductOptionTemplate | null>(null);

  const { data, isLoading } = useQuery<ProductOptionTemplatesResponse>({
    queryKey: ["product-option-templates"],
    queryFn: () => sdk.client.fetch("/admin/product-option-templates"),
  });

  const createTemplate = useMutation({
    mutationFn: (input: { title: string; values: string[] }) =>
      sdk.client.fetch("/admin/product-option-templates", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-option-templates"] });
      toast.success("Шаблон опции создан");
      setTitle("");
      setValuesInput("");
      setCreateOpen(false);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Не удалось создать шаблон опции"),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/product-option-templates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-option-templates"] });
      toast.success("Шаблон опции удалён");
      setDeleteTarget(null);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Не удалось удалить шаблон опции"),
  });

  const handleCreate = () => {
    const values = [
      ...new Set(
        valuesInput
          .split(/[,\n]/)
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
    if (!title.trim() || values.length === 0) {
      toast.error("Укажите название опции и хотя бы одно значение");
      return;
    }
    createTemplate.mutate({ title: title.trim(), values });
  };

  return (
    <>
      <div className="flex flex-col gap-y-4 p-6">
        <div className="flex items-start justify-between gap-x-4">
          <div>
            <Heading level="h1">Шаблоны опций товаров</Heading>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              Управляйте названиями и значениями опций, доступных продавцам при
              создании товаров.
            </Text>
          </div>
          <Button size="small" onClick={() => setCreateOpen(true)}>
            <Plus />
            Добавить шаблон
          </Button>
        </div>

        <Container className="p-0">
          <div className="border-b px-6 py-4">
            <Text size="small" leading="compact" weight="plus">
              Доступные шаблоны
            </Text>
          </div>
          {isLoading ? (
            <div className="flex justify-center px-6 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ui-border-strong border-t-transparent" />
            </div>
          ) : data?.product_option_templates.length ? (
            <div className="divide-y">
              {data.product_option_templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between gap-x-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <Text size="small" leading="compact" weight="plus">
                      {template.title}
                    </Text>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.values.map((value) => (
                        <Badge key={value.id} size="2xsmall">
                          {value.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="small"
                    variant="transparent"
                    onClick={() => setDeleteTarget(template)}
                  >
                    <Trash className="text-ui-fg-subtle" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <Text size="small" className="text-ui-fg-subtle">
                Шаблонов пока нет. Добавьте размер, цвет или другую опцию.
              </Text>
            </div>
          )}
        </Container>
      </div>

      <FocusModal open={createOpen} onOpenChange={setCreateOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={createTemplate.isPending}
                  >
                  Отмена
                  </Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  isLoading={createTemplate.isPending}
                  onClick={handleCreate}
                >
                  Сохранить
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto flex w-full max-w-xl flex-col gap-y-5 py-6">
                <div>
                  <Heading level="h2">Добавить шаблон опции товара</Heading>
                  <Text size="small" className="mt-1 text-ui-fg-subtle">
                    Продавцы смогут выбирать только это название и добавленные
                    здесь значения.
                  </Text>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="option-template-title">Название опции</Label>
                  <Input
                    id="option-template-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Размер"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="option-template-values">Значения</Label>
                  <textarea
                    id="option-template-values"
                    value={valuesInput}
                    onChange={(event) => setValuesInput(event.target.value)}
                    placeholder={"S, M, L, XL\nили по одному значению в строке"}
                    className="min-h-28 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm outline-none focus:border-ui-border-interactive"
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Разделяйте значения запятыми или переносом строки.
                  </Text>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      <Prompt
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Удалить «{deleteTarget?.title}»?</Prompt.Title>
            <Prompt.Description>
              Продавцы больше не смогут использовать эту опцию для новых
              товаров. Существующие товары не изменятся.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel onClick={() => setDeleteTarget(null)}>
              Отмена
            </Prompt.Cancel>
            <Prompt.Action
              onClick={() =>
                deleteTarget && deleteTemplate.mutate(deleteTarget.id)
              }
              disabled={deleteTemplate.isPending}
            >
              Удалить
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  );
};

export const config = defineRouteConfig({
  label: "Опции товаров",
  icon: Tag,
});

export default ProductOptionTemplatesPage;
