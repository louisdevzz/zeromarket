import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  github_id: text("github_id").unique().notNull(),
  username: text("username").unique().notNull(),
  name: text("name"),
  avatar: text("avatar"),
  email: text("email"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  packages: many(packages),
}));

export const packages = pgTable(
  "packages",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    namespace: text("namespace").notNull(),
    slug: text("slug").notNull(),
    display_name: text("display_name").notNull(),
    description: text("description").default(""),
    version: text("version").notNull(),
    tags: text("tags").array().default([]),
    changelog: text("changelog").default(""),
    readme: text("readme").default(""),
    downloads: integer("downloads").default(0),
    verified: boolean("verified").default(false),
    author_id: text("author_id").references(() => users.id),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("packages_namespace_slug_idx").on(table.namespace, table.slug)]
);

export const packagesRelations = relations(packages, ({ one, many }) => ({
  author: one(users, {
    fields: [packages.author_id],
    references: [users.id],
  }),
  tools: many(tools),
}));

export const tools = pgTable("tools", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  name: text("name").notNull(),
  description: text("description").default(""),
  wasm_url: text("wasm_url").notNull(),
  manifest_url: text("manifest_url").notNull(),
  package_id: text("package_id").references(() => packages.id, {
    onDelete: "cascade",
  }),
});

export const toolsRelations = relations(tools, ({ one }) => ({
  package: one(packages, {
    fields: [tools.package_id],
    references: [packages.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
