const { defineConfig } = require("@mikro-orm/core");
const { SqliteDriver } = require("@mikro-orm/sqlite");

module.exports = defineConfig({
  entities: ["./src/lib/entities/**/*.ts"],
  entitiesTs: ["./src/lib/entities/**/*.ts"],
  dbName: "rest-client.db",
  driver: SqliteDriver,
  debug: process.env.NODE_ENV === "development",
  migrations: {
    path: "./src/lib/migrations",
    glob: "!(*.d).{js,ts}",
  },
  discovery: {
    warnWhenNoEntities: false,
  },
});