import Invoice from "../models/invoice.js";
import Payment from "../models/payment.js";
import { bookingClient, workorderClient, inventoryClient } from "../client/index.js";
import sequelize from "../config/db.js";
import { Op } from 'sequelize';

//  Lấy tất cả hóa đơn
export const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Invoice.findAndCountAll({
      include: Payment,
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

// Lấy thống kê dashboard tổng hợp
export const getDashboardStats = async (req, res) => {
  try {
    console.log('Start getDashboardStats');
    
    const currentYear = new Date().getFullYear();
    
    // Lấy thống kê từ booking service
    let bookingStats = {
      totalBookings: 0,
      totalUsers: 0,
      monthlyBookings: new Array(12).fill(0)
    };

    try {
      const bookingResponse = await bookingClient.getDashboardStats();
      if (bookingResponse && bookingResponse.data) {
        bookingStats = {
          totalBookings: bookingResponse.data.totalBookings || 0,
          totalUsers: bookingResponse.data.totalUsers || 0,
          monthlyBookings: bookingResponse.data.monthlyBookings || new Array(12).fill(0)
        };
      }
    } catch (bookingError) {
      console.log('Booking service not available:', bookingError.message);
    }

    // Lấy thống kê revenue từ workorder service
    let revenueStats = {
      totalRevenue: 0,
      monthlyRevenue: new Array(12).fill(0)
    };

    try {
      const workOrderStats = await workorderClient.getRevenueStats(currentYear);
      
      if (workOrderStats && workOrderStats.data) {
        const revenueData = workOrderStats.data;
        
        revenueStats = {
          totalRevenue: revenueData.totalRevenue || 0,
          monthlyRevenue: revenueData.monthlyRevenue || new Array(12).fill(0)
        };
      }
    } catch (workOrderError) {
      console.log('WorkOrder service not available:', workOrderError.message);
    }

    // Lấy thống kê parts từ inventory service
    let partsStats = {
      totalParts: 0,
      totalQuantity: 0,
      monthlyParts: new Array(12).fill(0),
      monthlyQuantities: new Array(12).fill(0)
    };

    try {
      const inventoryResponse = await inventoryClient.getPartsStats(currentYear);
      
      if (inventoryResponse && inventoryResponse.data) {
        const partsData = inventoryResponse.data;
        
        partsStats = {
          totalParts: partsData.totalParts || 0,
          totalQuantity: partsData.totalQuantity || 0,
          monthlyParts: partsData.monthlyParts || new Array(12).fill(0),
          monthlyQuantities: partsData.monthlyQuantities || new Array(12).fill(0)
        };
      }
    } catch (inventoryError) {
      console.log('Inventory service not available:', inventoryError.message);
    }

    // Tổng hợp dữ liệu dashboard
    const dashboardStats = {
      totalBookings: bookingStats.totalBookings,
      totalRevenue: revenueStats.totalRevenue,
      totalUsers: bookingStats.totalUsers,
      totalParts: partsStats.totalParts,
      totalQuantity: partsStats.totalQuantity,
      monthlyBookings: bookingStats.monthlyBookings,
      monthlyRevenue: revenueStats.monthlyRevenue,
      monthlyParts: partsStats.monthlyParts,
      monthlyQuantities: partsStats.monthlyQuantities
    };

    console.log('Dashboard stats result:', dashboardStats);

    res.status(200).json({
      data: dashboardStats,
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
};
