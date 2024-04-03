import express from "express"
import { createProduct,getAllProduct, getProductById } from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";

const router = express.Router()
router.route("/new").post(fileUpload,createProduct)
router.route("/all").get(getAllProduct)
router.route("/:id").get(getProductById)

export default router;