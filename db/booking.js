import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  // User contact information
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    default: 1
  },
  // Payment information
  paymentId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  // Additional fields
  specialRequests: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "pending"],
    default: "confirmed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Booking", BookingSchema);
