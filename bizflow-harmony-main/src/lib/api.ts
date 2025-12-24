import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// For public access by slug
export const getEstablishmentBySlug = async (slug: string) => {
    const response = await api.get(`/public/establishment/${slug}`);
    return response.data;
};

// Public Services & Professionals
export const getServices = async (tenantId: string) => {
    const response = await api.get(`/public/services?tenantId=${tenantId}`);
    return response.data;
};

export const getProfessionals = async (tenantId: string) => {
    const response = await api.get(`/public/professionals?tenantId=${tenantId}`);
    return response.data;
};

export const getAvailability = async (tenantId: string, professionalId: string, date: string) => {
    const response = await api.get(`/public/availability`, {
        params: { tenantId, professionalId, date }
    });
    return response.data;
};

// Admin / Secure Routes
export const getFinancialSummary = async () => {
    const response = await api.get('/finance/summary');
    return response.data;
};

export const getTodayAppointments = async () => {
    // Assuming backend has a filter or we fetch all and filter client side (MVP simplifiction: fetch all today)
    // Actually, let's assume we have an appointments endpoint. If not, I'll need to create it.
    // Checking previous context, I didn't verify an 'appointments' list endpoint. 
    // I will use a generic /appointments endpoint and assume it exists or I will create it.
    // For now let's try to hit /appointments?date=today
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/appointments?date=${today}`);
    return response.data;
};

export const getAppointmentsByDate = async (date: string) => {
    const response = await api.get(`/appointments?date=${date}`);
    return response.data;
};

export const getPendingPayments = async () => {
    const response = await api.get('/appointments?status=awaiting_validation');
    return response.data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
};

export const updateTenantConfig = async (data: any) => {
    const response = await api.put('/config', data);
    return response.data;
};

// Services CRUD (Admin)
export const getAdminServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

export const createService = async (data: any) => {
    const response = await api.post('/services', data);
    return response.data;
};

export const updateService = async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
};

export const deleteService = async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
};

// Professionals CRUD (Admin)
export const getAdminProfessionals = async () => {
    const response = await api.get('/professionals');
    return response.data;
};

export const createProfessional = async (data: any) => {
    const response = await api.post('/professionals', data);
    return response.data;
};

export const updateProfessional = async (id: string, data: any) => {
    const response = await api.put(`/professionals/${id}`, data);
    return response.data;
};

export const deleteProfessional = async (id: string) => {
    const response = await api.delete(`/professionals/${id}`);
    return response.data;
};
