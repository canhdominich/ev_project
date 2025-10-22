import WorkOrder from '../models/workOrder.js';
import ChecklistItem from '../models/checklistItem.js';

// Lấy tất cả work orders
export const getAllWorkOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await WorkOrder.findAndCountAll({
      include: ChecklistItem,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    });
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
    const newOrder = await WorkOrder.create({
      ...req.body,
      totalPrice: 0
    });
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
    
    // Nếu checklist item được tạo với completed = true, tính lại totalPrice
    if (item.completed === true) {
      const workOrder = await WorkOrder.findByPk(req.params.work_order_id);
      if (workOrder) {
        const completedItems = await ChecklistItem.findAll({
          where: { 
            workOrderId: req.params.work_order_id,
            completed: true 
          },
        });
        
        const totalPrice = completedItems.reduce((sum, item) => sum + item.price, 0);
        await workOrder.update({ totalPrice });
      }
    }
    
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

// Lấy work order theo appointment ID
export const getWorkOrderByAppointmentId = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findOne({
      where: { appointmentId: req.params.work_order_id },
      include: ChecklistItem,
    });
    if (!workOrder) return res.status(404).json({ message: 'Work order not found for this appointment' });
    res.json(workOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy checklist item theo ID
export const getChecklistItemById = async (req, res) => {
  try {
    const item = await ChecklistItem.findOne({
      where: { 
        id: req.params.checklist_id,
        workOrderId: req.params.work_order_id 
      },
    });
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật checklist item
export const updateChecklistItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findOne({
      where: { 
        id: req.params.checklist_id,
        workOrderId: req.params.work_order_id 
      },
    });
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    
    await item.update(req.body);
    
    // Nếu checklist item được đánh dấu completed, tính lại totalPrice
    if (req.body.completed === true || req.body.completed === 1) {
      const workOrder = await WorkOrder.findByPk(req.params.work_order_id);
      if (workOrder) {
        // Tính tổng giá của tất cả checklist items đã completed
        const completedItems = await ChecklistItem.findAll({
          where: { 
            workOrderId: req.params.work_order_id,
            completed: true 
          },
        });
        
        const totalPrice = completedItems.reduce((sum, item) => sum + item.price, 0);
        await workOrder.update({ totalPrice });
      }
    }
    
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa checklist item
export const deleteChecklistItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findOne({
      where: { 
        id: req.params.checklist_id,
        workOrderId: req.params.work_order_id 
      },
    });
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    
    await item.destroy();
    
    // Tính lại totalPrice sau khi xóa checklist item
    const workOrder = await WorkOrder.findByPk(req.params.work_order_id);
    if (workOrder) {
      const completedItems = await ChecklistItem.findAll({
        where: { 
          workOrderId: req.params.work_order_id,
          completed: true 
        },
      });
      
      const totalPrice = completedItems.reduce((sum, item) => sum + item.price, 0);
      await workOrder.update({ totalPrice });
    }
    
    res.json({ message: 'Checklist item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
