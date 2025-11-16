import express from "express";
import { getTrafficFlow } from "../controllers/trafficController.js";
import { getTrafficIncidents } from "../controllers/incidentController.js";

const router = express.Router();

// Traffic flow
router.get("/flow", getTrafficFlow);

// Traffic incidents (NEW)
router.get("/incidents", getTrafficIncidents);

export default router;
