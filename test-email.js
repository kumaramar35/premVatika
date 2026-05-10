import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Email transporter configuration (same as server.js)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Test email sending
const testEmail = async () => {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  
  try {
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email to admin
    const testInfo = await transporter.sendMail({
      from: `"Hotel Prem Vatika" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Test Email - Booking System',
      text: 'This is a test email from the booking system.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #cfa670;">Test Email - Booking System</h2>
          <p>This is a test email to verify the email configuration is working.</p>
          <p>If you receive this email, the booking notification system is properly configured.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully');
    console.log('Message ID:', testInfo.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(testInfo));
    
    // Also test sending to a client email
    const clientEmail = 'testclient@example.com';
    const clientInfo = await transporter.sendMail({
      from: `"Hotel Prem Vatika" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: 'Test Client Email - Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #cfa670;">Booking Confirmation Test</h2>
          <p>Dear Test User,</p>
          <p>This is a test of the booking confirmation email.</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
            <h3>Test Booking Details</h3>
            <ul>
              <li><strong>Check-in:</strong> January 15, 2024</li>
              <li><strong>Check-out:</strong> January 20, 2024</li>
              <li><strong>Guests:</strong> 2</li>
              <li><strong>Amount:</strong> ₹5000</li>
            </ul>
          </div>
          <p>This is only a test. No actual booking has been made.</p>
        </div>
      `
    });
    
    console.log('✅ Client test email sent successfully');
    console.log('Client Message ID:', clientInfo.messageId);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

testEmail();