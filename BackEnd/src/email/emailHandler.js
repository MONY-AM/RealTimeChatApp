import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../email/emailTemplate.js";
import { ENV } from "../lib/env.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    // In development, send all emails to your own verified address to avoid Resend's sandbox restrictions.
    // In production, this will send to the actual user's email.
    to: ENV.NODE_ENV === "development" ? "monyyean6@gmail.com" : email,
    subject: "Welcome to Messenger",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  console.log("Welcome email sent:", data);
};
