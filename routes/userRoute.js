import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import fileUpload from "../middlewares/multer.js";

const router = express.Router();
router.route("/new").post(fileUpload,registerUser);
router.route("/login").post(loginUser);

export default router;
