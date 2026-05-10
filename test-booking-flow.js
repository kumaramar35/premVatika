import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test the booking flow with email sending
const testBookingFlow = async () => {
  console.log('=== Testing Booking Flow with Email Notifications ===\n');
  
  await connectDB();
  
  // Import the booking model
  const Booking = (await import('./db/booking.js')).default;
  
  // Create a test booking
  const testBooking = {
    roomId: 'test-room-123',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '+919876543210',
    guests: 2,
    paymentId: 'pay_test123456',
    orderId: 'order_test123456',
    amount: 5000,
    specialRequests: 'Test booking for email verification',
    status: 'confirmed',
    createdAt: new Date()
  };
  
  console.log('Creating test booking in database...');
  
  try {
    // Save to database
    const savedBooking = await Booking.create(testBooking);
    console.log('✅ Test booking saved to database:', savedBooking._id);
    
    // Now test email sending by calling the server's email function
    console.log('\n=== Testing Email Sending ===');
    
    // We need to import the server's email function
    // For simplicity, we'll make an HTTP request to the /verify-payment endpoint
    console.log('To test email sending, you need to:');
    console.log('1. Start the server: node server.js');
    console.log('2. Make a real booking through the frontend');
    console.log('3. Or use curl to simulate payment verification');
    
    console.log('\n=== Sample curl command to test ===');
    console.log(`curl -X POST http://localhost:5000/verify-payment \\
  -H "Content-Type: application/json" \\
  -d '{
    "razorpay_order_id": "order_test123456",
    "razorpay_payment_id": "pay_test123456",
    "razorpay_signature": "test_signature_123",
    "bookingData": ${JSON.stringify(testBooking)}
  }'`);
    
    console.log('\n=== Alternative: Direct Email Test ===');
    console.log('You can also run the test-email-ethereal.js to verify emails work:');
    console.log('node test-email-ethereal.js');
    
    // Clean up test booking
    await Booking.deleteOne({ _id: savedBooking._id });
    console.log('\n✅ Test booking cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  mongoose.connection.close();
  console.log('\n=== Test Complete ===');
  console.log('To see actual emails:');
  console.log('1. Start the server with: node server.js');
  console.log('2. Open the frontend and book a room');
  console.log('3. Check Ethereal.email for sent emails');
  console.log('   (The server will show Ethereal credentials when it starts)');
};

testBookingFlow().catch(console.error);