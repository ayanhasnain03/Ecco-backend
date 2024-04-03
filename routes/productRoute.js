import express from "express"
import { createProduct,getAllProduct, getProductById, updateProduct } from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router()
router.route("/new").post(fileUpload,createProduct)
router.route("/all").get(getAllProduct)
router.route("/:id").get(getProductById).put(isAuthenticatedUser,authorizeAdmin,updateProduct)

export default router;