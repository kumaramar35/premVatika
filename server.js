import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import nodemailer from 'nodemailer';
import booking from './db/booking.js';


dotenv.config();
const app = express();
// Safety Net for Runtime Errors
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));




app.use(cors({
   origin: [
    "http://localhost:5173",
    "http://localhost:3000",
  "https://premvatika.com",
  "https://www.premvatika.com"
],

    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// MongoDB connection with fallback and detailed diagnostics
const connectToMongoDB = async () => {
  const cloudUri = process.env.MONGO_URI;
  const localUri = 'mongodb://localhost:27017/premvatika';
  
  // Detect if we're in a cloud environment (Render, Heroku, etc.)
  const isCloudEnvironment = process.env.RENDER || process.env.NODE_ENV === 'production';
  
  console.log('\n' + '='.repeat(60));
  console.log('MongoDB Connection Diagnostics');
  console.log('='.repeat(60));
  console.log(`Environment: ${isCloudEnvironment ? 'Cloud/Production' : 'Development/Local'}`);
  
  if (!cloudUri) {
    console.error('❌ MONGO_URI is not defined in .env file');
    console.log('Please add your MongoDB Atlas connection string to .env');
    console.log('Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/');
  } else {
    console.log('Attempting to connect to MongoDB Atlas (cloud)...');
    console.log('Cloud URI (masked):', cloudUri.replace(/:[^:@]+@/, ':****@'));
    
    // Extract cluster name for diagnostics
    const clusterMatch = cloudUri.match(/@([^/?]+)/);
    const clusterName = clusterMatch ? clusterMatch[1] : 'unknown';
    console.log(`Cluster: ${clusterName}`);
  }
  
  try {
    // First try cloud connection
    console.log('\n1. Testing cloud connection...');
    await mongoose.connect(cloudUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ MongoDB Atlas (cloud) Connected successfully");
    console.log("Database:", mongoose.connection.db.databaseName);
    console.log("Connection state:", mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    return true;
  } catch (cloudError) {
    console.error("\n❌ MongoDB Atlas connection failed:", cloudError.message);
    
    // Provide specific diagnostics based on error type
    if (cloudError.message.includes('ENOTFOUND') || cloudError.message.includes('ECONNREFUSED')) {
      console.log('\n🔍 DIAGNOSIS: DNS resolution failed - cluster domain may not exist');
      console.log('Possible causes:');
      console.log('  1. Cluster is paused or deleted in MongoDB Atlas');
      console.log('  2. Cluster name is incorrect');
      console.log('  3. Network/DNS issues');
    } else if (cloudError.message.includes('authentication failed')) {
      console.log('\n🔍 DIAGNOSIS: Authentication failed');
      console.log('Possible causes:');
      console.log('  1. Incorrect username or password');
      console.log('  2. Database user does not exist');
      console.log('  3. IP address not whitelisted');
    } else if (cloudError.name === 'MongoServerSelectionError') {
      console.log('\n🔍 DIAGNOSIS: Server selection error');
      console.log('Possible causes:');
      console.log('  1. IP address not whitelisted in Network Access');
      console.log('  2. Cluster is paused');
      console.log('  3. Firewall blocking connection');
    }
    
    console.log('\n🛠️  RECOMMENDED ACTIONS:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Check if your cluster exists and is RUNNING (not paused)');
    console.log('3. In Network Access, add your IP address (or 0.0.0.0/0 for all)');
    console.log('4. Verify database user credentials');
    console.log('5. Get correct connection string:');
    console.log('   - Click "Connect" on your cluster');
    console.log('   - Choose "Drivers"');
    console.log('   - Copy Node.js connection string');
    console.log('   - Update MONGO_URI in .env file');
    
    // Skip local fallback in cloud environments (Render, production)
    if (isCloudEnvironment) {
      console.log('\n' + '-'.repeat(40));
      console.log('⚠️  Skipping local MongoDB fallback (cloud environment detected)');
      console.log('   Local MongoDB is not available on Render/Heroku/etc.');
      console.log('\n⚠️  Server will start in degraded mode (no database)');
      console.log('   API endpoints will return errors for database operations');
      return false;
    }
    
    // Try local MongoDB as fallback (development only)
    console.log('\n' + '-'.repeat(40));
    console.log('Attempting fallback to local MongoDB (development only)...');
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 30000,
      });
      console.log("✅ Local MongoDB Connected successfully (fallback)");
      console.log("Database:", mongoose.connection.db.databaseName);
      console.log("\n⚠️  IMPORTANT: Using local MongoDB as fallback.");
      console.log("This is OK for development but not for production.");
      console.log("\nTo fix cloud MongoDB connection:");
      console.log("1. Follow the recommended actions above");
      console.log("2. Restart server after updating .env file");
      return true;
    } catch (localError) {
      console.error("❌ Local MongoDB connection also failed:", localError.message);
      console.error("\n💡 Both cloud and local MongoDB connections failed.");
      console.error("\nQUICK SETUP OPTIONS:");
      console.error("Option A: Install local MongoDB");
      console.error("  1. Download MongoDB from https://www.mongodb.com/try/download/community");
      console.error("  2. Install and run 'mongod' service");
      console.error("  3. Restart this server");
      console.error("\nOption B: Fix cloud MongoDB");
      console.error("  1. Create free cluster at https://cloud.mongodb.com");
      console.error("  2. Add IP whitelist (0.0.0.0/0 for all)");
      console.error("  3. Create database user");
      console.error("  4. Get connection string and update .env");
      console.error("\nOption C: Use MongoDB Atlas with correct credentials");
      console.error("  1. Check if cluster 'premvatika.5dx3qcd.mongodb.net' exists");
      console.error("  2. If not, create new cluster and update .env");
      
      // Continue running in degraded mode (API will work but database operations will fail)
      console.log("\n⚠️  Server will start in degraded mode (no database)");
      console.log("   API endpoints will return errors for database operations");
      return false;
    }
  }
};

// Connect to MongoDB
connectToMongoDB();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Email transporter configuration with fallback to dummy for testing
const createTransporter = async () => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASSWORD;
  
  // First try Brevo (production)
  if (brevoApiKey) {
    try {
      const Brevo = (await import('@getbrevo/brevo')).default;
      const brevoClient = new Brevo({ apiKey: brevoApiKey });
      console.log('✅ Using Brevo for emails');

      return {
        sendMail: async (mailOptions) => {
          const senderEmail = mailOptions.from?.match(/<([^>]+)>/)?.[1] || process.env.EMAIL_USER || 'noreply@premvatika.com';
          const payload = {
            sender: {
              name: 'Hotel Prem Vatika',
              email: senderEmail,
            },
            to: [{ email: mailOptions.to, name: '' }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html,
          };

          const response = await brevoClient.transactionalEmails.sendTransacEmail(payload);
          const messageId = response?.data?.messageId || response?.rawResponse?.headers?.get?.('X-Message-Id') || response?.rawResponse?.headers?.get?.('x-message-id') || 'brevo-' + Date.now();
          return { messageId };
        },
        verify: async () => true
      };
    } catch (brevoError) {
      console.warn('⚠️ Brevo failed:', brevoError.message);
    }
  }
  
  // Fallback to Gmail (development/local)
  if (gmailUser && gmailPass) {
    try {
      const gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      
      // Test the connection
      await gmailTransporter.verify();
      console.log('✅ Using Gmail SMTP for emails');
      return gmailTransporter;
    } catch (gmailError) {
      console.warn('⚠️ Gmail SMTP failed:', gmailError.message);
    }
  }
  
  // Final fallback to dummy transport (logs only)
  console.log('📧 Using dummy transport for email testing (logs only, no actual sends)');
  return {
    sendMail: async (mailOptions) => {
      console.log('📨 [LOG] Email would be sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        timestamp: new Date().toISOString()
      });
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      return { messageId: 'dummy-' + Date.now() };
    },
    verify: async () => true
  };
};

// Email sending function
const sendBookingEmail = async (bookingData, toEmail, isAdmin = false) => {
  try {
    const transporter = await createTransporter();
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const subject = isAdmin 
      ? `New Booking Received - ${bookingData.name}`
      : `Booking Confirmation - Hotel Prem Vatika`;

    const htmlContent = isAdmin 
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #cfa670; text-align: center;">New Booking Alert! 🎉</h2>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li><strong>Guest Name:</strong> ${bookingData.name}</li>
            <li><strong>Email:</strong> ${bookingData.email}</li>
            <li><strong>Phone:</strong> ${bookingData.phone}</li>
            <li><strong>Room ID:</strong> ${bookingData.roomId}</li>
            <li><strong>Check-in:</strong> ${formatDate(bookingData.checkIn)}</li>
            <li><strong>Check-out:</strong> ${formatDate(bookingData.checkOut)}</li>
            <li><strong>Guests:</strong> ${bookingData.guests}</li>
            <li><strong>Amount Paid:</strong> ₹${bookingData.amount}</li>
            <li><strong>Payment ID:</strong> ${bookingData.paymentId}</li>
            <li><strong>Booking Date:</strong> ${new Date(bookingData.createdAt).toLocaleString()}</li>
          </ul>
          <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            <strong>Note:</strong> This booking requires your attention. Please prepare the room accordingly.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #cfa670; text-align: center;">Booking Confirmed! 🎉</h2>
          <p>Dear ${bookingData.name},</p>
          <p>Thank you for choosing <strong>Hotel Prem Vatika</strong>. Your booking has been successfully confirmed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Summary</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.paymentId.substring(0, 8)}</li>
              <li><strong>Check-in Date:</strong> ${formatDate(bookingData.checkIn)}</li>
              <li><strong>Check-out Date:</strong> ${formatDate(bookingData.checkOut)}</li>
              <li><strong>Number of Guests:</strong> ${bookingData.guests}</li>
              <li><strong>Total Amount Paid:</strong> ₹${bookingData.amount}</li>
              <li><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">Confirmed</span></li>
            </ul>
          </div>
          
          <p><strong>Important Information:</strong></p>
          <ul> 
            <li>Check-in time: 12:00 PM</li>
            <li>Check-out time: 11:00 AM</li>
            <li>Please carry a valid ID proof at the time of check-in</li>
            <li>For any queries, contact us at: +91-9111411138  or prempatidar166@gmail.com</li>
          </ul>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://premvatika.com" style="background-color: #cfa670; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Visit Our Website
            </a>
          </p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            We look forward to welcoming you at Hotel Prem Vatika!
          </p>
        </div>
      `;

    const fromEmail = process.env.EMAIL_USER || '"Hotel Prem Vatika" <noreply@premvatika.com>';
    const mailOptions = {
      from: typeof fromEmail === 'string' && fromEmail.includes('@')
        ? `"Hotel Prem Vatika" <${fromEmail}>`
        : fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent
    };

    // Use timeout to prevent hanging email sends
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 5000)
    );
    
    const info = await Promise.race([emailPromise, timeoutPromise]);
    console.log(`✅ Email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`⚠️ Email error for ${toEmail}:`, error.message);
    // Return false but don't throw - let payment go through
    return false;
  }
};

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is awake" });
});

app.post('/create-order', async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        
        // Basic validation to prevent logic errors
        if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

        const options = {
            amount: Math.round(amount * 100), // Ensure it's an integer
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            order: order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        next(error); // Passes the error to the global error handler
    }
});

app.post('/verify-payment',async (req, res, next) => {
    try {
        const { 
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature, 
          roomId, 
          checkIn, 
          checkOut,
          name,
          email,
          phone,
          guests,
          amount,
          specialRequests
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        // Validate required user data
        if (!name || !email || !phone) {
          return res.status(400).json({ success: false, message: 'Missing user information' });
        }

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

             if (razorpay_signature !== expectedSign) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }


        if (razorpay_signature === expectedSign) {
          // Create booking with all data
          const bookingData = {
            roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            name,
            email,
            phone,
            guests: guests || 1,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: amount || 0,
            specialRequests: specialRequests || "",
            status: "confirmed"
          };

          const newBooking = await booking.create(bookingData);
          console.log("✅ Booking created successfully:", newBooking._id);
          
          // Send emails asynchronously - don't wait or fail if emails timeout
          // Just log the results
          sendBookingEmail(bookingData, email, false).catch(err => {
            console.error('⚠️ Failed to send client email (non-blocking):', err.message);
          });
          
          sendBookingEmail(bookingData, process.env.ADMIN_EMAIL || "admin@premvatika.com", true).catch(err => {
            console.error('⚠️ Failed to send admin email (non-blocking):', err.message);
          });
          
          // Return success immediately - don't wait for emails
          res.json({ 
            success: true, 
            message: 'Payment verified successfully',
            bookingId: newBooking._id,
            note: 'Confirmation emails may take a few moments to arrive'
          });
            
        } else {
           return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        next(error);
    }
});


/* Get booked dates */
app.get("/booked/:roomId", async (req,res,next)=>{
  try {
    console.log(`[DEBUG] /booked/${req.params.roomId} - Querying bookings for roomId`);
    const data = await booking.find({ roomId: req.params.roomId });
    console.log(`[DEBUG] Found ${data.length} bookings for room ${req.params.roomId}`);
    res.json(data);
  } catch (err) {
    console.error(`[ERROR] /booked/${req.params.roomId} -`, err.message);
    next(err);
  }
});

// Get all bookings (for admin)
app.get("/bookings", async (req, res, next) => {
  try {
    const bookings = await booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.message);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
