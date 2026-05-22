import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomsTable = pgTable("rooms", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  isFixedRoom: boolean("is_fixed_room").notNull().default(false),
  activeMode: text("active_mode").notNull().default("classic"),
  activeLevel: integer("active_level"),
  activeRelationshipFilter: text("active_relationship_filter").notNull().default("all"),
  currentCardId: text("current_card_id"),
  currentCardIndex: integer("current_card_index").notNull().default(0),
  shuffledDeckOrder: text("shuffled_deck_order").array().notNull().default([]),
  afterDarkUnlocked: boolean("after_dark_unlocked").notNull().default(false),
  createdByPlayerName: text("created_by_player_name").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ createdAt: true, updatedAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
