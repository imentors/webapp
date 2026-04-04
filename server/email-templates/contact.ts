export function createContactUsEmail(name: string, email: string, subject: string, message: string) {
  const emailSubject = `New Contact Form Submission: ${subject}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">iMentorsPro</h1>
      </div>
      
      <h2 style="color: #1f2937; margin-bottom: 20px;">New Contact Message Received</h2>
      
      <div style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 25px;">
        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name} (${email})</p>
        <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 0;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 4px; margin-top: 10px; color: #4b5563;">${message}</p>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
          <strong>iMentorsPro Admin Notification</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `New Contact Message Received

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

--
iMentorsPro Admin Notification`;

  return { subject: emailSubject, htmlContent, textContent };
}
