import { createHmac } from 'crypto';
import axios from 'axios';

// Test data
const RAZORPAY_KEY_SECRET = 'Pe7uLUJulrYbTa2LyVkQ6Y5h'; // From .env
const razorpay_order_id = 'order_test_' + Date.now();
const razorpay_payment_id = 'pay_test_' + Date.now();

// Generate signature
const sign = razorpay_order_id + '|' + razorpay_payment_id;
const razorpay_signature = createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(sign.toString())
  .digest('hex');

// Booking data
const bookingData = {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  roomId: 'test-room-123',
  checkIn: new Date().toISOString().split('T')[0],
  checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  name: 'Test User',
  email: 'testuser@example.com',
  phone: '+919876543210',
  guests: 2,
  amount: 5000,
  specialRequests: 'Test booking for email verification'
};

// Test the endpoint
const testVerifyPayment = async () => {
  console.log('=== Testing /verify-payment Endpoint ===\n');
  console.log('Test Data:', JSON.stringify(bookingData, null, 2));
  console.log('\nGenerated Signature:', razorpay_signature);
  
  try {
    const response = await axios.post('http://localhost:5000/verify-payment', bookingData);
    
    console.log('\n=== Response ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ Payment verification successful!');
      console.log('Booking ID:', response.data.bookingId);
      console.log('Emails sent:', response.data.emailsSent);
      
      if (response.data.emailsSent.client && response.data.emailsSent.admin) {
        console.log('🎉 Both client and admin emails should have been sent!');
        console.log('\n=== IMPORTANT ===');
        console.log('Since Gmail credentials are not working, the server should be using Ethereal.email');
        console.log('Check the server logs for Ethereal credentials to view sent emails.');
        console.log('Or check the terminal where server.js is running for login details.');
      } else {
        console.log('⚠️ Email sending may have failed. Check server logs.');
      }
    } else {
      console.log('❌ Payment verification failed:', response.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Server responded with error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error calling endpoint:', error.message);
    }
  }
};

testVerifyPayment();