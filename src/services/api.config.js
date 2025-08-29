// api.config.js - FIXED VERSION
const PORT = process.env.PORT || 5001;

// Try multiple possible API endpoints
export const API_BASE_URL = __DEV__
    ? 'http://localhost:5001/api'  // Updated to use port 5001
    : 'https://api.workerhousing.com/api';

// Alternative endpoints to try if main one fails
export const FALLBACK_URLS = [
    'http://localhost:5001/api',
    'http://192.168.1.18:5000/api',
    'http://192.168.1.18:5001/api',
    'http://127.0.0.1:5000/api',
    'http://127.0.0.1:5001/api'
];

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        me: '/auth/me',
        pushToken: '/auth/push-token',
    },

    // Maintenance endpoints
    maintenance: {
        create: '/maintenance',
        list: '/maintenance',
        details: (id) => `/maintenance/${id}`,
        status: (id) => `/maintenance/${id}/status`,
        assign: (id) => `/maintenance/${id}/assign`,
        notes: (id) => `/maintenance/${id}/notes`,
    },

    // Invoice endpoints
    invoices: {
        create: '/invoices',
        list: '/invoices',
        overdue: '/invoices/overdue',
        details: (id) => `/invoices/${id}`,
        status: (id) => `/invoices/${id}/status`,
        notes: (id) => `/invoices/${id}/notes`,
        pdf: (id) => `/invoices/${id}/pdf`,
    },

    // Grocery endpoints
    grocery: {
        items: {
            list: '/grocery/items',
            create: '/grocery/items',
            details: (id) => `/grocery/items/${id}`,
            update: (id) => `/grocery/items/${id}`,
            delete: (id) => `/grocery/items/${id}`,
            stock: (id) => `/grocery/items/${id}/stock`,
            availability: (id) => `/grocery/items/${id}/availability`,
        },
        orders: {
            create: '/grocery/orders',
            list: '/grocery/orders',
            details: (id) => `/grocery/orders/${id}`,
            status: (id) => `/grocery/orders/${id}/status`,
            payment: (id) => `/grocery/orders/${id}/payment`,
        },
    },

    // User endpoints
    users: '/users',

    // Notification endpoints
    notifications: {
        list: '/notifications',
        read: (id) => `/notifications/${id}/read`,
        readAll: '/notifications/read-all',
    },

    // PDF endpoints
    pdf: {
        invoice: (id) => `/pdf/invoice/${id}`,
        order: (id) => `/pdf/order/${id}`,
        report: '/pdf/report',
        file: (fileName) => `/pdf/${fileName}`,
    },
};

// Request headers
export const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
});

// Error messages
export const ERROR_MESSAGES = {
    network: 'Network error. Please check your internet connection.',
    server: 'Server error. Please try again later.',
    unauthorized: 'Unauthorized. Please login again.',
    validation: 'Please check your input and try again.',
    notFound: 'Resource not found.',
};