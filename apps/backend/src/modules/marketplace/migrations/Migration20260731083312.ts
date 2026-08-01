import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260731083312 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_order_operation" drop constraint if exists "vendor_order_operation_order_id_unique";`);
    this.addSql(`create table if not exists "vendor_order_operation" ("id" text not null, "order_id" text not null, "status" text check ("status" in ('new', 'preparing', 'courier_handoff', 'cancelled')) not null, "cancellation_reason" text null, "updated_by_vendor_admin_id" text not null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_order_operation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_order_operation_order_id_unique" ON "vendor_order_operation" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_order_operation_vendor_id" ON "vendor_order_operation" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_order_operation_deleted_at" ON "vendor_order_operation" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_order_operation" add constraint "vendor_order_operation_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_order_operation" cascade;`);
  }

}
