import Appointment from '../models/appointment.js';
import ServiceCenter from '../models/serviceCenter.js';

// Lấy tất cả appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ include: ServiceCenter });
    res.status(200).json({
      data: appointments,
      total: appointments.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy appointment theo ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, { include: ServiceCenter });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({
      data: appointment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json({
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.update(req.body);
    res.status(200).json({
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.destroy();
    res.status(200).json({ 
      message: 'Appointment deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
