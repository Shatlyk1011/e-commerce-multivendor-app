import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  ContainerRegistrationKeys,
  Modules,
  generateJwtToken,
} from "@medusajs/framework/utils";
import type { ConfigModule, OrderDTO } from "@medusajs/framework/types";
import type {
  OrderStoresResponse,
  StoreReviewsResponse,
} from "@dtc/api-contracts";
import { MARKETPLACE_MODULE } from "../../src/modules/marketplace";
import type MarketplaceModuleService from "../../src/modules/marketplace/service";

jest.setTimeout(120_000);

medusaIntegrationTestRunner({
  inApp: true,
  testSuite: ({ api, getContainer }) => {
    describe("store reviews", () => {
      let buyerId: string;
      let vendorId: string;
      let otherVendorId: string;
      let headers: Record<string, string>;
      let strangerHeaders: Record<string, string>;
      let publicHeaders: Record<string, string>;
      let adminHeaders: Record<string, string>;
      let parent: OrderDTO;
      let delivered: OrderDTO;
      let pending: OrderDTO;

      async function makeOrder(
        customerId: string,
        storeId?: string,
        parentId?: string,
        status = "delivered",
      ) {
        const container = getContainer();
        const order = await container.resolve(Modules.ORDER).createOrders({
          customer_id: customerId,
          currency_code: "usd",
          items: [{ title: "Review test goods", quantity: 1, unit_price: 25 }],
          metadata: {
            ...(parentId ? { parent_order_id: parentId } : {}),
            delivery_status: status,
            payment_method: "cash",
            cash_payment_status: "collected",
          },
        });
        if (storeId) {
          await container.resolve(ContainerRegistrationKeys.LINK).create({
            [MARKETPLACE_MODULE]: { vendor_id: storeId },
            [Modules.ORDER]: { order_id: order.id },
          });
        }
        return order;
      }

      async function moderateReview(id: string, status: "approved" | "rejected") {
        const response = await api.get("/admin/store-reviews?status=all", { headers: adminHeaders });
        const review = response.data.reviews.find((entry: { id: string }) => entry.id === id);
        return api.post(
          `/admin/store-reviews/${id}`,
          { status, expected_rating: review.rating, expected_comment: review.comment },
          { headers: adminHeaders },
        );
      }

      beforeEach(async () => {
        const container = getContainer();
        const customers = await container
          .resolve(Modules.CUSTOMER)
          .createCustomers([
            {
              first_name: "Review",
              last_name: "Buyer",
              email: "review-buyer@example.test",
            },
            { first_name: "Other", email: "review-other@example.test" },
          ]);
        buyerId = customers[0].id;
        const marketplace: MarketplaceModuleService =
          container.resolve(MARKETPLACE_MODULE);
        const vendors = await marketplace.createVendors([
          { name: "Store A", handle: "review-store-a" },
          { name: "Store B", handle: "review-store-b" },
        ]);
        vendorId = vendors[0].id;
        otherVendorId = vendors[1].id;
        const key = await container
          .resolve(Modules.API_KEY)
          .createApiKeys({
            title: "Review tests",
            type: "publishable",
            created_by: "test",
          });
        publicHeaders = { "x-publishable-api-key": key.token };
        const config: ConfigModule = container.resolve(
          ContainerRegistrationKeys.CONFIG_MODULE,
        );
        const tokenFor = (id: string) =>
          generateJwtToken(
            {
              actor_id: id,
              actor_type: "customer",
              auth_identity_id: "test-auth",
              app_metadata: { customer_id: id },
            },
            { secret: config.projectConfig.http.jwtSecret!, expiresIn: "1h" },
          );
        headers = {
          ...publicHeaders,
          Authorization: `Bearer ${tokenFor(buyerId)}`,
        };
        strangerHeaders = {
          ...publicHeaders,
          Authorization: `Bearer ${tokenFor(customers[1].id)}`,
        };
        adminHeaders = {
          Authorization: `Bearer ${generateJwtToken(
            {
              actor_id: "test-admin",
              actor_type: "user",
              auth_identity_id: "test-admin-auth",
              app_metadata: { user_id: "test-admin" },
            },
            { secret: config.projectConfig.http.jwtSecret!, expiresIn: "1h" },
          )}`,
        };
        parent = await makeOrder(buyerId, undefined, undefined, "preparing");
        delivered = await makeOrder(buyerId, vendorId, parent.id);
        pending = await makeOrder(
          buyerId,
          otherVendorId,
          parent.id,
          "out_for_delivery",
        );
      });

      it("holds a new review for admin approval before publishing it", async () => {
        const response = await api.get(`/store/orders/${parent.id}/stores`, {
          headers,
        });
        const { stores } = response.data as OrderStoresResponse;
        expect(stores).toHaveLength(2);
        expect(
          stores.find((store) => store.order_id === delivered.id)?.can_review,
        ).toBe(true);
        expect(
          stores.find((store) => store.order_id === pending.id)?.can_review,
        ).toBe(false);
        const created = await api.post(
          "/store/store-reviews",
          { order_id: delivered.id, rating: 5, comment: "  Good store  " },
          { headers },
        );
        expect(created.status).toBe(201);
        expect(created.data.review.comment).toBe("Good store");
        expect(created.data.review.status).toBe("pending");
        const hidden = await api.get(`/store/vendors/${vendorId}/reviews`, {
          headers: publicHeaders,
        });
        expect(hidden.data).toMatchObject({
          count: 0,
          reviews: [],
          summary: { average_rating: null, review_count: 0 },
        });
        await expect(api.get("/admin/store-reviews", { headers: publicHeaders }))
          .rejects.toMatchObject({ response: { status: 401 } });
        const queue = await api.get("/admin/store-reviews", { headers: adminHeaders });
        expect(queue.data.reviews[0]).toMatchObject({
          id: created.data.review.id,
          vendor_name: "Store A",
          status: "pending",
          comment: "Good store",
        });
        await moderateReview(created.data.review.id, "approved");
        const published = await api.get(`/store/vendors/${vendorId}/reviews`, {
          headers: publicHeaders,
        });
        expect(published.data.summary).toEqual({
          average_rating: 5,
          review_count: 1,
        });
        expect(Object.keys(published.data.reviews[0]).sort()).toEqual(
          [
            "id",
            "rating",
            "comment",
            "author_name",
            "verified_purchase",
            "created_at",
            "updated_at",
          ].sort(),
        );
        expect(published.data.reviews[0].author_name).toBe("Review B");
        const refreshed = await api.get(`/store/orders/${parent.id}/stores`, {
          headers,
        });
        expect(
          refreshed.data.stores.find(
            (store: { order_id: string }) => store.order_id === delivered.id,
          ).review.id,
        ).toBe(created.data.review.id);
        expect(refreshed.data.stores.find(
          (store: { order_id: string }) => store.order_id === delivered.id,
        ).review.status).toBe("approved");
        await api.post(
          `/store/store-reviews/${created.data.review.id}`,
          { rating: 1, comment: "Edited after approval" },
          { headers },
        );
        const hiddenAgain = await api.get(`/store/vendors/${vendorId}/reviews`, { headers: publicHeaders });
        expect(hiddenAgain.data.summary.review_count).toBe(0);
        const pendingAgain = await api.get("/admin/store-reviews", { headers: adminHeaders });
        expect(pendingAgain.data.reviews[0].status).toBe("pending");
        await expect(api.post(
          `/admin/store-reviews/${created.data.review.id}`,
          { status: "approved", expected_rating: 5, expected_comment: "Good store" },
          { headers: adminHeaders },
        )).rejects.toMatchObject({ response: { status: 409 } });
      });

      it("rejects anonymous access, other buyers, unrelated orders, and premature reviews", async () => {
        await expect(
          api.get(`/store/orders/${parent.id}/stores`, {
            headers: publicHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 401 } });
        await expect(
          api.get(`/store/orders/${parent.id}/stores`, {
            headers: strangerHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 404 } });
        for (const [orderId, auth, status] of [
          [delivered.id, strangerHeaders, 404],
          [pending.id, headers, 400],
          [parent.id, headers, 400],
        ] as const) {
          await expect(
            api.post(
              "/store/store-reviews",
              { order_id: orderId, rating: 4, comment: "Review" },
              { headers: auth },
            ),
          ).rejects.toMatchObject({ response: { status } });
        }
        await expect(
          api.post(
            "/store/store-reviews",
            { order_id: delivered.id, rating: 5, comment: "Review" },
            { headers: publicHeaders },
          ),
        ).rejects.toMatchObject({ response: { status: 401 } });
      });

      it("handles single-store pickup and permits a new review for a later purchase", async () => {
        const first = await makeOrder(
          buyerId,
          vendorId,
          undefined,
          "picked_up",
        );
        const second = await makeOrder(buyerId, vendorId);
        const response = await api.get(`/store/orders/${first.id}/stores`, {
          headers,
        });
        expect(response.data.stores).toHaveLength(1);
        expect(response.data.stores[0].can_review).toBe(true);
        for (const order of [first, second]) {
          await api.post(
            "/store/store-reviews",
            { order_id: order.id, rating: 4, comment: "Good" },
            { headers },
          );
        }
        const response2 = await api.get(`/store/vendors/${vendorId}/reviews`, {
          headers: publicHeaders,
        });
        expect(response2.data.count).toBe(0);
        const queue = await api.get("/admin/store-reviews", { headers: adminHeaders });
        expect(queue.data.count).toBe(2);
      });

      it("prevents duplicates during simultaneous submissions and restricts editing to the author", async () => {
        const requests = await Promise.allSettled(
          [1, 2].map(() =>
            api.post(
              "/store/store-reviews",
              {
                order_id: delivered.id,
                rating: 5,
                comment: "Original",
              },
              { headers },
            ),
          ),
        );
        expect(
          requests.filter((result) => result.status === "fulfilled"),
        ).toHaveLength(1);
        const reviewId = (requests.find((result) => result.status === "fulfilled") as PromiseFulfilledResult<Awaited<ReturnType<typeof api.post>>>).value.data.review.id;
        await expect(
          api.post(
            `/store/store-reviews/${reviewId}`,
            { rating: 1, comment: "Other buyer" },
            { headers: strangerHeaders },
          ),
        ).rejects.toMatchObject({ response: { status: 404 } });
        await expect(
          api.post(
            `/store/store-reviews/${reviewId}`,
            { rating: 1, comment: "Anonymous" },
            { headers: publicHeaders },
          ),
        ).rejects.toMatchObject({ response: { status: 401 } });
        await api.post(
          `/store/store-reviews/${reviewId}`,
          { rating: 3, comment: "Updated" },
          { headers },
        );
        const hidden = await api.get(`/store/vendors/${vendorId}/reviews`, { headers: publicHeaders });
        expect(hidden.data.count).toBe(0);
        await moderateReview(reviewId, "approved");
        const updated = await api.get(`/store/vendors/${vendorId}/reviews`, {
          headers: publicHeaders,
        });
        expect(updated.data.summary).toEqual({
          average_rating: 3,
          review_count: 1,
        });
        expect(updated.data.reviews[0]).toMatchObject({
          id: reviewId,
          comment: "Updated",
        });
        await moderateReview(reviewId, "rejected");
        const rejected = await api.get(`/store/vendors/${vendorId}/reviews`, { headers: publicHeaders });
        expect(rejected.data.summary.review_count).toBe(0);
        await api.post(`/store/store-reviews/${reviewId}`, { rating: 4, comment: "Retry" }, { headers });
        const owned = await api.get(`/store/orders/${parent.id}/stores`, { headers });
        expect(owned.data.stores.find((store: { order_id: string }) => store.order_id === delivered.id).review.status).toBe("pending");
      });

      it("rejects cancelled store orders and cancelled checkouts", async () => {
        const orders = getContainer().resolve(Modules.ORDER);
        await orders.updateOrders(delivered.id, { status: "canceled" });
        await expect(
          api.post(
            "/store/store-reviews",
            { order_id: delivered.id, rating: 5, comment: "Cancelled" },
            { headers },
          ),
        ).rejects.toMatchObject({ response: { status: 400, data: { type: "not_allowed" } } });
        await orders.updateOrders(delivered.id, { status: "pending" });
        await orders.updateOrders(parent.id, { status: "canceled" });
        await expect(
          api.post(
            "/store/store-reviews",
            { order_id: delivered.id, rating: 5, comment: "Cancelled" },
            { headers },
          ),
        ).rejects.toMatchObject({ response: { status: 400, data: { type: "not_allowed" } } });
      });

      it("validates rating, comment, identifiers, and pagination", async () => {
        for (const body of [
          { rating: 0, comment: "Bad" },
          { rating: 6, comment: "Bad" },
          { rating: 1.5, comment: "Bad" },
          { rating: 5, comment: "   " },
          { rating: 5, comment: "x".repeat(2001) },
          { rating: 5, comment: "Good", vendor_id: otherVendorId },
        ]) {
          await expect(
            api.post(
              "/store/store-reviews",
              { order_id: delivered.id, ...body },
              { headers },
            ),
          ).rejects.toMatchObject({ response: { status: 400 } });
        }
        await expect(
          api.get(`/store/vendors/${vendorId}/reviews?offset=-1`, {
            headers: publicHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 400 } });
      });

      it("paginates public reviews and keeps store aggregates separate", async () => {
        for (const rating of [2, 4]) {
          const order = await makeOrder(buyerId, vendorId);
          const created = await api.post(
            "/store/store-reviews",
            { order_id: order.id, rating, comment: "Good" },
            { headers },
          );
          await moderateReview(created.data.review.id, "approved");
        }
        const first = await api.get(
          `/store/vendors/${vendorId}/reviews?limit=1`,
          { headers: publicHeaders },
        );
        const second = await api.get(
          `/store/vendors/${vendorId}/reviews?limit=1&offset=1`,
          { headers: publicHeaders },
        );
        const page = first.data as StoreReviewsResponse;
        expect(page.count).toBe(2);
        expect(page.reviews).toHaveLength(1);
        expect(page.summary).toEqual({ average_rating: 3, review_count: 2 });
        expect(page.reviews[0].id).not.toBe(second.data.reviews[0].id);
        const other = await api.get(`/store/vendors/${otherVendorId}/reviews`, {
          headers: publicHeaders,
        });
        expect(other.data.summary).toEqual({
          average_rating: null,
          review_count: 0,
        });
      });
    });
  },
});
