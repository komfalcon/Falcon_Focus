import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return a test transporter for development
    return nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
): Promise<void> {
  const appUrl = process.env.APP_URL || "http://localhost:8081";
  const resetUrl = `${appUrl}/(auth)/reset-password?token=${resetToken}`;
  const fromEmail = process.env.FROM_EMAIL || "noreply@falconfocus.app";

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Falcon Focus" <${fromEmail}>`,
    to,
    subject: "Reset your Falcon Focus password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a7ea4;">Falcon Focus - Password Reset</h2>
        <p>You requested a password reset for your Falcon Focus account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0a7ea4; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #888; font-size: 12px;">Falcon Focus by Korede Omotosho</p>
      </div>
    `,
    text: `Reset your Falcon Focus password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}
