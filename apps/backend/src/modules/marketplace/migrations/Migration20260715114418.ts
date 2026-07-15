import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260715114418 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "status" text check ("status" in ('active', 'disabled')) not null default 'active', add column if not exists "store_name" text null, add column if not exists "store_description" text null, add column if not exists "address" text null, add column if not exists "city" text null;`);

    this.addSql(`alter table if exists "vendor_admin" add column if not exists "last_login" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "status", drop column if exists "store_name", drop column if exists "store_description", drop column if exists "address", drop column if exists "city";`);

    this.addSql(`alter table if exists "vendor_admin" drop column if exists "last_login";`);
  }

}
