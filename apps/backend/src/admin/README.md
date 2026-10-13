# Admin Customizations

You can extend the Medusa Admin to add widgets and new pages. Your customizations interact with API routes to provide merchants with custom functionalities.

> Learn more about Admin Extensions in [this documentation](https://docs.medusajs.com/learn/fundamentals/admin).

## Orders Table

The `/app/orders` table uses the delivery and cash-payment metadata from the
order delivery widget. Both views share the types, labels, and fallback values
in `lib/order-delivery.ts`; the table cells are in
`components/order-delivery-columns.tsx`.

The built-in Medusa table is customized through
`patches/@medusajs__dashboard.patch` at the repository root. Its import resolves
through the `@marketplace/order-delivery-columns` Vite alias in
`medusa-config.ts`. Keep the source and compiled dashboard changes in that
patch when upgrading Medusa. The patch also preserves the TMT currency entry.

## Example: Create a Widget

A widget is a React component that can be injected into an existing page in the admin dashboard.

For example, create the file `src/admin/widgets/product-widget.tsx` with the following content:

```tsx title="src/admin/widgets/product-widget.tsx"
import { defineWidgetConfig } from "@medusajs/admin-sdk";

// The widget
const ProductWidget = () => {
  return (
    <div>
      <h2>Product Widget</h2>
    </div>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductWidget;
```

This inserts a widget with the text “Product Widget” at the end of a product’s details page.
