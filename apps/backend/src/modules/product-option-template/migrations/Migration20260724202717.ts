import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260724202717 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_product_option_template" drop constraint if exists "vendor_product_option_template_title_unique";`);
    this.addSql(`create table if not exists "vendor_product_option_template" ("id" text not null, "title" text not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_product_option_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_product_option_template_title_unique" ON "vendor_product_option_template" ("title") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_option_template_deleted_at" ON "vendor_product_option_template" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_product_option_template_value" ("id" text not null, "value" text not null, "template_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_product_option_template_value_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_option_template_value_template_id" ON "vendor_product_option_template_value" ("template_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_option_template_value_deleted_at" ON "vendor_product_option_template_value" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_product_option_template_value" add constraint "vendor_product_option_template_value_template_id_foreign" foreign key ("template_id") references "vendor_product_option_template" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_product_option_template_value" drop constraint if exists "vendor_product_option_template_value_template_id_foreign";`);

    this.addSql(`drop table if exists "vendor_product_option_template" cascade;`);

    this.addSql(`drop table if exists "vendor_product_option_template_value" cascade;`);
  }

}
