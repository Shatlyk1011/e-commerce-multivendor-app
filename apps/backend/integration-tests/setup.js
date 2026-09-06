// The Medusa runner creates and drops its own isolated test database. Reuse only
// connection credentials from local configuration, never the application DB name.
if (process.env.DATABASE_URL) {
  const database = new URL(process.env.DATABASE_URL);
  process.env.DB_HOST ??= database.hostname;
  process.env.DB_PORT ??= database.port || "5432";
  process.env.DB_USERNAME ??= decodeURIComponent(database.username);
  process.env.DB_PASSWORD ??= decodeURIComponent(database.password);
}
