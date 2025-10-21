import { Router } from "express";
import { getInvoices, createInvoice, recordPayment } from "../controllers/invoiceController.js";

const router = Router();

router.get("/", getInvoices);
router.post("/", createInvoice);
router.post("/payment", recordPayment);

export default router;
