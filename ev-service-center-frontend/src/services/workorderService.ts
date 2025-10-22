import { httpClient } from "@/lib/httpClient";

export interface WorkOrder {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    appointmentId: number;
    dueDate?: string;
    totalPrice: number;
    createdById: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChecklistItem {
    id: number;
    workOrderId: number;
    price: number;
    task: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Relations
    workOrder?: WorkOrder;
}

export interface CreateWorkOrderRequest {
    title: string;
    description: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    appointmentId: number;
    dueDate?: string;
    totalPrice: number;
    createdById: number;
}

export interface UpdateWorkOrderRequest {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    appointmentId?: number;
    dueDate?: string;
    totalPrice?: number;
}

export interface CreateChecklistItemRequest {
    workOrderId: number;
    price: number;
    task: string;
}

export interface UpdateChecklistItemRequest {
    price?: number;
    task?: string;
    completed?: boolean;
}

// API Functions
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
    const res = await httpClient.get('/api/workorder');
    return res.data;
};

export const getWorkOrderById = async (id: number): Promise<WorkOrder> => {
    const res = await httpClient.get(`/api/workorder/${id}`);
    return res.data;
};

export const createWorkOrder = async (data: CreateWorkOrderRequest): Promise<WorkOrder> => {
    const res = await httpClient.post('/api/workorder', data);
    return res.data;
};

export const updateWorkOrder = async (id: number, data: UpdateWorkOrderRequest): Promise<WorkOrder> => {
    const res = await httpClient.put(`/api/workorder/${id}`, data);
    return res.data;
};

export const deleteWorkOrder = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/workorder/${id}`);
};

export const addChecklistItem = async (workOrderId: number, data: Omit<CreateChecklistItemRequest, 'workOrderId'>): Promise<ChecklistItem> => {
    const res = await httpClient.post(`/api/workorder/${workOrderId}/checklist`, data);
    return res.data;
};

export const getChecklistItems = async (workOrderId: number): Promise<ChecklistItem[]> => {
    const res = await httpClient.get(`/api/workorder/${workOrderId}/checklist`);
    return res.data;
};
