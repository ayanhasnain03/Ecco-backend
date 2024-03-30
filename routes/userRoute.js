import express from "express";
import { getAllUsers, getMyProfile, loginUser, registerUser, updateProfile,changePassword } from "../controllers/userController.js";
import fileUpload from "../middlewares/multer.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();
router.route("/new").post(fileUpload,registerUser);
router.route("/login").post(loginUser);
router.route("/me").get(isAuthenticatedUser,getMyProfile);
router.route("/").get(getAllUsers);
router.route("/updateprofile").put(isAuthenticatedUser,updateProfile)
router.route("/changepassword").put(isAuthenticatedUser,changePassword)

export default router;
