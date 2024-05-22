import express from "express"
import { getbarChartData, getPieCharts, yearDataCharts } from "../controllers/dashboard.js";
import { authorizeAdmin, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router()
router.route("/stats").get(isAuthenticatedUser,authorizeAdmin,getbarChartData)
router.route("/stats/year").get(isAuthenticatedUser,authorizeAdmin,yearDataCharts)
router.route("/stats/pie").get(isAuthenticatedUser,authorizeAdmin,getPieCharts)

export default router;