import { relations, sql } from "drizzle-orm";
import { pgEnum, pgPolicy, pgTable, uuid } from "drizzle-orm/pg-core";
import { authUsers, supabaseAuthAdminRole } from "drizzle-orm/supabase";
import { v7 as uuidv7 } from "uuid";
import { timestamps } from "./column-utils";

export const universalEmotionEnum = pgEnum("universal_emotion", [
  "happy",
  "sad",
  "afraid",
  "angry",
  "disgusted",
  "surprised",
  "bad",
]);

export const specificEmotionEnum = pgEnum("specific_emotion", [
  // happy
  "playful",
  "joyful",
  "curious",
  "confident",
  "valued",
  "creative",
  "peaceful",
  "hopeful",

  // sad
  "lonely",
  "left_out",
  "guilty",
  "embarrassed",
  "empty",
  "hurt",
  "let_down",

  // afraid
  "scared",
  "nervous",
  "worried",
  "insecure",
  "powerless",
  "threatened",

  // angry
  "disrespected",
  "holding_a_grudge",
  "mad",
  "jealous",
  "aggressive",
  "frustrated",
  "annoyed",

  // disgusted
  "grossed_out",
  "horrified",
  "disapproving",
  "disappointed",
  "offended",

  // surprised
  "excited",
  "shocked",
  "amazed",
  "confused",
  "startled",
  "anxious",

  // bad
  "blah",
  "tired",
  "stressed",
  "bored",
  "overwhelmed",
  "distracted",
  "excluded",
]);

export const moodCheckIns = pgTable(
  "mood_check_ins",
  {
    id: uuid()
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    universalEmotion: universalEmotionEnum(),
    specificEmotion: specificEmotionEnum(),
    ...timestamps,
  },
  () => [
    pgPolicy("admin can manage all mood check ins", {
      for: "all",
      to: supabaseAuthAdminRole,
      using: sql`true`,
    }),
  ],
);

export const moodCheckInsRelations = relations(moodCheckIns, ({ one }) => ({
  user: one(authUsers, {
    fields: [moodCheckIns.userId],
    references: [authUsers.id],
  }),
}));

export type MoodCheckIn = typeof moodCheckIns.$inferSelect;
