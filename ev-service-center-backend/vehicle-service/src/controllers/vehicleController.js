import Vehicle from '../models/vehicle.js';
import Reminder from '../models/remider.js';

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ include: Reminder });
    res.status(200).json({
      data: vehicles,
      total: vehicles.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, { include: Reminder });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json({
      data: vehicle
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehiclesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const vehicles = await Vehicle.findAll({
      where: { userId: parseInt(userId) },
      include: Reminder
    });
    res.status(200).json({
      data: vehicles,
      total: vehicles.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json({
      data: newVehicle,
      message: 'Vehicle created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.status(200).json({
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.destroy();
    res.status(200).json({ 
      message: 'Vehicle deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({
      vehicleId: req.params.vehicle_id,
      ...req.body,
    });
    res.status(201).json({
      data: reminder,
      message: 'Reminder created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { vehicleId: req.params.vehicle_id },
    });
    res.status(200).json({
      data: reminders,
      total: reminders.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
