import { Router } from "express";
import { getParts, addPart, updateStock } from "../controllers/partController.js";

const router = Router();

router.get("/", getParts);
router.post("/", addPart);
router.put("/:id/stock", updateStock);

export default router;
