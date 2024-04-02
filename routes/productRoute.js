import express from "express"
import { createProduct } from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";

const router = express.Router()
router.route("/new").post(fileUpload,createProduct)

export default router;