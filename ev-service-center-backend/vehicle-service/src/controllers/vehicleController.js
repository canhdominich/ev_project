import Vehicle from '../models/vehicle.js';
import Reminder from '../models/remider.js';

// Lấy tất cả xe
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ include: Reminder });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy xe theo ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, { include: Reminder });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo xe mới
export const createVehicle = async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật xe
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa xe
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reminder functions
export const addReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({
      vehicleId: req.params.vehicle_id,
      ...req.body,
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { vehicleId: req.params.vehicle_id },
    });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
