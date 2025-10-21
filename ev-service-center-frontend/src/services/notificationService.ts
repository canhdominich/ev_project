import { httpClient } from "@/lib/httpClient";

export interface Notification {
    id: number;
    title: string;
    body: string;
    link?: string;
    seen: boolean;
    userId: number;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface NotificationResponse {
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface NotificationFilters {
    page?: number;
    limit?: number;
    seen?: boolean;
    userId?: number;
}

export const getAllNotifications = async (): Promise<Notification[]> => {
    const res = await httpClient.get('/api/notifications');
    return res.data;
};

export const getNotifications = async (filters?: NotificationFilters): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.seen !== undefined) params.append('seen', filters.seen.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/notifications?${queryString}` : '/api/notifications';
    
    const res = await httpClient.get(url);
    return res.data;
};

export const getNotificationById = async (id: number): Promise<Notification> => {
    const res = await httpClient.get(`/notifications/${id}`);
    return res.data;
};

export const getNotificationsByUser = async (userId: number): Promise<Notification[]> => {
    const res = await httpClient.get(`/api/notifications/user/${userId}`);
    return res.data;
};

export const getUnreadNotifications = async (filters?: NotificationFilters): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/notifications/unread?${queryString}` : '/notifications/unread';
    
    const res = await httpClient.get(url);
    return res.data;
};

export const createNotification = async (data: {
    title: string;
    body: string;
    link?: string;
    userId: number;
}): Promise<Notification> => {
    const res = await httpClient.post('/api/notifications', data);
    return res.data;
};

export const updateNotification = async (id: number, data: {
    title?: string;
    body?: string;
    link?: string;
    seen?: boolean;
}): Promise<Notification> => {
    const res = await httpClient.patch(`/notifications/${id}`, data);
    return res.data;
};

export const markAsRead = async (id: number): Promise<Notification> => {
    const res = await httpClient.put(`/api/notifications/${id}/read`);
    return res.data;
};

export const markAllAsRead = async (): Promise<void> => {
    await httpClient.patch('/notifications/read-all');
};

export const deleteNotification = async (id: number): Promise<void> => {
    await httpClient.delete(`/api/notifications/${id}`);
};

export interface CreateNotificationDto {
    title: string;
    body: string;
    link?: string;
    userId: number;
}

export interface UpdateNotificationDto {
    title?: string;
    body?: string;
    link?: string;
    seen?: boolean;
} 