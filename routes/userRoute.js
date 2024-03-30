import express from "express";
import { registerUser } from "../controllers/userController.js";
import fileUpload from "../middlewares/multer.js";

const router = express.Router();
router.route("/new").post(fileUpload,registerUser);

export default router;
