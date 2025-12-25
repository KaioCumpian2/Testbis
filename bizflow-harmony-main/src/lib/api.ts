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

export const getPublicReviews = async (tenantId: string) => {
    const response = await api.get(`/public/reviews?tenantId=${tenantId}`);
    return response.data;
};

export const createPublicAppointment = async (data: any) => {
    const response = await api.post(`/public/appointments`, data);
    return response.data;
};

export const createPublicReview = async (data: any) => {
    const response = await api.post(`/public/reviews`, data);
    return response.data;
};

export const getPublicAppointmentsByPhone = async (tenantId: string, phone: string) => {
    const response = await api.get(`/public/appointments`, {
        params: { tenantId, phone }
    });
    return response.data;
};

// Admin / Secure Routes
export const getFinancialSummary = async () => {
    const response = await api.get('/finance/summary');
    return response.data;
};

export const getDetailedReport = async (filters?: { startDate?: string, endDate?: string, professionalId?: string }) => {
    const response = await api.get('/finance/report', { params: filters });
    return response.data;
};

export const getTodayAppointments = async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/appointments?date=${today}`);
    return response.data;
};

export const getMyAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const getAdminAppointments = async (filters: { date?: string, status?: string, paymentStatus?: string }) => {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
};

export const getAppointmentsByDate = async (date: string) => {
    return getAdminAppointments({ date });
};

export const getPendingPayments = async () => {
    return getAdminAppointments({ paymentStatus: 'PENDING_APPROVAL' });
};

export const updateAppointmentStatus = async (id: string, status: string) => {
    const response = await api.put(`/appointments/${id}`, { status });
    return response.data;
};

export const approvePayment = async (id: string) => {
    const response = await api.post(`/appointments/${id}/approve-payment`);
    return response.data;
};

export const rejectPayment = async (id: string) => {
    const response = await api.post(`/appointments/${id}/reject-payment`);
    return response.data;
};

export const getAdminTenantConfig = async () => {
    const response = await api.get('/config');
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

// Reviews (Admin)
export const getAdminReviews = async (filters?: { rating?: number, serviceId?: string }) => {
    const response = await api.get('/reviews', { params: filters });
    return response.data;
};

// Notifications
export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationsAsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

// Agent Config (Admin)
export const getAgentConfigAdmin = async () => {
    const response = await api.get('/config/agent');
    return response.data;
};

export const updateAgentConfigAdmin = async (data: any) => {
    const response = await api.put('/config/agent', data);
    return response.data;
};
