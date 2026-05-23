import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").$type<"ORG_ADMIN">().notNull().default("ORG_ADMIN"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// User profile table for WasteWizard registration
export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  organizationName: text('organization_name').notNull(),
  category: text('category').notNull(),
  mobileNumber: text('mobile_number').notNull(),
  plan: text('plan').notNull().default('free'), // "free" | "standard" | "enterprise"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// IoT Smart Waste Management tables
export const dustbins = sqliteTable('dustbins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // "wet" or "dry"
  locationName: text('location_name').notNull(),
  latitude: text('latitude').notNull(), // Using text for real values in SQLite
  longitude: text('longitude').notNull(),
  fillLevel: integer('fill_level').notNull().default(0), // 0-100 percentage
  // Dual-compartment support (wet/dry)
  wetLevel: integer('wet_level').notNull().default(0),
  dryLevel: integer('dry_level').notNull().default(0),
  wetStatus: text('wet_status').notNull().default('empty'),
  dryStatus: text('dry_status').notNull().default('empty'),
  status: text('status').notNull().default('empty'), // legacy single-compartment status (kept for backwards compatibility)
  lastCollectionDate: text('last_collection_date'),
  nextCollectionDate: text('next_collection_date'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('dustbins_user_id_idx').on(table.userId),
  userIdIsActiveIdx: index('dustbins_user_id_is_active_idx').on(table.userId, table.isActive),
  statusIdx: index('dustbins_status_idx').on(table.status),
  wetLevelIdx: index('dustbins_wet_level_idx').on(table.wetLevel),
  dryLevelIdx: index('dustbins_dry_level_idx').on(table.dryLevel),
  wetStatusIdx: index('dustbins_wet_status_idx').on(table.wetStatus),
  dryStatusIdx: index('dustbins_dry_status_idx').on(table.dryStatus),
  typeIdx: index('dustbins_type_idx').on(table.type),
  fillLevelIdx: index('dustbins_fill_level_idx').on(table.fillLevel),
}));

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dustbinId: integer('dustbin_id')
    .references(() => dustbins.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  type: text('type').notNull(), // "info", "warning", "alert"
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
  userIdIsReadIdx: index('notifications_user_id_is_read_idx').on(table.userId, table.isRead),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dustbinId: integer('dustbin_id')
    .notNull()
    .references(() => dustbins.id, { onDelete: 'cascade' }),
  scheduledDate: text('scheduled_date').notNull(),
  completedDate: text('completed_date'),
  status: text('status').notNull().default('scheduled'), // "scheduled", "in_progress", "completed", "cancelled"
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('collections_user_id_idx').on(table.userId),
  userIdStatusIdx: index('collections_user_id_status_idx').on(table.userId, table.status),
  scheduledDateIdx: index('collections_scheduled_date_idx').on(table.scheduledDate),
  dustbinIdIdx: index('collections_dustbin_id_idx').on(table.dustbinId),
}));

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  dustbinId: integer('dustbin_id')
    .notNull()
    .references(() => dustbins.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  wasteCollectedKg: text('waste_collected_kg').notNull(), // Using text for real values
  fillLevelAvg: integer('fill_level_avg').notNull(),
  collectionsCount: integer('collections_count').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('analytics_user_id_idx').on(table.userId),
  userIdDateIdx: index('analytics_user_id_date_idx').on(table.userId, table.date),
  dustbinIdIdx: index('analytics_dustbin_id_idx').on(table.dustbinId),
}));