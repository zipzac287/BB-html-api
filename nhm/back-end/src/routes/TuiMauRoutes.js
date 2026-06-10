import express from "express";
import { createTuiMauServices, deleteTuiMauServices, getTuiMauServices, updateTuiMauServices } from "../controllers/TuiMaucontroller.js";

const router = express.Router();


router.get("/", getTuiMauServices);

router.post("/", createTuiMauServices);

router.put("/:matm", updateTuiMauServices);

router.delete("/:matm", deleteTuiMauServices);

export default router;