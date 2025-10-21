import { httpClient } from "@/lib/httpClient";

export interface ServiceCenter {
    id: number;
    name: string;
    address: string;
    phone: string;
    email?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Appointment {
    id: number;
    userId: number;
    serviceCenterId: number;
    vehicleId?: number;
    date: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    
    // Relations
    serviceCenter?: ServiceCenter;
}

export interface CreateAppointmentRequest {
    userId: number;
    serviceCenterId: number;
    vehicleId?: number;
    date: string;
    timeSlot: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
}

export interface UpdateAppointmentRequest {
    userId?: number;
    serviceCenterId?: number;
    vehicleId?: number;
    date?: string;
    timeSlot?: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
}

export interface CreateServiceCenterRequest {
    name: string;
    address: string;
    phone: string;
    email?: string;
}

export interface UpdateServiceCenterRequest {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
}

// Service Center API Functions
export const getAllServiceCenters = async (): Promise<ServiceCenter[]> => {
    const res = await httpClient.get('/api/service-centers');
    return res.data;
};

export const getServiceCenterById = async (id: number): Promise<ServiceCenter> => {
    const res = await httpClient.get(`/api/service-centers/${id}`);
    return res.data;
};

export const createServiceCenter = async (data: CreateServiceCenterRequest): Promise<ServiceCenter> => {
    const res = await httpClient.post('/api/service-centers', data);
    return res.data;
};

export const updateServiceCenter = async (id: number, data: UpdateServiceCenterRequest): Promise<ServiceCenter> => {
    const res = await httpClient.put(`/api/service-centers/${id}`, data);
    return res.data;
};

export const deleteServiceCenter = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/service-centers/${id}`);
};

// Appointment API Functions
export const getAllAppointments = async (): Promise<Appointment[]> => {
    const res = await httpClient.get('/api/appointments');
    return res.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
    const res = await httpClient.get(`/api/appointments/${id}`);
    return res.data;
};

export const createAppointment = async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const res = await httpClient.post('/api/appointments', data);
    return res.data;
};

export const updateAppointment = async (id: number, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const res = await httpClient.put(`/api/appointments/${id}`, data);
    return res.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/appointments/${id}`);
};

// Aliases for backward compatibility
export const getAppointments = getAllAppointments;
