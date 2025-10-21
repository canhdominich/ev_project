import Part from "../models/part.js";
import StockLog from "../models/stockLog.js";

export const getParts = async (req, res) => {
  try {
    const parts = await Part.findAll();
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addPart = async (req, res) => {
  try {
    const { name, partNumber, quantity, minStock } = req.body;
    const part = await Part.create({ name, partNumber, quantity, minStock });
    await StockLog.create({ changeType: "IN", quantity, partId: part.id });
    res.status(201).json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { changeType, quantity } = req.body;

    const part = await Part.findByPk(id);
    if (!part) return res.status(404).json({ error: "Part not found" });

    if (changeType === "IN") part.quantity += quantity;
    if (changeType === "OUT") part.quantity -= quantity;

    await part.save();
    await StockLog.create({ changeType, quantity, partId: part.id });

    res.json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
