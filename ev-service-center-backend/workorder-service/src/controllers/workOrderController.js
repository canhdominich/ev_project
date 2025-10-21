import WorkOrder from '../models/workOrder.js';
import ChecklistItem from '../models/checklistItem.js';

// Lấy tất cả work orders
export const getAllWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.findAll({ include: ChecklistItem });
    res.json(workOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy work order theo ID
export const getWorkOrderById = async (req, res) => {
  try {
    const order = await WorkOrder.findByPk(req.params.id, { include: ChecklistItem });
    if (!order) return res.status(404).json({ message: 'Work order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới work order
export const createWorkOrder = async (req, res) => {
  try {
    const newOrder = await WorkOrder.create(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật work order
export const updateWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Work order not found' });
    await order.update(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa work order
export const deleteWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Work order not found' });
    await order.destroy();
    res.json({ message: 'Work order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checklist item
export const addChecklistItem = async (req, res) => {
  try {
    const item = await ChecklistItem.create({
      workOrderId: req.params.work_order_id,
      ...req.body,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getChecklistItems = async (req, res) => {
  try {
    const items = await ChecklistItem.findAll({
      where: { workOrderId: req.params.work_order_id },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
