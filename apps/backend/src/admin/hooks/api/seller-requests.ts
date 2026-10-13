import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@medusajs/ui";
import { sdk } from "../../lib/client";
import type { SellerRequest, SellerRequestStatus } from "../../types/seller-request";

export const sellerRequestKeys = { all: ["seller-requests"] as const };
export const useSellerRequests = (params: { limit?: number; offset?: number } = {}) => useQuery<{ seller_requests: SellerRequest[]; count: number }>({
  queryKey: [...sellerRequestKeys.all, params],
  queryFn: () => sdk.client.fetch("/admin/seller-requests", { query: { limit: params.limit ?? 20, offset: params.offset ?? 0 } }),
});
export const useUpdateSellerRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SellerRequestStatus }) =>
      sdk.client.fetch(`/admin/seller-requests/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: sellerRequestKeys.all }); toast.success("Статус заявки обновлён"); },
    onError: (error: Error) => toast.error(error.message || "Не удалось обновить заявку"),
  });
};
