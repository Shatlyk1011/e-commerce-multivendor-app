import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@medusajs/ui";
import { sdk } from "../../lib/client";
import type {
  VendorListResponse,
  VendorResponse,
  CreateVendorInput,
  UpdateVendorInput,
} from "../../types/vendor";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const vendorQueryKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorQueryKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...vendorQueryKeys.lists(), params] as const,
  details: () => [...vendorQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorQueryKeys.details(), id] as const,
};

// ─── List Vendors ─────────────────────────────────────────────────────────────

type UseVendorsParams = {
  q?: string;
  limit?: number;
  offset?: number;
};

export const useVendors = (params: UseVendorsParams = {}) => {
  return useQuery<VendorListResponse>({
    queryKey: vendorQueryKeys.list(params),
    queryFn: () =>
      sdk.client.fetch<VendorListResponse>("/admin/vendors", {
        query: {
          q: params.q || undefined,
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
        },
      }),
  });
};

// ─── Single Vendor ────────────────────────────────────────────────────────────

export const useVendor = (id: string) => {
  return useQuery<VendorResponse>({
    queryKey: vendorQueryKeys.detail(id),
    queryFn: () => sdk.client.fetch<VendorResponse>(`/admin/vendors/${id}`),
    enabled: !!id,
  });
};

// ─── Create Vendor ────────────────────────────────────────────────────────────

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorInput) =>
      sdk.client.fetch<VendorResponse>("/admin/vendors", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });
      toast.success("Vendor created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create vendor");
    },
  });
};

// ─── Update Vendor ────────────────────────────────────────────────────────────

export const useUpdateVendor = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVendorInput) =>
      sdk.client.fetch<VendorResponse>(`/admin/vendors/${id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });
      toast.success("Vendor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vendor");
    },
  });
};

// ─── Delete Vendor ────────────────────────────────────────────────────────────

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch<{ id: string; deleted: boolean }>(
        `/admin/vendors/${id}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });
      toast.success("Vendor deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vendor");
    },
  });
};

// ─── Reset Vendor Password ───────────────────────────────────────────────────

export const useResetVendorPassword = (id: string) => {
  return useMutation({
    mutationFn: (data: { email: string; password?: string }) =>
      sdk.client.fetch<{ success: boolean }>(
        `/admin/vendors/${id}/reset-password`,
        {
          method: "POST",
          body: data,
        },
      ),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
};
