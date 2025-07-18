import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Resend({
            id: "resend",
            apiKey: process.env.AUTH_RESEND_KEY,
            from: "ShipOrSkip <noreply@shiporskip.com>",
            // Custom email template configuration
            sendVerificationRequest: async ({ identifier: email, url, provider }) => {
                const { host } = new URL(url);

                // Use the Resend API directly for custom email templates
                const resend = new (await import('resend')).Resend(process.env.AUTH_RESEND_KEY);

                try {
                    await resend.emails.send({
                        from: provider.from || "ShipOrSkip <noreply@shiporskip.com>",
                        to: email,
                        subject: "Sign in to ShipOrSkip",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #333; margin-bottom: 20px;">Sign in to ${host}</h2>
                                <p style="color: #666; margin-bottom: 20px;">Click the button below to sign in to your account:</p>
                                <a href="${url}" style="display: inline-block; background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign In</a>
                                <p style="color: #999; font-size: 14px; margin-top: 20px;">If you did not request this email, you can safely ignore it.</p>
                                <p style="color: #999; font-size: 14px;">This link will expire in 15 minutes for security reasons.</p>
                            </div>
                        `,
                        text: `Sign in to ${host}\n\nClick the link below to sign in:\n${url}\n\nIf you did not request this email, you can safely ignore it.\n\nThis link will expire in 15 minutes for security reasons.`,
                    });
                } catch (error) {
                    console.error("Failed to send email:", error);
                    throw error;
                }
            },
        }),
    ],
});