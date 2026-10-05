import { config } from "./config";

type Mail = { to: string; subject: string; text: string };

/** Sends through Resend. Without RESEND_API_KEY the email is only logged (handy in development). */
export async function sendEmail({ to, subject, text }: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email disabled] to=${to} subject=${subject}\n${text}`);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Traybox <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });
  if (!response.ok) {
    console.error("Email failed", response.status, await response.text());
    return false;
  }
  return true;
}

export function licenseEmail(key: string, maxActivations: number): { subject: string; text: string } {
  const support = config.supportEmail ? `\nQuestions? Reply to ${config.supportEmail}.` : "";
  return {
    subject: "Your Traybox license key",
    text: `Thanks for buying Traybox.

Your license key:

  ${key}

Open Traybox, enter the key on the activation screen, and you're set.
The key works on up to ${maxActivations} Macs. To move it to another Mac, deactivate it in
Traybox's Settings on the old one first.
${support}`,
  };
}
