import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261015000000 extends Migration {
  override async up(): Promise<void> {
    // Reviews submitted before moderation existed were already public.
    this.addSql(
      `alter table if exists "store_review" add column if not exists "status" text not null default 'approved';`,
    );
    this.addSql(
      `alter table if exists "store_review" alter column "status" set default 'pending';`,
    );
    this.addSql(
      `alter table if exists "store_review" add constraint "store_review_status_check" check ("status" in ('pending', 'approved', 'rejected'));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_store_review_status_created" ON "store_review" ("status", "created_at") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_store_review_status_created";`);
    this.addSql(`alter table if exists "store_review" drop column if exists "status";`);
  }
}
