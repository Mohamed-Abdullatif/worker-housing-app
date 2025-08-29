// src/services/api.service.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, FALLBACK_URLS, API_ENDPOINTS, getHeaders, ERROR_MESSAGES } from './api.config';

class ApiService {
    constructor() {
        this.currentBaseURL = API_BASE_URL;
        this.api = axios.create({
            baseURL: this.currentBaseURL,
            timeout: 10000
        });

        // Try to connect to the API 
        this.initializeAPI();

        // Add Reactotron network tracking in dev mode
        if (__DEV__ && console.tron) {
            this.api.interceptors.request.use(request => {
                console.tron.log('Starting Request:', {
                    url: request.url,
                    method: request.method,
                    data: request.data,
                    headers: request.headers
                });
                return request;
            });

            this.api.interceptors.response.use(
                response => {
                    console.tron.log('Response:', {
                        status: response.status,
                        data: response.data,
                        headers: response.headers
                    });
                    return response;
                },
                error => {
                    console.tron.error('API Error:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        config: {
                            url: error.config?.url,
                            method: error.config?.method,
                            data: error.config?.data
                        }
                    });
                    return Promise.reject(error);
                }
            );
        }

        // Clear any existing headers
        delete this.api.defaults.headers.common['Content-Type'];

        // Set headers properly
        this.api.defaults.headers.post['Content-Type'] = 'application/json';
        this.api.defaults.headers.common['Accept'] = 'application/json';

        // Add request interceptor
        this.api.interceptors.request.use(
            async (config) => {
                // Get token from storage
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    config.headers = getHeaders(token);
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (!error.response) {
                    return Promise.reject({
                        message: ERROR_MESSAGES.network,
                    });
                }

                const { status, data } = error.response;

                switch (status) {
                    case 400:
                        return Promise.reject({
                            message: ERROR_MESSAGES.validation,
                            errors: data.errors,
                        });
                    case 401:
                        // Handle token expiration
                        AsyncStorage.removeItem('token');
                        return Promise.reject({
                            message: ERROR_MESSAGES.unauthorized,
                        });
                    case 404:
                        return Promise.reject({
                            message: ERROR_MESSAGES.notFound,
                        });
                    default:
                        return Promise.reject({
                            message: data.message || ERROR_MESSAGES.server,
                        });
                }
            }
        );
    }

    // =================
    // AUTH API METHODS
    // =================

    async initializeAPI() {
        const urls = [this.currentBaseURL, ...FALLBACK_URLS];
        for (const url of urls) {
            try {
                const response = await fetch(url + '/ping', { method: 'HEAD', timeout: 5000 });
                if (response.ok) {
                    if (url !== this.currentBaseURL) {
                        console.log('Switching to working API URL:', url);
                        this.currentBaseURL = url;
                        this.api.defaults.baseURL = url;
                    }
                    return;
                }
            } catch (error) {
                console.log(`API endpoint ${url} not reachable:`, error.message);
            }
        }
        console.error('No API endpoints are reachable');
    }

    async login(username, password) {
        console.log('Login attempt:', {
            username,
            fullUrl: this.currentBaseURL + API_ENDPOINTS.auth.login,
            method: 'POST',
            headers: {
                post: this.api.defaults.headers.post,
                common: this.api.defaults.headers.common
            }
        });

        try {
            // Try to initialize API connection first
            await this.initializeAPI();

            const response = await this.api.post(API_ENDPOINTS.auth.login, {
                username,
                password,
            });

            console.log('Login API response:', response);

            if (response?.data?.token) {
                await AsyncStorage.setItem('token', response.data.token);
                return response;
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Login API error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: this.currentBaseURL,
                    headers: error.config?.headers
                }
            });

            // Translate error messages for better user experience
            if (error.response?.status === 403) {
                throw new Error('Invalid username or password');
            } else if (!error.response) {
                throw new Error('Cannot connect to server. Please check your connection and try again.');
            }
            throw error;
        }
    }

    async register(userData) {
        return await this.api.post(API_ENDPOINTS.auth.register, userData);
    }

    async getCurrentUser() {
        return await this.api.get(API_ENDPOINTS.auth.me);
    }

    async updatePushToken(pushToken) {
        return await this.api.put(API_ENDPOINTS.auth.pushToken, { pushToken });
    }

    async logout() {
        try {
            await this.api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Always remove local token
            await AsyncStorage.removeItem('token');
        }
    }

    // =================
    // USER PROFILE API
    // =================

    async getUserProfile(userId) {
        return await this.api.get(`/auth/profile/${userId}`);
    }

    async updateUserProfile(userId, data) {
        return await this.api.put(`/auth/profile/${userId}`, data);
    }

    async uploadProfileImage(userId, imageData) {
        const formData = new FormData();
        formData.append('profileImage', {
            uri: imageData.uri,
            type: imageData.type || 'image/jpeg',
            name: imageData.fileName || 'profile.jpg',
        });

        return await this.api.post(`/auth/profile/${userId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.api.put('/auth/change-password', {
            currentPassword,
            newPassword,
        });
    }

    async deleteAccount() {
        return await this.api.delete('/auth/profile');
    }

    // User preferences
    async updatePreferences(preferences) {
        return await this.api.put('/auth/preferences', preferences);
    }

    async getPreferences() {
        return await this.api.get('/auth/preferences');
    }

    // Notification settings
    async updateNotificationSettings(settings) {
        return await this.api.put('/auth/notifications', settings);
    }

    async getNotificationSettings() {
        return await this.api.get('/auth/notifications');
    }

    // ===================
    // MAINTENANCE API
    // ===================

    async createMaintenanceRequest(data) {
        return await this.api.post(API_ENDPOINTS.maintenance.create, data);
    }

    async getMaintenanceRequests(params) {
        console.log('🔧 Fetching maintenance requests with params:', params);
        try {
            const response = await this.api.get(API_ENDPOINTS.maintenance.list, { params });
            console.log('🔧 Raw maintenance API response:', {
                status: response?.status,
                success: response?.success,
                count: response?.count,
                data: response?.data,
                firstItem: response?.data?.[0]
            });
            return response;
        } catch (error) {
            console.error('🔧 Maintenance API error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }

    async getMaintenanceRequest(id) {
        return await this.api.get(API_ENDPOINTS.maintenance.details(id));
    }

    async updateMaintenanceStatus(id, status, note) {
        return await this.api.put(API_ENDPOINTS.maintenance.status(id), {
            status,
            note,
        });
    }

    async assignMaintenanceRequest(id, assignedTo) {
        return await this.api.put(API_ENDPOINTS.maintenance.assign(id), {
            assignedTo,
        });
    }

    async addMaintenanceNote(id, content) {
        return await this.api.post(API_ENDPOINTS.maintenance.notes(id), {
            content,
        });
    }

    async uploadMaintenanceImage(id, imageData) {
        const formData = new FormData();
        formData.append('image', {
            uri: imageData.uri,
            type: imageData.type || 'image/jpeg',
            name: imageData.fileName || 'maintenance.jpg',
        });

        return await this.api.post(`/maintenance/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // =================
    // INVOICE API
    // =================

    async createInvoice(data) {
        return await this.api.post(API_ENDPOINTS.invoices.create, data);
    }

    async getInvoices(params = {}) {
        console.log('Fetching invoices with params:', params);
        try {
            // Log the full URL that will be used
            const fullUrl = this.api.getUri({
                url: API_ENDPOINTS.invoices.list,
                params: {
                    ...params,
                    userId: params.userId || undefined
                }
            });
            console.log('Full invoice URL:', fullUrl);

            // Test endpoint accessibility
            try {
                await this.api.options(API_ENDPOINTS.invoices.list);
                console.log('Invoice endpoint is accessible');
            } catch (error) {
                console.error('Invoice endpoint check failed:', error.message);
            }

            const response = await this.api.get(API_ENDPOINTS.invoices.list, {
                params: {
                    ...params,
                    userId: params.userId || undefined
                }
            });
            console.log('Raw invoice response:', {
                status: response?.status,
                headers: response?.headers,
                data: response?.data
            });
            return response;
        } catch (error) {
            console.error('Error fetching invoices:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    }

    async getOverdueInvoices() {
        return await this.api.get(API_ENDPOINTS.invoices.overdue);
    }

    async getInvoice(id) {
        return await this.api.get(API_ENDPOINTS.invoices.details(id));
    }

    async updateInvoiceStatus(id, status, paymentMethod, paymentReference, note) {
        return await this.api.put(API_ENDPOINTS.invoices.status(id), {
            status,
            paymentMethod,
            paymentReference,
            note,
        });
    }

    async addInvoiceNote(id, content) {
        return await this.api.post(API_ENDPOINTS.invoices.notes(id), {
            content,
        });
    }

    async uploadPaymentProof(invoiceId, imageData, notes) {
        const formData = new FormData();
        formData.append('paymentProof', {
            uri: imageData.uri,
            type: imageData.type || 'image/jpeg',
            name: imageData.fileName || 'payment_proof.jpg',
        });

        if (notes) {
            formData.append('notes', notes);
        }

        return await this.api.post(`/invoices/${invoiceId}/payment-proof`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // =================
    // GROCERY API
    // =================

    async getGroceryItems(params) {
        return await this.api.get(API_ENDPOINTS.grocery.items.list, { params });
    }

    async createGroceryItem(data) {
        return await this.api.post(API_ENDPOINTS.grocery.items.create, data);
    }

    async updateGroceryItem(id, data) {
        return await this.api.put(API_ENDPOINTS.grocery.items.update(id), data);
    }

    async deleteGroceryItem(id) {
        return await this.api.delete(API_ENDPOINTS.grocery.items.delete(id));
    }

    async updateGroceryStock(id, stock) {
        return await this.api.put(API_ENDPOINTS.grocery.items.stock(id), { stock });
    }

    async toggleGroceryAvailability(id) {
        return await this.api.put(API_ENDPOINTS.grocery.items.availability(id));
    }

    async uploadGroceryItemImage(id, imageData) {
        const formData = new FormData();
        formData.append('image', {
            uri: imageData.uri,
            type: imageData.type || 'image/jpeg',
            name: imageData.fileName || 'grocery_item.jpg',
        });

        return await this.api.post(`/grocery/items/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // =================
    // GROCERY ORDERS API
    // =================

    async createGroceryOrder(data) {
        return await this.api.post(API_ENDPOINTS.grocery.orders.create, data);
    }

    async getGroceryOrders(params) {
        return await this.api.get(API_ENDPOINTS.grocery.orders.list, { params });
    }

    async getGroceryOrder(id) {
        return await this.api.get(API_ENDPOINTS.grocery.orders.details(id));
    }

    async updateGroceryOrderStatus(id, status) {
        return await this.api.put(API_ENDPOINTS.grocery.orders.status(id), {
            status,
        });
    }

    async updateGroceryOrderPayment(id, paymentStatus) {
        return await this.api.put(API_ENDPOINTS.grocery.orders.payment(id), {
            paymentStatus,
        });
    }

    async cancelGroceryOrder(id, reason) {
        return await this.api.put(`/grocery/orders/${id}/cancel`, {
            reason,
        });
    }

    // =================
    // USER MANAGEMENT API
    // =================

    async getUsers(params) {
        return await this.api.get('/users', { params });
    }

    async createUser(userData) {
        return await this.api.post('/users', userData);
    }

    async updateUser(id, userData) {
        return await this.api.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return await this.api.delete(`/users/${id}`);
    }

    async getUsersByType(type) {
        return await this.api.get(`/users/type/${type}`);
    }

    async getUsersByRoom(roomNumber) {
        return await this.api.get(`/users/room/${roomNumber}`);
    }

    async activateUser(id) {
        return await this.api.put(`/users/${id}/activate`);
    }

    async deactivateUser(id) {
        return await this.api.put(`/users/${id}/deactivate`);
    }

    // =================
    // NOTIFICATION API
    // =================

    async getNotifications(params) {
        return await this.api.get(API_ENDPOINTS.notifications.list, { params });
    }

    async markNotificationAsRead(id) {
        return await this.api.put(API_ENDPOINTS.notifications.read(id));
    }

    async markAllNotificationsAsRead() {
        return await this.api.put(API_ENDPOINTS.notifications.readAll);
    }

    async deleteNotification(id) {
        return await this.api.delete(`/notifications/${id}`);
    }

    async sendNotification(data) {
        return await this.api.post('/notifications', data);
    }

    // =================
    // PDF API
    // =================

    async generateInvoicePDF(id) {
        return await this.api.post(API_ENDPOINTS.pdf.invoice(id));
    }

    async generateOrderReceipt(id) {
        return await this.api.post(API_ENDPOINTS.pdf.order(id));
    }

    async generateMonthlyReport(month, year) {
        return await this.api.get(API_ENDPOINTS.pdf.report, {
            params: { month, year },
        });
    }

    async generateMaintenanceReport(params) {
        return await this.api.get('/pdf/maintenance-report', { params });
    }

    async generateUserReport(params) {
        return await this.api.get('/pdf/user-report', { params });
    }

    getPDFUrl(fileName) {
        return `${API_BASE_URL}${API_ENDPOINTS.pdf.file(fileName)}`;
    }

    // =================
    // ANALYTICS API
    // =================

    async getDashboardStats() {
        return await this.api.get('/analytics/dashboard');
    }

    async getRevenueStats(params) {
        return await this.api.get('/analytics/revenue', { params });
    }

    async getMaintenanceStats(params) {
        return await this.api.get('/analytics/maintenance', { params });
    }

    async getOccupancyStats(params) {
        return await this.api.get('/analytics/occupancy', { params });
    }

    async getMonthlyReport(month, year) {
        return await this.api.get('/analytics/monthly-report', {
            params: { month, year }
        });
    }

    // =================
    // ANNOUNCEMENTS API
    // =================

    async getAnnouncements(params) {
        return await this.api.get('/announcements', { params });
    }

    async createAnnouncement(data) {
        return await this.api.post('/announcements', data);
    }

    async updateAnnouncement(id, data) {
        return await this.api.put(`/announcements/${id}`, data);
    }

    async deleteAnnouncement(id) {
        return await this.api.delete(`/announcements/${id}`);
    }

    async markAnnouncementAsRead(id) {
        return await this.api.put(`/announcements/${id}/read`);
    }

    // =================
    // PAYMENTS API
    // =================

    async getPaymentMethods() {
        return await this.api.get('/payments/methods');
    }

    async processPayment(data) {
        return await this.api.post('/payments/process', data);
    }

    async getPaymentHistory(params) {
        return await this.api.get('/payments/history', { params });
    }

    async refundPayment(paymentId, reason) {
        return await this.api.post(`/payments/${paymentId}/refund`, { reason });
    }

    // =================
    // SETTINGS API
    // =================

    async getSystemSettings() {
        return await this.api.get('/settings');
    }

    async updateSystemSettings(settings) {
        return await this.api.put('/settings', settings);
    }

    async getApplicationConfig() {
        return await this.api.get('/config');
    }

    async updateApplicationConfig(config) {
        return await this.api.put('/config', config);
    }

    // =================
    // BACKUP & EXPORT API
    // =================

    async exportData(type, params) {
        return await this.api.get(`/export/${type}`, {
            params,
            responseType: 'blob'
        });
    }

    async importData(type, file) {
        const formData = new FormData();
        formData.append('file', file);

        return await this.api.post(`/import/${type}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async createBackup() {
        return await this.api.post('/backup/create');
    }

    async getBackups() {
        return await this.api.get('/backup/list');
    }

    async restoreBackup(backupId) {
        return await this.api.post(`/backup/restore/${backupId}`);
    }

    // =================
    // UTILITY METHODS
    // =================

    async ping() {
        return await this.api.get('/ping');
    }

    async getServerStatus() {
        return await this.api.get('/status');
    }

    async uploadFile(file, path = 'uploads') {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'application/octet-stream',
            name: file.fileName || 'file',
        });

        return await this.api.post(`/${path}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async deleteFile(filePath) {
        return await this.api.delete(`/files/${encodeURIComponent(filePath)}`);
    }

    // =================
    // ERROR HANDLING
    // =================

    async checkConnection() {
        try {
            await this.ping();
            return { connected: true };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
}

export default new ApiService();