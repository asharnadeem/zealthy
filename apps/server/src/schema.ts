import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Component } from "./types";

function defaultFields() {
  return {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$onUpdateFn(() => new Date()),
  };
}

export const onboardingPagesTable = sqliteTable("onboarding_pages", {
  ...defaultFields(),
  index: integer("index").notNull().unique(),
  components: text("components", { mode: "json" })
    .notNull()
    .$type<Component[]>(),
});

export const usersTable = sqliteTable("users", {
  ...defaultFields(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  aboutMe: text("about_me"),
  birthday: integer("birthday", { mode: "timestamp" }),
});

export const userAddressesTable = sqliteTable("user_addresses", {
  ...defaultFields(),
  userId: text("user_id")
    .references(() => usersTable.id)
    .notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
});
