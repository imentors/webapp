import { db } from '../utils/drizzle';
import { waitlist } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createWaitlistConfirmationEmail } from '../email-templates';
import { sendEmail } from '../utils/email';

export default defineEventHandler(async (event) => {
  try {
    // Read the request body
    const body = await readBody(event);
    const { email, name } = body;

    // Validate input
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required',
      });
    }

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);

    if (existing) {
      return {
        success: true,
        message: 'You are already on the waitlist!',
        data: existing,
      };
    }

    // Add to waitlist
    const [newEntry] = await db
      .insert(waitlist)
      .values({
        email,
        name,
      })
      .returning();

    try {
      // Send welcome email
      const { subject, htmlContent, textContent } = createWaitlistConfirmationEmail(name || '');
      await sendEmail({
        to: email,
        subject,
        htmlContent,
        textContent,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email sending fails
    }

    return {
      success: true,
      message: 'Successfully joined the waitlist!',
      data: newEntry,
    };
  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add to waitlist',
    });
  }
});