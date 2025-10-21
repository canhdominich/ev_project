import { httpClient } from '@/lib/httpClient';

export interface ServiceCenter {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface Appointment {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleModel: string;
    vehicleYear: number;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    serviceCenterId: number;
    createdAt: string;
    updatedAt: string;
    
    // Relations
    serviceCenter?: ServiceCenter;
}

export interface CreateAppointmentDto {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleModel: string;
    vehicleYear: number;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
    serviceCenterId: number;
}

export interface UpdateAppointmentDto {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    serviceType?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    serviceCenterId?: number;
}

export const getAllAppointments = async (): Promise<Appointment[]> => {
    const response = await httpClient.get('/api/bookings');
    return response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
    const response = await httpClient.get(`/api/bookings/${id}`);
    return response.data;
};

export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
    const response = await httpClient.post('/api/bookings', data);
    return response.data;
};

export const updateAppointment = async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
    const response = await httpClient.put(`/api/bookings/${id}`, data);
    return response.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/bookings/${id}`);
};
