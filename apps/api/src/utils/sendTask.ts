import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

export const sendTaskAssignedMail = async (
    userEmail: string,
    userName: string,
    taskTitle: string,
    taskDescription: string,
    dashboardLink: string
  ) => {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #4B0082;">📌 New Task Assigned</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>You have been assigned a new task in the project.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border-left: 4px solid #4B0082; border-radius: 5px;">
          <p><strong>📝 Task Title:</strong> ${taskTitle}</p>
          <p><strong>📋 Description:</strong> ${taskDescription}</p>
        </div>
  
        <a href="${dashboardLink}" style="display: inline-block; background-color: #4B0082; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">
          View Task in Dashboard
        </a>
  
        <p style="margin-top: 20px; font-size: 13px; color: #888;">Please check your task board for more details.</p>
      </div>
    `;
  
    const mailOptions = {
      from: `"Task Manager" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: `🔔 New Task Assigned: ${taskTitle}`,
      html: htmlContent,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Task assignment email sent to:", userEmail, "Message ID:", info.messageId);
    } catch (err) {
      console.error("Error sending task assignment email:", err);
    }
  };