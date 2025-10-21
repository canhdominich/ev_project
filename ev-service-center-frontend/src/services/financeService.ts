import { httpClient } from "@/lib/httpClient";

export interface Invoice {
    id: number;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    dueDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer';
    paymentDate: string;
    reference: string;
    createdAt: string;
    updatedAt: string;
    
    // Relations
    invoice?: Invoice;
}

export interface CreateInvoiceRequest {
    customerName: string;
    customerEmail: string;
    amount: number;
    dueDate: string;
    description: string;
}

export interface RecordPaymentRequest {
    invoiceId: number;
    amount: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer';
    reference: string;
}

// API Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    const res = await httpClient.get('/api/invoices');
    return res.data;
};

export const createInvoice = async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const res = await httpClient.post('/api/invoices', data);
    return res.data;
};

export const recordPayment = async (data: RecordPaymentRequest): Promise<Payment> => {
    const res = await httpClient.post('/api/invoices/payment', data);
    return res.data;
};
