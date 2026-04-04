import { useRuntimeConfig } from '#imports';

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailOptions) {
  const config = useRuntimeConfig();

  if (!config.brevoApiKey) {
    throw new Error('Brevo API key is not configured');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': config.brevoApiKey,
    },
    body: JSON.stringify({
      sender: { email: 'noreply@imentorspro.com', name: 'iMentorsPro' },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }

  return response.json();
}
