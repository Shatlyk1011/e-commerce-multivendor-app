import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260731181829 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_order_operation" drop constraint if exists "vendor_order_operation_status_check";`);

    this.addSql(`update "vendor_order_operation" set "status" = 'courier_handoff' where "status" = 'preparing';`);

    this.addSql(`alter table if exists "vendor_order_operation" add constraint "vendor_order_operation_status_check" check("status" in ('new', 'courier_handoff', 'cancelled'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_order_operation" drop constraint if exists "vendor_order_operation_status_check";`);

    this.addSql(`alter table if exists "vendor_order_operation" add constraint "vendor_order_operation_status_check" check("status" in ('new', 'preparing', 'courier_handoff', 'cancelled'));`);
  }

}
