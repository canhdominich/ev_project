import axios from 'axios';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export const bookingClient = {
    async getAppointmentById(appointmentId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/booking/${appointmentId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching appointment:', error.message);
            throw new Error('Failed to fetch appointment');
        }
    },

    async getAppointmentsByUserId(userId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/booking/user/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching appointments:', error.message);
            throw new Error('Failed to fetch appointments');
        }
    }
};

export const vehicleClient = {
    async getVehicleById(vehicleId) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/vehicle/${vehicleId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching vehicle:', error.message);
            throw new Error('Failed to fetch vehicle');
        }
    }
};
