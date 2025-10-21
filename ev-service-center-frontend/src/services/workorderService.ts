import { httpClient } from "@/lib/httpClient";

export interface WorkOrder {
    id: number;
    vehicleId: number;
    customerId: number;
    serviceType: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours: number;
    actualHours?: number;
    startDate?: string;
    endDate?: string;
    totalCost?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChecklistItem {
    id: number;
    workOrderId: number;
    task: string;
    isCompleted: boolean;
    completedBy?: number;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    
    // Relations
    workOrder?: WorkOrder;
}

export interface CreateWorkOrderRequest {
    vehicleId: number;
    customerId: number;
    serviceType: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours: number;
    notes?: string;
}

export interface UpdateWorkOrderRequest {
    vehicleId?: number;
    customerId?: number;
    serviceType?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    actualHours?: number;
    startDate?: string;
    endDate?: string;
    totalCost?: number;
    notes?: string;
}

export interface CreateChecklistItemRequest {
    workOrderId: number;
    task: string;
}

export interface UpdateChecklistItemRequest {
    task?: string;
    isCompleted?: boolean;
    completedBy?: number;
}

// API Functions
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
    const res = await httpClient.get('/api/workorders');
    return res.data;
};

export const getWorkOrderById = async (id: number): Promise<WorkOrder> => {
    const res = await httpClient.get(`/api/workorders/${id}`);
    return res.data;
};

export const createWorkOrder = async (data: CreateWorkOrderRequest): Promise<WorkOrder> => {
    const res = await httpClient.post('/api/workorders', data);
    return res.data;
};

export const updateWorkOrder = async (id: number, data: UpdateWorkOrderRequest): Promise<WorkOrder> => {
    const res = await httpClient.put(`/api/workorders/${id}`, data);
    return res.data;
};

export const deleteWorkOrder = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/workorders/${id}`);
};

export const addChecklistItem = async (data: CreateChecklistItemRequest): Promise<ChecklistItem> => {
    const res = await httpClient.post('/api/workorders/checklist', data);
    return res.data;
};

export const getChecklistItems = async (workOrderId?: number): Promise<ChecklistItem[]> => {
    const url = workOrderId ? `/api/workorders/checklist?workOrderId=${workOrderId}` : '/api/workorders/checklist';
    const res = await httpClient.get(url);
    return res.data;
};

export const updateChecklistItem = async (id: number, data: UpdateChecklistItemRequest): Promise<ChecklistItem> => {
    const res = await httpClient.put(`/api/workorders/checklist/${id}`, data);
    return res.data;
};

export const deleteChecklistItem = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/workorders/checklist/${id}`);
};
