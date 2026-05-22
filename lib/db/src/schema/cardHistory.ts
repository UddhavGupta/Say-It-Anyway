import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardHistoryTable = pgTable("card_history", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  cardId: text("card_id").notNull(),
  mode: text("mode").notNull(),
  level: integer("level"),
  shownAt: timestamp("shown_at", { withTimezone: true }).notNull().defaultNow(),
  advancedByPlayerName: text("advanced_by_player_name").notNull(),
});

export const insertCardHistorySchema = createInsertSchema(cardHistoryTable).omit({ shownAt: true });
export type InsertCardHistory = z.infer<typeof insertCardHistorySchema>;
export type CardHistory = typeof cardHistoryTable.$inferSelect;
