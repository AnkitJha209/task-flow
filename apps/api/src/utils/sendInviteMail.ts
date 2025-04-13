import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

export const sendMail = async (inviteurl: string, name: string, email: string) => {
    // Create reusable transporter object using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // or use 'smtp.ethereal.email' for testing
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Use App Passwords if 2FA is enabled
      },
    });
  
    // HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #4B0082;">🚀 Invitation to join "${name}"</h2>
        <p>Hello Developer,</p>
        <p>You’ve been invited to join the project <strong>${name}</strong> on our platform.</p>
        <p>Click the button below to accept the invite and get started:</p>
        <a href="${inviteurl}" style="display: inline-block; margin-top: 16px; background-color: #4B0082; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
          Accept Invite
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">This link will expire in 2 hours. If you didn’t expect this, you can ignore it.</p>
      </div>
    `;
  
    // Email options
    const mailOptions = {
      from: '"Your App" <your_email@gmail.com>',
      to: `${email}`,
      subject: "Welcome to Our Platform!",
      html: htmlContent,
    };
  
    // Send mail
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      console.log(email);
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };