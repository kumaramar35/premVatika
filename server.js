// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import crypto from "crypto";
// import axios from "axios";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// const PHONEPE_BASE_URL = "https://api.phonepe.com/apis/hermes/pg/v1";
// const MERCHANT_ID = process.env.MERCHANT_ID;
// const SALT_KEY = process.env.SALT_KEY;
// const SALT_INDEX = process.env.SALT_INDEX;

// app.post("/create-payment", async (req, res) => {
//     try {
//         const { amount } = req.body;
//         if (!amount || amount <= 0) {
//             return res.status(400).json({ error: "Invalid amount" });
//         }

//         const transactionId = "TXN_" + Date.now();
//         const payload = {
//             merchantId: MERCHANT_ID,
//             transactionId,
//             amount: amount * 100, // Convert to paisa
//             redirectUrl: "http://localhost:5173/success",
//             callbackUrl: "http://localhost:5000/payment-status"
//         };

//         const payloadString = JSON.stringify(payload);
//         const checksum = crypto.createHash("sha256").update(payloadString + SALT_KEY).digest("hex") + "###" + SALT_INDEX;

//         const response = await axios.post(`${PHONEPE_BASE_URL}/initiate`, payload, {
//             headers: { "X-VERIFY": checksum, "Content-Type": "application/json" }
//         });

//         res.json({ checkoutPageUrl: response.data.data.instrumentResponse.redirectInfo.url });
//     } catch (error) {
//         console.error("Payment Error:", error);
//         res.status(500).json({ error: "Payment initiation failed" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// import express, { json } from 'express';
// import Razorpay from 'razorpay';
// import cors from 'cors';
// import { createHmac } from 'crypto';

// const app = express();

// // Middleware
// app.use(cors());
// app.use(json());

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//     key_id: 'YOUR_RAZORPAY_KEY_ID',
//     key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
// });

// // Create order endpoint
// app.post('/create-order', async (req, res) => {
//     try {
//         const { amount, currency = 'INR', receipt } = req.body;

//         const options = {
//             amount: amount * 100, // amount in smallest currency unit (paise)
//             currency: currency,
//             receipt: receipt || `receipt_${Date.now()}`,
//         };

//         const order = await razorpay.orders.create(options);
        
//         res.json({
//             success: true,
//             order: order,
//             key_id: razorpay.key_id
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error creating order',
//             error: error.message
//         });
//     }
// });

// // Verify payment endpoint
// app.post('/verify-payment', (req, res) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         // Create signature
//         const sign = razorpay_order_id + '|' + razorpay_payment_id;
//         const expectedSign = createHmac('sha256', razorpay.key_secret)
//             .update(sign.toString())
//             .digest('hex');

//         if (razorpay_signature === expectedSign) {
//             // Payment is verified
//             // You can update your database here
//             res.json({
//                 success: true,
//                 message: 'Payment verified successfully',
//                 paymentId: razorpay_payment_id,
//                 orderId: razorpay_order_id
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid signature'
//             });
//         }
//     } catch (error) {
//         console.error('Error verifying payment:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error verifying payment',
//             error: error.message
//         });
//     }
// });

// // Get payment details (optional)
// app.get('/payment/:paymentId', async (req, res) => {
//     try {
//         const payment = await razorpay.payments.fetch(req.params.paymentId);
//         res.json({
//             success: true,
//             payment: payment
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching payment',
//             error: error.message
//         });
//     }
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// import express from 'express';
// import Razorpay from 'razorpay';
// import cors from 'cors';
// import { createHmac } from 'crypto';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// const app = express();

// // 1. Configure CORS to allow communication with your React frontend
// app.use(cors({
//     origin: "http://localhost:3000", // Standard React port
//     methods: ["GET", "POST"],
//     credentials: true
// }));

// app.use(express.json());

// // 2. Initialize Razorpay using environment variables
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID, // Add this to your .env
//     key_secret: process.env.RAZORPAY_KEY_SECRET // Add this to your .env
// });

// // Create order endpoint
// app.post('/create-order', async (req, res) => {
//     try {
//         const { amount, currency = 'INR', receipt } = req.body;

//         const options = {
//             amount: amount * 100, // Amount in paise
//             currency: currency,
//             receipt: receipt || `receipt_${Date.now()}`,
//         };

//         const order = await razorpay.orders.create(options);
        
//         res.json({
//             success: true,
//             order: order,
//             key_id: process.env.RAZORPAY_KEY_ID // Send key_id to frontend for the modal
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error creating order',
//             error: error.message
//         });
//     }
// });

// // Verify payment endpoint
// app.post('/verify-payment', (req, res) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         const sign = razorpay_order_id + '|' + razorpay_payment_id;
//         const expectedSign = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//             .update(sign.toString())
//             .digest('hex');

//         if (razorpay_signature === expectedSign) {
//             res.json({
//                 success: true,
//                 message: 'Payment verified successfully',
//                 paymentId: razorpay_payment_id,
//                 orderId: razorpay_order_id
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid signature'
//             });
//         }
//     } catch (error) {
//         console.error('Error verifying payment:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error verifying payment'
//         });
//     }
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error("SERVER ERROR:", err.message);
//     res.status(500).json({
//         success: false,
//         message: 'Internal Server Error',
//         error: err.message
//     });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import { db } from "./db.js";
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import booking from './db/booking.js';


dotenv.config();
const app = express();
// Safety Net for Runtime Errors
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));




app.use(cors({
   origin: [
  "https://premvatika.com",
  "https://www.premvatika.com"
],

    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(console.error);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, roomId, checkIn, checkOut } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
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
               await booking.create({ roomId, checkIn, checkOut });
            res.json({ success: true, message: 'Payment verified successfully' });
            
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
    const data = await booking.find({ roomId: req.params.roomId });
    res.json(data);
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

