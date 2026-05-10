import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Gmail SMTP configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function testGmail() {
  try {
    console.log('Verifying Gmail SMTP connection...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful!');
    
    // Try sending a test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'kumaramar35@gmail.com',
      subject: 'Test Email from Prem Vatika Backend',
      text: 'This is a test email to verify Gmail SMTP configuration is working correctly.',
      html: '<p>This is a test email to verify Gmail SMTP configuration is working correctly.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Gmail SMTP test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'EAUTH') {
      console.log('\n⚠️ Authentication failed. Possible issues:');
      console.log('1. Make sure you\'re using an App Password (not your regular Gmail password)');
      console.log('2. Enable 2-Step Verification in your Google Account');
      console.log('3. Generate a new 16-character App Password for "Mail"');
      console.log('4. Check that less secure app access is enabled (if not using App Password)');
    }
  }
}

testGmail();