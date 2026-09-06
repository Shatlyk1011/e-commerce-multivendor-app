import { Module } from "@medusajs/framework/utils";
import StoreReviewModuleService from "./service";

export const STORE_REVIEW_MODULE = "storeReview";

export default Module(STORE_REVIEW_MODULE, {
  service: StoreReviewModuleService,
});
