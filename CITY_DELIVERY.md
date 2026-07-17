# Vendor Origin-City Delivery

## Purpose

For the current release, every vendor sells and delivers products within one city only: the vendor's origin city. Multi-city and country-wide delivery will be added later.

## How it works

1. An admin creates a vendor and must enter an **Origin City**.
2. The vendor cannot remove this city when editing their store profile.
3. When the vendor creates a product, the backend reads the city from the authenticated vendor profile. The vendor portal does not ask the seller to choose it.
4. The product is saved with this metadata:

   ```json
   {
     "delivery_scope": "origin_city",
     "delivery_city": "Ashgabat"
   }
   ```

5. When an order is completed through `POST /store/carts/:id/complete-vendor`, the customer's shipping-address city must match the product's `delivery_city`. Otherwise, the order is rejected.

## Important rules

- The backend is the source of truth. A request cannot choose a different delivery city for a product.
- A vendor without an origin city cannot create new products.
- Existing products are not changed automatically. Only newly created vendor products receive the origin-city delivery metadata.
- Products without `delivery_scope: "origin_city"` are not restricted by this temporary rule. This preserves the current behaviour for existing platform products.

## Relevant code

- Vendor validation: `apps/backend/src/api/admin/vendors/route.ts`
- Product city assignment: `apps/backend/src/workflows/marketplace/create-vendor-product/index.tsx`
- Checkout validation: `apps/backend/src/workflows/marketplace/create-vendor-orders/steps/validate-cart-delivery-city.ts`
- Vendor portal notice: `apps/vendor-portal/src/app/dashboard/products/create/page.tsx`

## Future expansion

The next phase can replace this single-city metadata rule with an Admin-managed city list and allow products to be available in selected cities or all active cities.
