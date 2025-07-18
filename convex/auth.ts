import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Resend({
            id: "resend",
            apiKey: process.env.AUTH_RESEND_KEY,
            from: "ShipOrSkip <noreply@shiporskip.com>",
            // Enhanced email template configuration with better styling and UX
            sendVerificationRequest: async ({ identifier: email, url, provider }) => {
                const { host } = new URL(url);

                // Use the Resend API directly for custom email templates
                const resend = new (await import('resend')).Resend(process.env.AUTH_RESEND_KEY);

                try {
                    const result = await resend.emails.send({
                        from: provider.from || "ShipOrSkip <noreply@shiporskip.com>",
                        to: email,
                        subject: "🔐 Your magic link to sign in to ShipOrSkip",
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Sign in to ShipOrSkip</title>
                            </head>
                            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">ShipOrSkip</h1>
                                        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your magic link is ready</p>
                                    </div>
                                    
                                    <!-- Content -->
                                    <div style="padding: 40px 20px;">
                                        <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Sign in to ${host}</h2>
                                        <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 16px; line-height: 1.5;">
                                            Click the button below to securely sign in to your account. This link will work for the next 15 minutes.
                                        </p>
                                        
                                        <!-- CTA Button -->
                                        <div style="text-align: center; margin: 32px 0;">
                                            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); transition: all 0.2s;">
                                                🔐 Sign In to ShipOrSkip
                                            </a>
                                        </div>
                                        
                                        <!-- Alternative link -->
                                        <div style="margin: 32px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
                                            <p style="color: #374151; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Can't click the button?</p>
                                            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Copy and paste this link into your browser:</p>
                                            <p style="color: #667eea; margin: 0; font-size: 12px; word-break: break-all; font-family: monospace;">${url}</p>
                                        </div>
                                        
                                        <!-- Security notice -->
                                        <div style="margin: 32px 0 0 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                            <p style="color: #92400e; margin: 0; font-size: 14px;">
                                                <strong>🛡️ Security Notice:</strong> This link expires in 15 minutes and can only be used once. 
                                                If you didn't request this email, you can safely ignore it.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                            This email was sent by ShipOrSkip. If you have any questions, please contact our support team.
                                        </p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `,
                        text: `🔐 Sign in to ShipOrSkip

Hi there!

Click the link below to sign in to your account on ${host}:

${url}

This link will expire in 15 minutes for security reasons.

If you can't click the link, copy and paste it into your browser.

Security Notice: If you didn't request this email, you can safely ignore it.

---
ShipOrSkip Team`,
                    });

                    console.log("Magic link email sent successfully:", result.data?.id || "Email sent");
                } catch (error) {
                    console.error("Failed to send magic link email:", error);

                    // Enhanced error handling for different failure scenarios
                    if (error && typeof error === 'object' && 'message' in error) {
                        const errorMessage = (error as Error).message;
                        if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
                            throw new Error('Rate limit exceeded. Please wait a moment before requesting another link.');
                        } else if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
                            throw new Error('Invalid email address. Please check your email and try again.');
                        } else if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
                            throw new Error('Email service configuration error. Please contact support.');
                        }
                    }

                    throw new Error('Failed to send magic link. Please try again in a moment.');
                }
            },
        }),
    ],
});