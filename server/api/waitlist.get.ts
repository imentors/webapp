import { db } from '../utils/drizzle';
import { waitlist } from '../db/schema';
import { desc, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    // In a real app, you'd want to add authentication here
    // const session = await requireAuth(event);
    
    const query = getQuery(event);
    const limit = Number(query.limit) || 100;
    const offset = Number(query.offset) || 0;

    // Get waitlist entries with pagination
    const entries = await db
      .select()
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(waitlist);

    const total = countResult?.count || 0;

    return {
      success: true,
      data: {
        entries,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + entries.length < total,
        },
      },
    };
  } catch (error: any) {
    console.error('Error fetching waitlist:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch waitlist',
    });
  }
});