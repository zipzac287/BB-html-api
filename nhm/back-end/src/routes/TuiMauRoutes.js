import express from "express";
import { createTuiMauServices, deleteTuiMauServices, getTuiMauServices, splitTM, updatedTuiMau, updateTuiMauServices } from "../controllers/TuiMaucontroller.js";

const router = express.Router();


router.put("/", updatedTuiMau);

router.get("/", getTuiMauServices);

router.post("/", createTuiMauServices);

router.put("/:matm", updateTuiMauServices);

router.delete("/:matm", deleteTuiMauServices);

router.post("/chiet-tach", splitTM);

export default router;