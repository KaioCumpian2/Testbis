import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// For public access by slug
export const getEstablishmentBySlug = async (slug: string) => {
    const response = await api.get(`/public/establishment/${slug}`);
    return response.data;
};

// Add more API calls here as needed
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
