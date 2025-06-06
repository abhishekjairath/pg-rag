import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

export const essays = pgTable("essays", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  link: text("link").notNull(),
});

// Schema for essays - used to validate API requests
export const insertEssaySchema = createSelectSchema(essays)
  .extend({})
  .omit({
    id: true,
  });

// Type for essays - used to type API request params and within Components
export type NewEssayParams = z.infer<typeof insertEssaySchema>; 