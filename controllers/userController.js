import asyncHandler from "../middlewares/asyncHandler.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { myCache } from "../app.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
const registerUser = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { username, email, password, gender } = req.body;

  if (!username || !email || !password || !gender) {
    return next(new ErrorHandler("required all fields", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler("User Already Exist", 400));
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  const user = await User.create({
    username,
    email,
    password,
    gender,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  sendToken(res, user, "Registerd Succesfully", 201);
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please Add All Fields", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("User Doesn't Exist", 401));
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or  Password", 401));
  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

const getMyProfile = asyncHandler(async (req, res, next) => {
  let user;
  if (myCache.has("getMyProfile"))
    user = JSON.parse(myCache.get("getMyProfile"));
  else {
    user = await User.findById(req.user._id);
    myCache.set("getMyProfile", JSON.stringify(user));
  }
  return res.status(200).json({
    success: true,
    user,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.dob = req.body.dob || user.dob;
    user.gender = req.body.gender || user.gender;
  }
  await user.save();
  res.status(200).json({
    message: "Profile Updated Successfully",
  });
});

const updateProfilePicture = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Picture Change Successfully",
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please Add All Fields", 400));

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Old Password Inccorect", 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});


const forgetPassword = asyncHandler(async(req,res,next)=>{
const {email}=req.body;

const user = await User.findOne({email})
if(!user) return next(new ErrorHandler("please enter email",400))
const resetToken=await user.getResetToken();
await user.save();
const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
const message = `Click on the link to reset your password.${url}. if you have not requested then please ignore`;
await sendEmail(user.email, "CourseBundler REset Password", message);
res.status(200).json({
  success: true,
  message: `Reset Token has been sent to ${user.email}`,
});
})

 const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandler("Token is Invaild and has been expired"));

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Change Successfully",
  });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  let user;
  if (myCache.has("getAllUser")) user = JSON.parse(myCache.get("getAllUsers"));
  else {
    user = await User.find({});
    myCache.set("getAllUsers", JSON.stringify(user));
  }
  return res.status(200).json({
    success: true,
    user,
  });
});

export {
  registerUser,
  loginUser,
  getMyProfile,
  getAllUsers,
  updateProfile,
  changePassword,
  updateProfilePicture,
  forgetPassword,
  resetPassword
};
