import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor for JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/login', formData);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/register', userData);
        return response.data;
    }
};

export const requestService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/requests/?${params}`);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/reports/stats');
        return response.data;
    },
    getCalendar: async (start, end) => {
        const response = await api.get(`/requests/calendar?start_date=${start}&end_date=${end}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/requests/', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/requests/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/requests/${id}`);
    }
};

export const resourceService = {
    getEquipment: async () => {
        const response = await api.get('/equipment/');
        return response.data;
    },
    getEquipmentById: async (id) => {
        const response = await api.get(`/equipment/${id}`);
        return response.data;
    },
    createEquipment: async (data) => {
        const response = await api.post('/equipment/', data);
        return response.data;
    },
    updateEquipment: async (id, data) => {
        const response = await api.put(`/equipment/${id}`, data);
        return response.data;
    },
    getTeams: async () => {
        const response = await api.get('/teams/');
        return response.data;
    },
    createTeam: async (data) => {
        const response = await api.post('/teams/', data);
        return response.data;
    },

    // Work Centers
    getWorkCenters: async () => {
        const response = await api.get('/work-centers/');
        return response.data;
    },
    getWorkCenterById: async (id) => {
        const response = await api.get(`/work-centers/${id}`);
        return response.data;
    },
    createWorkCenter: async (data) => {
        const response = await api.post('/work-centers/', data);
        return response.data;
    },

    getUsers: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/users/?${params}`);
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/categories/');
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post('/categories/', data);
        return response.data;
    }
};

export default api;
