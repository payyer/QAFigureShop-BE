import nodemailer from "nodemailer";
import { AppError } from "../middleware/appError.js";

class EmailService {
  private transporter: nodemailer.Transporter;
  private isTestAccount = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: "", pass: "" }, // Placeholder, will be overwritten
    });
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      // 1. Use Real SMTP (Gmail, Mailtrap, SendGrid)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log("📧 Email Service: Using configured SMTP server.");
    } else {
      // 2. Fallback to Ethereal (Dev Mode)
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        this.isTestAccount = true;
        console.log(
          "🧪 Email Service: Using Ethereal Test Account (No .env config found).",
        );
      } catch (error) {
        console.error(
          "❌ Email Service: Failed to create test account.",
          error,
        );
      }
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const baseUrl = process.env.BASE_URL_BE || "http://localhost:5000";
    // Using Backend URL for now as we are testing API directly
    const verificationUrl = `${baseUrl}/api/auth/verify/${token}`;

    // Future Frontend logic:
    // const feUrl = process.env.BASE_URL_FE || "http://localhost:3000";
    // const verificationUrl = `${feUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: '"QA Figure Shop" <no-reply@figureshop.com>',
      to,
      subject: "Xác thực tài khoản của bạn",
      html: `
        <h1>Chào mừng bạn đến với QA Figure Shop!</h1>
        <p>Vui lòng click vào link bên dưới để kích hoạt tài khoản:</p>
        <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Xác thực ngay</a>
        <p>Hoặc copy link này: ${verificationUrl}</p>
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent: ${info.messageId}`);
      if (this.isTestAccount) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error("❌ Error sending email:", error);
      // Don't block registration if email fails, but maybe log it
      throw new AppError("Không thể gửi email xác thực", 500);
    }
  }
}

export const emailService = new EmailService();
