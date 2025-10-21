import { httpClient } from '@/lib/httpClient';
import { RowData } from '@/types/common';

export interface Appointment extends RowData {
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
  serviceCenter?: ServiceCenter;
  vehicle?: Vehicle;
  user?: User;
}

export interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: number;
  userId: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentDto {
  userId: number;
  serviceCenterId: number;
  vehicleId?: number;
  date: string;
  timeSlot: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface UpdateAppointmentDto {
  serviceCenterId?: number;
  vehicleId?: number;
  date?: string;
  timeSlot?: string;
  notes?: string;
}

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const response = await httpClient.get('/api/booking');
  return response.data.data || response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const response = await httpClient.get(`/api/booking/${id}`);
  return response.data.data || response.data;
};

export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  const response = await httpClient.post('/api/booking', data);
  return response.data.data || response.data;
};

export const updateAppointment = async (id: number, data: UpdateAppointmentDto): Promise<Appointment> => {
  const response = await httpClient.put(`/api/booking/${id}`, data);
  return response.data.data || response.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await httpClient.delete(`/api/booking/${id}`);
};

// Service Center API calls
export const getAllServiceCenters = async (): Promise<ServiceCenter[]> => {
  const response = await httpClient.get('/api/service-center');
  return response.data.data || response.data;
};

export const getServiceCenterById = async (id: number): Promise<ServiceCenter> => {
  const response = await httpClient.get(`/api/service-center/${id}`);
  return response.data.data || response.data;
};
