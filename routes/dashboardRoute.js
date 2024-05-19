import express from "express"
import { getbarChartData } from "../controllers/dashboard.js";

const router = express.Router()
router.route("/stats").get(getbarChartData)

export default router;