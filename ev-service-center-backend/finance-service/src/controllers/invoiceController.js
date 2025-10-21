import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";

//  Lấy tất cả hóa đơn
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ include: Payment });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Tạo hóa đơn mới
export const createInvoice = async (req, res) => {
  try {
    const { customerId, amount, dueDate } = req.body;
    const invoice = await Invoice.create({ customerId, amount, dueDate });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Ghi nhận thanh toán
export const recordPayment = async (req, res) => {
  try {
    const { invoiceId, method, amount } = req.body;

    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const payment = await Payment.create({ invoiceId, method, amount });
    invoice.status = "paid";
    await invoice.save();

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
