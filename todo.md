
analyze skill related with medusajs product items. how can we track and toggle user favorite items?

in storefront, i want to create auth guarded profile page for user. according to medusajs docs, what fields available to show to the user. what other fields or endpoint results that will be related to the custom user we can show in profile page? 


y
in storefront in product id, update the page - fetch the product by id, update ui according to fetched fields.

y
in vendor-store to products/create page, add step 4 which will automatically parse the matrix variants according to user's selected data in on he steps to step 4. if no matrix variants available, suggest to create a new item for his store

x
in vendor store app, once we created the product, we can safely leave the page, so no alert if we successfully created product

in vendor store update ui so it looks nice for store item variant section (see image)

in current setup, how can we optimize images in vendor-store before uploading to storage. is using sharp package available in this setup?  


fix steps bug (when going from 3 to 4 the form submits)

when creating the products, add input field for handling inventory items (to see how many items available). so when creating the product, seller will specify this field

how to handle the multilanguage support in medusa storefront so the user's selected language will affect to storefront items as well.

in store-vendor, integrate i18n in 2 language - turkmen and russian. send corrsponding header to admin panel with user's language 