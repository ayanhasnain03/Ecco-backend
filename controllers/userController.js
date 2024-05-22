import asyncHandler from "../middlewares/asyncHandler.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { myCache } from "../app.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import Product from "../models/productModel.js";
const registerUser = asyncHandler(async (req, res, next) => {
  const file = req.file;
  const { username, email, password, gender,dob } = req.body;

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
    dob,
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

 const user = await User.findOne({email}).select("+password");

  if (!user) return next(new ErrorHandler("User Doesn't Exist", 401));
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    {
      return next(new ErrorHandler("Incorrect Email or  Password", 401))
    }
  sendToken(res, user,`Welcome back ${user.username}`,200);
});

const logoutUser = asyncHandler(async(req,res,next)=>{
  res.status(200)
  .cookie("token",null,{
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  })
  .json({
    success: true,
    message: "Logged Out",
  });
})
const getMyProfile = asyncHandler(async (req, res, next) => {
 

  const user = await User.findById(req.user._id);
 
  return res.status(200).json({
    _id:user._id,
    username:user.username,
    email:user.email,
    dob:user.dob,
    gender:user.gender,
    role:user.role,
    avatar:user.avatar,
    favourite:user.favourite,
    createdAt:user.createdAt,
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
  if(!user) return next (new ErrorHandler("user not found",404))
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
  if(!user) return next(new ErrorHandler("user not exist ",400))
  const resetToken=await user.getResetToken();
  await user.save();
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `Click on the link to reset your password.${url}. if you have not requested then please ignore`;
  await sendEmail(user.email, "Vertex Reset Password", message);
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

const updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 404));
  if (user.role === "user") {
    user.role = "admin";
  } else user.role = "user";
  await user.save();
  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

 const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User Delete Succesfully",
  });
});

const addToFavrourite = asyncHandler(async (req, res, next) => {

    // Find the user by ID
    const user = await User.findById(req.user._id);

    // Check if user exists
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Find the product by ID sent in the request body
    const product = await Product.findById(req.params.id);
    // Check if the product exists
    if (!product) {
      return next(new ErrorHandler("Invalid Product Id", 404));
    }

    // Check if the product already exists in the user's favourites
    const itemExist = user.favourite.some((item) => item.product.toString() === product._id.toString());

    // If the product already exists, return an error
    if (itemExist) {
      return next(new ErrorHandler("Item Already Exists", 409));
    }

    // If the product does not exist in the user's favourites, add it
    user.favourite.push({
      product: product._id,
      productImage: product.image.url,
      productName:product.name
    });
    

    // Save the user with the updated favourites list
    await user.save();

    // Return success response with the added product
    return res.status(200).json({
      success: true,
    message:"Add to favrioute"
    });
});

const removeFromFavrourite = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Invaild Product Id", 404));

  //Items Doesen't Matches
  const newFav = user.favourite.filter((item) => {
    if (item.product.toString() !== product._id.toString()) return item;
  });

  user.favourite = newFav;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Remove from favourite",
  });
});
const contactUs = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("All fields are mandetory", 400));
  const to = process.env.MY_MAIL;
  const subject = "Contact from Vertex";
  const text = `I Am ${name} and my Email is ${email}. \n ${message} `;
  await sendEmail(to, subject, text);
  res.status(200).json({
    success: true,
    message: "Your Mesage Has Been Sent",
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
  resetPassword,
  updateUserRole,
  deleteUser,
  logoutUser,
  addToFavrourite,
  removeFromFavrourite,
  contactUs
};
