import express from "express"
import { getbarChartData, yearDataCharts } from "../controllers/dashboard.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router()
router.route("/stats").get(isAuthenticatedUser,authorizeAdmin,getbarChartData)
router.route("/stats/year").get(isAuthenticatedUser,authorizeAdmin,yearDataCharts)

export default router;