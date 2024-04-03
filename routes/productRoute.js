import express from "express"
import { addProductReview, createProduct,deleteProduct,deleteReview,getAdminProducts,getAllCategories,getAllProduct, getProductById, getProductReview, getTopProducts, updateProduct, updateProductImage } from "../controllers/productController.js";
import fileUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router()
router.route("/new").post(fileUpload,createProduct)
router.route("/admin/product").get(getAdminProducts)
router.route("/topproducts").get(getTopProducts)
router.route("/all").get(getAllProduct)
router.route("/:id").get(getProductById).put(isAuthenticatedUser,authorizeAdmin,updateProduct).delete(deleteProduct)
router.route("/updateimage/:id").put(isAuthenticatedUser,authorizeAdmin,fileUpload,updateProductImage)


router.route("/addreview/:id").post(isAuthenticatedUser,addProductReview)
router.route("/deletereview/:id").delete(isAuthenticatedUser,deleteReview)
router.route("/review/:id").get(isAuthenticatedUser,getProductReview)


router.route("/categories/all").get(isAuthenticatedUser,getAllCategories)




export default router;