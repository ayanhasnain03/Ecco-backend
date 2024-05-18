import mongoose from "mongoose";

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter the Coupon Code"],
    unique: true,
  },
  amount: {
    type: Number,
    required: [true, "Please enter the Discount Amount"],
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });  // Enable timestamps

const Coupon = mongoose.model("Coupon", schema);
export default Coupon;
