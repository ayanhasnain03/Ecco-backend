import express from "express";
import {
  getAllUsers,
  getMyProfile,
  loginUser,
  registerUser,
  updateProfile,
  changePassword,
  updateProfilePicture,
  forgetPassword,
  resetPassword,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import fileUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();
router.route("/new").post(fileUpload, registerUser);
router.route("/login").post(loginUser);
router.route("/me").get(isAuthenticatedUser, getMyProfile);
router.route("/updateprofile").put(isAuthenticatedUser, updateProfile);
router
  .route("/updateprofileimage")
  .put(isAuthenticatedUser, fileUpload, updateProfilePicture);
router.route("/changepassword").put(isAuthenticatedUser, changePassword);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);

router.route("/all").get(isAuthenticatedUser,authorizeAdmin,getAllUsers);
router.route("/delete/:id").delete(isAuthenticatedUser,authorizeAdmin,deleteUser);
router.route("/changerole/:id").put(isAuthenticatedUser,authorizeAdmin,updateUserRole);

export default router;
