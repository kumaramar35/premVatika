import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Create a test account on Ethereal.email (fake SMTP service)
const createTestAccountAndTransporter = async () => {
  console.log('Creating Ethereal test account for email testing...');
  
  try {
    // Create a test account (this is free and doesn't require real credentials)
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Ethereal test account created');
    console.log('Test user:', testAccount.user);
    console.log('Test pass:', testAccount.pass);
    console.log('SMTP host:', testAccount.smtp.host);
    console.log('SMTP port:', testAccount.smtp.port);
    console.log('SMTP secure:', testAccount.smtp.secure);
    
    // Create transporter using test account
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    return { transporter, testAccount };
  } catch (error) {
    console.error('❌ Failed to create test account:', error.message);
    throw error;
  }
};

// Test email sending with Ethereal
const testEmailWithEthereal = async () => {
  console.log('\n=== Testing Email with Ethereal (Fake SMTP) ===');
  
  try {
    const { transporter, testAccount } = await createTestAccountAndTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email to admin
    const testInfo = await transporter.sendMail({
      from: '"Hotel Prem Vatika" <noreply@premvatika.com>',
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      subject: 'Test Email - Booking System (Ethereal)',
      text: 'This is a test email from the booking system using Ethereal.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #cfa670;">Test Email - Booking System</h2>
          <p>This is a test email to verify the email configuration is working.</p>
          <p><strong>Using Ethereal.email (fake SMTP service for testing)</strong></p>
          <p>If you receive this email, the booking notification system is properly configured.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <p>You can view this email at: <a href="https://ethereal.email">https://ethereal.email</a></p>
          <p>Login with:</p>
          <ul>
            <li>Email: ${testAccount.user}</li>
            <li>Password: ${testAccount.pass}</li>
          </ul>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully');
    console.log('Message ID:', testInfo.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(testInfo));
    
    // Also send to a client email
    const clientEmail = 'client@example.com';
    const clientInfo = await transporter.sendMail({
      from: '"Hotel Prem Vatika" <noreply@premvatika.com>',
      to: clientEmail,
      subject: 'Your Booking Confirmation - Hotel Prem Vatika',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #cfa670; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Hotel Prem Vatika</h1>
            <p style="margin: 5px 0 0 0;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #333; margin-top: 0;">Dear Test Client,</h2>
            <p>Thank you for booking with Hotel Prem Vatika! Your booking has been confirmed.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #cfa670;">Booking Details:</h3>
              <p><strong>Check-in:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p><strong>Guests:</strong> 2 Adults</p>
              <p><strong>Room:</strong> Deluxe Room</p>
              <p><strong>Total Amount:</strong> ₹5,000</p>
            </div>
            
            <p>We look forward to welcoming you!</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
              <p>This is a test email sent via Ethereal.email. No actual booking has been made.</p>
              <p>To view this email online, visit: <a href="https://ethereal.email">https://ethereal.email</a></p>
            </div>
          </div>
        </div>
      `
    });
    
    console.log('✅ Client test email sent successfully');
    console.log('Client email Preview URL:', nodemailer.getTestMessageUrl(clientInfo));
    
    console.log('\n=== IMPORTANT ===');
    console.log('To view sent emails:');
    console.log('1. Go to https://ethereal.email');
    console.log('2. Login with:');
    console.log('   - Email:', testAccount.user);
    console.log('   - Password:', testAccount.pass);
    console.log('3. Check the inbox for sent emails');
    console.log('4. You can also use the preview URLs above');
    
    return { success: true, testAccount };
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Also test the actual Gmail configuration to see if it works
const testGmailConfig = async () => {
  console.log('\n=== Testing Gmail Configuration ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    return { success: true };
  } catch (error) {
    console.error('❌ Gmail configuration error:', error.message);
    console.log('\n=== GMAIL SETUP INSTRUCTIONS ===');
    console.log('1. Enable 2-factor authentication on your Google account');
    console.log('2. Generate an App Password:');
    console.log('   - Go to https://myaccount.google.com/security');
    console.log('   - Under "Signing in to Google", select "App passwords"');
    console.log('   - Generate a password for "Mail" app');
    console.log('   - Use that password in .env file as EMAIL_PASSWORD');
    console.log('3. OR enable "Less secure app access" (not recommended)');
    return { success: false, error: error.message };
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting email configuration tests...\n');
  
  // Test Gmail config first
  const gmailResult = await testGmailConfig();
  
  // If Gmail fails, use Ethereal for testing
  if (!gmailResult.success) {
    console.log('\nGmail configuration failed. Using Ethereal for testing...');
    await testEmailWithEthereal();
  } else {
    console.log('\nGmail configuration works! You can use real emails.');
    console.log('To test actual email sending, you would need to:');
    console.log('1. Make a real booking through the frontend');
    console.log('2. Or run the server and test the /verify-payment endpoint');
  }
};

runTests().catch(console.error);