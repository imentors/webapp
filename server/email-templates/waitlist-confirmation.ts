export function createWaitlistConfirmationEmail(userName: string) {
  const subject = 'Welcome to iMentorsPro Waitlist!';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to iMentorsPro Waitlist</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">iMentorsPro</h1>
      </div>
      
      <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to iMentorsPro!</h2>
      
      <p style="margin-bottom: 20px;">Hello ${userName || 'there'},</p>
      
      <p style="margin-bottom: 20px;">You're officially on the iMentorsPro waiting list! We're thrilled to have you on board. Get ready for early access, updates, and exclusive insights to help you grow smarter and faster.</p>
      
      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
          <strong>iMentorsPro Team</strong><br>
          Empowering Founders to Succeed
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `Welcome to iMentorsPro!

Hello ${userName || 'there'},

You're officially on the iMentorsPro waiting list! We're thrilled to have you on board. Get ready for early access, updates, and exclusive insights to help you grow smarter and faster.

--
iMentorsPro Team
Empowering Founders to Succeed`;

  return { subject, htmlContent, textContent };
}
