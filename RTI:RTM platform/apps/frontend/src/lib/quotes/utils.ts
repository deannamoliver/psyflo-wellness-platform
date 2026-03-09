import { type Quote, quotes } from "@feelwell/database";
import { count } from "drizzle-orm";
import { serverDrizzle } from "../database/drizzle";

export async function getDailyQuote(date: Date): Promise<Quote> {
  const db = await serverDrizzle();

  const result = await db.admin.select({ count: count() }).from(quotes);

  const totalQuotes = result[0]?.count ?? 0;

  if (totalQuotes === 0) {
    throw new Error("No quotes found in database");
  }

  // Calculate which quote to fetch based on date
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const quoteOffset = daysSinceEpoch % totalQuotes;

  const [dailyQuote] = await db.admin
    .select()
    .from(quotes)
    .limit(1)
    .offset(quoteOffset);

  if (!dailyQuote) {
    return {
      id: "1",
      quote: "That's one small step for man, one giant leap for mankind",
      author: "Neil Armstrong",
      year: 1969,
      source: "Moon Landing",
      themes: ["inspiration"],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  return dailyQuote;
}
