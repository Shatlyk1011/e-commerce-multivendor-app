import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260903173511 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "seller_request" ("id" text not null, "name" text not null, "brand_name" text not null, "business_type" text check ("business_type" in ('registered', 'in_progress', 'none')) not null, "phone" text not null, "address" text not null, "status" text check ("status" in ('new', 'in_review', 'approved', 'rejected')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_request_deleted_at" ON "seller_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "seller_request" cascade;`);
  }

}
