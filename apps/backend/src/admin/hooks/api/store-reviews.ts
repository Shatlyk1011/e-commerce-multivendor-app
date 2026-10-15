import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@medusajs/ui";
import { sdk } from "../../lib/client";
import type { AdminStoreReviewsResponse, StoreReviewStatus } from "../../types/store-review";

const reviewKeys = { all: ["admin-store-reviews"] as const };

export function useStoreReviews(params: {
  status: StoreReviewStatus | "all";
  limit: number;
  offset: number;
}) {
  return useQuery<AdminStoreReviewsResponse>({
    queryKey: [...reviewKeys.all, params],
    queryFn: () => sdk.client.fetch("/admin/store-reviews", { query: params }),
  });
}

export function useModerateStoreReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, expected_rating, expected_comment }: {
      id: string;
      status: "approved" | "rejected";
      expected_rating: number;
      expected_comment: string;
    }) => sdk.client.fetch(`/admin/store-reviews/${id}`, {
      method: "POST",
      body: { status, expected_rating, expected_comment },
    }),
    onSuccess: (_result, { status }) => {
      client.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success(status === "approved" ? "Отзыв опубликован" : "Отзыв отклонён");
    },
    onError: (error: Error) => {
      client.invalidateQueries({ queryKey: reviewKeys.all });
      toast.error(error.message || "Не удалось обновить отзыв");
    },
  });
}
