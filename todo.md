
analyze skill related with medusajs product items. how can we track and toggle user favorite items?


in storefront, i want to create auth guarded profile page for user. according to medusajs docs, what fields available to show to the user. what other fields or endpoint results that will be related to the custom user we can show in profile page? 

in storefront in product id, update the page - fetch the product by id, update ui according to fetched fields.

y
in vendor-store to products/create page, add step 4 which will automatically parse the matrix variants according to user's selected data in on he steps to step 4. if no matrix variants available, suggest to create a new item for his store

in vendor store update ui so it looks nice for store item variant section (see image)

in current setup, how can we optimize images in vendor-store before uploading to storage. is using sharp package available in this setup?  

x
when creating the products, add input field for handling inventory items (to see how many items available). so when creating the product, seller will specify this field

how to handle the multilanguage support in medusa storefront so the user's selected language will affect to storefront items as well.

in store-vendor, integrate i18n in 2 language - turkmen and russian. send corrsponding header to admin panel with user's language 

store item same fields create,details,storefront-details

i want update CartSheet's added item's ui by showing the sizes, variants of added items. also add link to title, when clicked goes to product id page. and there is bug when the cart item cant increase its value, the ui value still changes by increasing. if it fails, it should not increase

x
update cart ui (show sizes variants and fix quantity issue) 

product review.


say there is item with 10 quantity, if user A adds 5 of them to the card, can user B add 7 of them to his cart? 



<!-- magic pattern -->
for an e-commerce application, i want create custom profile page with orders history grid with status, profile fields updatable, adresses which is, favorities grid

For each order, Medusa provides useful account data including display_id, status, payment_status, fulfillment_status,
created_at, currency_code, totals, items,
shipping/billing address, shipping methods, fulfillments, and payment collection
information. This is enough for an order history page and detailed order page.
I'd structure the profile as:
1. Overview - greeting, masked verified phone, name-completion CTA, last 3 orders, default address.
2. My orders - list and order-detail views with fulfillment status and line items.
3. Addresses - create/edit/delete address book, defaults.
4. Personal information - first name, last name, company name; email displayed as "not added" until you implement a verified email flow.
5. Security - verified phone and logout. Add "change phone" later as a dedicated
OTP flow.
Avoid showing or building these until you add backend support:
- Saved cards: Medusa does not provide a generic customer saved-payment-method profile API.
- Wishlist, loyalty points, preferred city, avatar, marketing preferences, reviews: these need custom modules/endpoints carefully scoped metadata.
- Phone-number change: must update the phone Auth Identity, not only customer.phone.
Official references: Customer Store API (https://docs.medusais.com/api/store#customers), Orders Store API (https://docs.medusajs.com/api/store#orders), profile guide (https://docs.medusajs.com/resources/storefront-development/customers/profile), and address guide (https://docs.medusajs.com/resources/storefront-development/customers/addresses).


<!--  -->