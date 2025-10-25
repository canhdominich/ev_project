import { Router } from "express";
import { getInvoices, createInvoice, recordPayment, createInvoiceWithPayment, getDashboardStats } from "../controllers/invoiceController.js";

const router = Router();

router.get("/", getInvoices);
router.get("/stats/dashboard", getDashboardStats);
router.post("/", createInvoice);
router.post("/payment", recordPayment);
router.post("/create-with-payment", createInvoiceWithPayment);

export default router;
