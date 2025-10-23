import Appointment from '../models/appointment.js';
import ServiceCenter from '../models/serviceCenter.js';
import { userClient, vehicleClient } from '../client/index.js';

const getAppointmentDetails = async (appointment) => {
  const appointmentData = appointment.toJSON();

  try {
    const user = await userClient.getUserById(appointmentData.userId);

    let vehicle = null;
    if (appointmentData.vehicleId) {
      vehicle = await vehicleClient.getVehicleById(appointmentData.vehicleId);
    }

    return {
      ...appointmentData,
      user,
      vehicle
    };
  } catch (error) {
    console.error('Error fetching appointment details:', error.message);
    return {
      ...appointmentData,
      user: null,
      vehicle: null,
      error: 'Failed to fetch related data'
    };
  }
};

const getAppointmentsDetails = async (appointments) => {
  const appointmentsData = appointments.map(appointment => appointment.toJSON());

  try {
    const userIds = [...new Set(appointmentsData.map(apt => apt.userId))];
    const vehicleIds = [...new Set(appointmentsData.map(apt => apt.vehicleId).filter(id => id))];

    const [users, vehicles] = await Promise.all([
      userClient.getUsersByIds(userIds),
      vehicleIds.length > 0 ? vehicleClient.getVehiclesByIds(vehicleIds) : Promise.resolve([])
    ]);

    const userMap = new Map(users.map(user => [user.id, user]));
    const vehicleMap = new Map(vehicles.map(vehicle => [vehicle.id, vehicle]));

    return appointmentsData.map(appointment => ({
      ...appointment,
      user: userMap.get(appointment.userId) || null,
      vehicle: appointment.vehicleId ? (vehicleMap.get(appointment.vehicleId) || null) : null
    }));
  } catch (error) {
    console.error('Error fetching appointments details:', error.message);
    return appointmentsData.map(appointment => ({
      ...appointment,
      user: null,
      vehicle: null,
      error: 'Failed to fetch related data'
    }));
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Appointment.findAndCountAll({
      include: [{
        model: ServiceCenter,
        as: 'serviceCenter'
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    const appointmentsWithDetails = await getAppointmentsDetails(rows);

    res.status(200).json({
      data: appointmentsWithDetails,
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

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, { 
      include: {
        model: ServiceCenter,
        as: 'serviceCenter'
      }
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const appointmentWithDetails = await getAppointmentDetails(appointment);
    res.status(200).json({
      data: appointmentWithDetails
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAppointmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Appointment.findAndCountAll({
      where: { userId },
      include: {
        model: ServiceCenter,
        as: 'serviceCenter'
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const appointmentsWithDetails = await getAppointmentsDetails(rows);
    res.status(200).json({
      data: appointmentsWithDetails,
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

export const createAppointment = async (req, res) => {
  try {
    const vehicle = await vehicleClient.getVehicleById(req.body.vehicleId);
    const appointment = await Appointment.create({
      ...req.body,
      userId: vehicle.userId,
    });
    const appointmentWithDetails = await getAppointmentDetails(appointment);

    res.status(201).json({
      data: appointmentWithDetails,
      message: 'Appointment created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.update(req.body);
    const appointmentWithDetails = await getAppointmentDetails(appointment);

    res.status(200).json({
      data: appointmentWithDetails,
      message: 'Appointment updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
