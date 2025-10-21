import { httpClient } from '@/lib/httpClient';
import { RowData } from '@/types/common';

export interface ServiceCenter extends RowData {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceCenterDto {
    name: string;
    address: string;
    phone: string;
    email?: string;
}

export interface UpdateServiceCenterDto {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export const getAllServiceCenters = async (): Promise<ServiceCenter[]> => {
    const response = await httpClient.get('/api/service-centers');
    return response.data;
};

export const getServiceCenterById = async (id: number): Promise<ServiceCenter> => {
    const response = await httpClient.get(`/api/service-centers/${id}`);
    return response.data;
};

export const createServiceCenter = async (data: CreateServiceCenterDto): Promise<ServiceCenter> => {
    const response = await httpClient.post('/api/service-centers', data);
    return response.data;
};

export const updateServiceCenter = async (id: number, data: UpdateServiceCenterDto): Promise<ServiceCenter> => {
    const response = await httpClient.put(`/api/service-centers/${id}`, data);
    return response.data;
};

export const deleteServiceCenter = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/service-centers/${id}`);
};