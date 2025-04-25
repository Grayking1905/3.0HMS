/**
 * Represents an email message with recipient, subject, and body.
 */
export interface Email {
  /**
   * The recipient's email address.
   */
to: string;
  /**
   * The subject of the email.
   */
  subject: string;
  /**
   * The body of the email.
   */
  body: string;
}

/**
 * Asynchronously sends an email.
 *
 * @param email The email to send.
 * @returns A promise that resolves when the email is sent.
 */
export async function sendEmail(email: Email): Promise<void> {
  // TODO: Implement this by calling an SMTP service like SendGrid or Nodemailer.

  console.log(`Sending email to ${email.to} with subject ${email.subject}`);
}
