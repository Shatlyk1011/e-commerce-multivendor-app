
analyze skill related with medusajs product items. how can we track and toggle user favorite items?

x
in the image, the login/register functionality shown. the medusa js requires login and password for auth. in our app, the login/register flow will be throught phone number + otp confirmation. the authmodal already has the phonenumber + otp ui logic. i want you to adjust logic by creating new api route for handling the auth in storefront. we will create custom email and hash + key (suggest solutions) password by ourself to satisfy the medusa api from users phone. for dehash, the phone number + secret key required. implement this logic for loggin the user to the storefront. for now, no opt endpoint, but in future i'll add - make space for this logic, and accept 1234 as otp success 

in storefront, i want to create auth guarded profile page for user. according to medusajs docs, what fields available to show to the user. what other fields or endpoint results that will be related to the custom user we can show in profile page? 

x
now we have categories with its subcategories. can we connect the api endpoint with categories to the vendor-store's /create page so when user creates an item, he selects from available list. what ui flow  is most accurate to use to select category with its child categories according to our category structure

x
from google-taxonamy.md categories i want to remove the illegal and non related to ozon alike ecommerce apps categories and 18+ categories as well. what they are? 

x
lets improve authdialog component. when the "получить код" button clicked, the otp state starts in this state, improve dialog modal - make otp fields full width, increase heing to 56px. make the first input autofocus once user enters this state. when 4 digits were provided, auto submit, and if its error, clean the otp field, if success, show toast and close dialog. instead of buttons, show timer 1 minute with resend button. near the user phone number, suggest to change phone number. use design.md for desing guidelines and shadcn component where required.