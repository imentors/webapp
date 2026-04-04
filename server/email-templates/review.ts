interface ReviewReceivedEmailParams {
    mentorName: string
    menteeName: string
    sessionTitle: string
    rating: number
    comment?: string
}

export function createReviewReceivedEmail(params: ReviewReceivedEmailParams): { subject: string; htmlContent: string } {
    const { mentorName, menteeName, sessionTitle, rating, comment } = params

    const stars = '⭐'.repeat(rating)
    const subject = `New ${rating}-Star Review Received!`

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Review Received! 🎉</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                                Hi ${mentorName},
                            </p>
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                                Great news! <strong>${menteeName}</strong> just left a review for your session:
                            </p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                    <strong>Session:</strong> ${sessionTitle}
                                </p>
                                <p style="margin: 0 0 10px; color: #333333; font-size: 20px;">
                                    <strong>Rating:</strong> ${stars} (${rating}/5)
                                </p>
                                ${comment ? `
                                <p style="margin: 0; color: #666666; font-size: 14px;">
                                    <strong>Comment:</strong>
                                </p>
                                <p style="margin: 10px 0 0; color: #333333; font-size: 14px; font-style: italic; line-height: 1.6;">
                                    "${comment}"
                                </p>
                                ` : ''}
                            </div>
                            <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                                Keep up the great work! Your reviews help build trust and attract more mentees.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 30px 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                                           style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            View Your Profile
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #666666; font-size: 14px;">
                                © ${new Date().getFullYear()} iMentorsPro. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim()

    return { subject, htmlContent }
}
