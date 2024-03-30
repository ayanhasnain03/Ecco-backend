import asyncHandler from "../middlewares/asyncHandler.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import getDataUri from "../utils/dataUri.js"
import cloudinary from "cloudinary";
import { myCache } from "../app.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { username, email, password, gender } = req.body;

  if (!username || !email || !password || !gender ) {
    return next(new ErrorHandler("required all fields", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ErrorHandler("User Already Exist", 400));
const fileUri = getDataUri(file)
const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
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
      user
  });
});

const updateProfile = asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.user._id);
  if(user){
    user.username=req.body.username || user.username;
    user.email=req.body.email || user.email;
    user.dob=req.body.dob || user.dob;
    user.gender=req.body.gender || user.gender;
  }
  await user.save();
  res.status(200).json({
   message:"Profile Updated Successfully"
  })
})






const getAllUsers = asyncHandler(async (req, res, next) => {
  let user;
  if (myCache.has("getAllUser"))
      user = JSON.parse(myCache.get("getAllUsers"));
  else {
   user = await User.find({});
      myCache.set("getAllUsers", JSON.stringify(user));
  }
  return res.status(200).json({
      success: true,
      user
  });
});



export { registerUser,loginUser,getMyProfile, getAllUsers,updateProfile};
