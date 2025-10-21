import express from 'express';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  addChecklistItem,
  getChecklistItems,
} from '../controllers/workOrderController.js';

const router = express.Router();

router.get('/', getAllWorkOrders);
router.get('/:id', getWorkOrderById);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);
router.delete('/:id', deleteWorkOrder);

// Checklist items
router.post('/:work_order_id/checklist', addChecklistItem);
router.get('/:work_order_id/checklist', getChecklistItems);

export default router;
