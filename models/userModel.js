import mongoose from "mongoose";
import validator from "validator"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto"
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "please enter name"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "please enter email"],
      validate: validator.default.isEmail,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be atleast 6 characters"],
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter Date of birth"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    favourite: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productImage: String,
      productName:String,
    },
  ],
    resetPasswordToken: String,
    resetPasswordExpire: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    this.resetPasswordExpire=Date.now()+ 15 * 60 * 1000;
  return resetToken;
};
export const User = mongoose.model("User", userSchema);