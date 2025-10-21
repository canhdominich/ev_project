import { Router } from "express";
import { 
  getParts, 
  getPartById, 
  addPart, 
  updatePart, 
  deletePart, 
  updateStock, 
  getStockHistory 
} from "../controllers/partController.js";

const router = Router();

// Part operations
router.get("/", getParts);
router.get("/:id", getPartById);
router.post("/", addPart);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

// Stock operations
router.put("/:id/stock", updateStock);
router.get("/:id/stock-history", getStockHistory);

export default router;
