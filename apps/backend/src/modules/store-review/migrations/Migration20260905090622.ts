import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905090622 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "store_review" ("id" text not null, "customer_id" text not null, "vendor_id" text not null, "checkout_order_id" text not null, "order_id" text not null, "author_name" text not null, "rating" integer not null, "comment" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_review_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_store_review_deleted_at" ON "store_review" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_review_customer_vendor_checkout" ON "store_review" ("customer_id", "vendor_id", "checkout_order_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_store_review_vendor" ON "store_review" ("vendor_id") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_review" cascade;`);
  }
}
