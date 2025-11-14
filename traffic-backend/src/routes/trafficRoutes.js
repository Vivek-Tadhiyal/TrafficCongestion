import express from "express";
import { getTrafficFlow } from "../controllers/trafficController.js";

const router = express.Router();

router.get("/flow", getTrafficFlow);

export default router;
