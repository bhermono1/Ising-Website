import { Resend } from "resend";
import { BUSINESS } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? `${BUSINESS.name} <no-reply@example.com>`;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    // Local/dev fallback so the booking & order flows never hard-fail
    // just because email isn't configured yet.
    console.log(`[email:dev] to=${to} subject="${subject}"`);
    return { id: "dev-noop" };
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("Failed to send email", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to send email", err);
    return null;
  }
}
