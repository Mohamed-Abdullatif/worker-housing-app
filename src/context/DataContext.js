// src/context/DataContext.js - FIXED VERSION WITHOUT FALLBACK DATA
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api.service';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    // ALL START EMPTY - NO STATIC DATA
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [groceryItems, setGroceryItems] = useState([]);
    const [groceryOrders, setGroceryOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);

    // Auto-fetch data when user token exists
    useEffect(() => {
        const initializeData = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token && !dataFetched) {
                console.log('DataContext: Token found, fetching all data...');
                await fetchAllData();
                setDataFetched(true);
            }
        };
        initializeData();
    }, [dataFetched]);

    // FETCH ALL DATA FROM API
    const fetchAllData = useCallback(async () => {
        console.log('🔄 DataContext: Fetching ALL data from database...');
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const results = await Promise.allSettled([
                fetchMaintenanceRequests(),
                fetchInvoices(),
                fetchGroceryItems(),
                fetchGroceryOrders(),
                fetchUsers()
            ]);

            console.log('📊 DataContext: Fetch results:', {
                maintenance: results[0].status,
                invoices: results[1].status,
                groceryItems: results[2].status,
                groceryOrders: results[3].status,
                users: results[4].status
            });

            // Check if any critical fetches failed
            const failedFetches = results.filter(result => result.status === 'rejected');
            if (failedFetches.length > 0) {
                console.warn('⚠️ Some data fetches failed:', failedFetches);
            }

        } catch (error) {
            console.error('❌ DataContext: Error fetching data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // MAINTENANCE REQUESTS
    const fetchMaintenanceRequests = useCallback(async (params = {}) => {
        try {
            console.log('🔧 Fetching maintenance requests from API...');
            const response = await apiService.getMaintenanceRequests(params);
            console.log('🔧 Maintenance API response:', response);

            const data = extractDataFromResponse(response, 'maintenanceRequests', 'requests', 'data');
            console.log('🔧 Extracted maintenance data:', data);
            setMaintenanceRequests(data);
            return data;
        } catch (error) {
            console.error('❌ Fetch maintenance requests failed:', error);
            setMaintenanceRequests([]); // Keep empty on error
            throw error;
        }
    }, []);

    const addMaintenanceRequest = useCallback(async (data) => {
        try {
            console.log('➕ Creating maintenance request:', data);
            const response = await apiService.createMaintenanceRequest(data);
            console.log('✅ Maintenance request created:', response);

            const newRequest = extractSingleItem(response);
            setMaintenanceRequests(prev => [newRequest, ...prev]);
            return newRequest;
        } catch (error) {
            console.error('❌ Create maintenance request failed:', error);
            throw new Error(`Failed to create maintenance request: ${error.message}`);
        }
    }, []);

    const updateMaintenanceStatus = useCallback(async (id, status, note) => {
        try {
            console.log('🔄 Updating maintenance status:', { id, status, note });
            const response = await apiService.updateMaintenanceStatus(id, status, note);
            console.log('✅ Maintenance status updated:', response);

            const updatedRequest = extractSingleItem(response);
            setMaintenanceRequests(prev =>
                prev.map(req => (req.id === id || req._id === id ? updatedRequest : req))
            );
            return updatedRequest;
        } catch (error) {
            console.error('❌ Update maintenance status failed:', error);
            throw new Error(`Failed to update maintenance status: ${error.message}`);
        }
    }, []);

    // INVOICES
    const fetchInvoices = useCallback(async (params = {}) => {
        try {
            console.log('💰 Fetching invoices from API...', { params });

            // Log the current token
            const token = await AsyncStorage.getItem('token');
            console.log('Current auth token:', token ? 'Present' : 'Missing');

            const response = await apiService.getInvoices(params);
            console.log('💰 Invoices API response:', {
                status: response?.status,
                data: response?.data,
                raw: response
            });

            let data = extractDataFromResponse(response, 'invoices', 'data');
            console.log('💰 Extracted invoices data:', {
                count: data?.length,
                firstItem: data?.[0],
                data
            });

            // Format the data to match the UI requirements
            const formattedData = data.map(invoice => ({
                id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                roomNumber: invoice.userId, // This should be mapped to actual room number
                amount: invoice.amount,
                type: invoice.type,
                status: invoice.status,
                dueDate: invoice.dueDate,
                description: invoice.description,
                paidDate: invoice.paidDate,
                createdAt: invoice.createdAt,
                updatedAt: invoice.updatedAt,
                items: [invoice.type], // Using the type as an item for now
                month: new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }));

            console.log('💰 Formatted invoices data:', formattedData);
            setInvoices(formattedData);
            return formattedData;
        } catch (error) {
            console.error('❌ Fetch invoices failed:', error);
            setInvoices([]);
            throw error;
        }
    }, []);

    const createInvoice = useCallback(async (data) => {
        try {
            console.log('➕ Creating invoice:', data);
            const response = await apiService.createInvoice(data);
            console.log('✅ Invoice created:', response);

            const newInvoice = extractSingleItem(response);
            setInvoices(prev => [newInvoice, ...prev]);
            return newInvoice;
        } catch (error) {
            console.error('❌ Create invoice failed:', error);
            throw new Error(`Failed to create invoice: ${error.message}`);
        }
    }, []);

    const updateInvoiceStatus = useCallback(async (id, status, paymentProof) => {
        try {
            console.log('🔄 Updating invoice status:', { id, status, paymentProof });
            const response = await apiService.updateInvoiceStatus(id, status, null, null, null);
            console.log('✅ Invoice status updated:', response);

            let updatedInvoice = extractSingleItem(response);

            // Add payment proof if provided
            if (paymentProof) {
                updatedInvoice = {
                    ...updatedInvoice,
                    paymentProof: {
                        ...paymentProof,
                        date: new Date().toISOString()
                    }
                };
            }

            setInvoices(prev =>
                prev.map(inv => (inv.id === id || inv._id === id ? updatedInvoice : inv))
            );
            return updatedInvoice;
        } catch (error) {
            console.error('❌ Update invoice status failed:', error);
            throw new Error(`Failed to update invoice status: ${error.message}`);
        }
    }, []);

    // GROCERY ITEMS
    const fetchGroceryItems = useCallback(async (params = {}) => {
        try {
            console.log('🛒 Fetching grocery items from API...');
            const response = await apiService.getGroceryItems(params);
            console.log('🛒 Grocery items API response:', response);

            const data = extractDataFromResponse(response, 'groceryItems', 'items', 'data');
            console.log('🛒 Extracted grocery items:', data);
            setGroceryItems(data);
            return data;
        } catch (error) {
            console.error('❌ Fetch grocery items failed:', error);
            setGroceryItems([]); // Keep empty on error
            throw error;
        }
    }, []);

    const createGroceryItem = useCallback(async (data) => {
        try {
            console.log('➕ Creating grocery item:', data);
            const response = await apiService.createGroceryItem(data);
            console.log('✅ Grocery item created:', response);

            const newItem = extractSingleItem(response);
            setGroceryItems(prev => [newItem, ...prev]);
            return newItem;
        } catch (error) {
            console.error('❌ Create grocery item failed:', error);
            throw new Error(`Failed to create grocery item: ${error.message}`);
        }
    }, []);

    const updateGroceryItem = useCallback(async (id, data) => {
        try {
            console.log('🔄 Updating grocery item:', { id, data });
            const response = await apiService.updateGroceryItem(id, data);
            console.log('✅ Grocery item updated:', response);

            const updatedItem = extractSingleItem(response);
            setGroceryItems(prev =>
                prev.map(item => (item.id === id || item._id === id ? updatedItem : item))
            );
            return updatedItem;
        } catch (error) {
            console.error('❌ Update grocery item failed:', error);
            throw new Error(`Failed to update grocery item: ${error.message}`);
        }
    }, []);

    const deleteGroceryItem = useCallback(async (id) => {
        try {
            console.log('🗑️ Deleting grocery item:', id);
            await apiService.deleteGroceryItem(id);
            console.log('✅ Grocery item deleted');

            setGroceryItems(prev => prev.filter(item => item.id !== id && item._id !== id));
        } catch (error) {
            console.error('❌ Delete grocery item failed:', error);
            throw new Error(`Failed to delete grocery item: ${error.message}`);
        }
    }, []);

    // GROCERY ORDERS
    const fetchGroceryOrders = useCallback(async (params = {}) => {
        try {
            console.log('📦 Fetching grocery orders from API...');
            const response = await apiService.getGroceryOrders(params);
            console.log('📦 Grocery orders API response:', response);

            const data = extractDataFromResponse(response, 'groceryOrders', 'orders', 'data');
            console.log('📦 Extracted grocery orders:', data);
            setGroceryOrders(data);
            return data;
        } catch (error) {
            console.error('❌ Fetch grocery orders failed:', error);
            setGroceryOrders([]); // Keep empty on error
            throw error;
        }
    }, []);

    const addOrder = useCallback(async (orderData) => {
        try {
            console.log('➕ Creating grocery order:', orderData);
            const response = await apiService.createGroceryOrder(orderData);
            console.log('✅ Grocery order created:', response);

            const newOrder = extractSingleItem(response);
            setGroceryOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } catch (error) {
            console.error('❌ Create grocery order failed:', error);
            throw new Error(`Failed to create grocery order: ${error.message}`);
        }
    }, []);

    const updateGroceryOrderStatus = useCallback(async (id, status) => {
        try {
            console.log('🔄 Updating grocery order status:', { id, status });
            const response = await apiService.updateGroceryOrderStatus(id, status);
            console.log('✅ Grocery order status updated:', response);

            const updatedOrder = extractSingleItem(response);
            setGroceryOrders(prev =>
                prev.map(order => (order.id === id || order._id === id ? updatedOrder : order))
            );
            return updatedOrder;
        } catch (error) {
            console.error('❌ Update grocery order status failed:', error);
            throw new Error(`Failed to update grocery order status: ${error.message}`);
        }
    }, []);

    // USERS (for management)
    const fetchUsers = useCallback(async (params = {}) => {
        try {
            console.log('👥 Fetching users from API...');
            const response = await apiService.getUsers ? await apiService.getUsers(params) : { data: [] };
            console.log('👥 Users API response:', response);

            const data = extractDataFromResponse(response, 'users', 'data');
            console.log('👥 Extracted users:', data);
            setUsers(data);
            return data;
        } catch (error) {
            console.error('❌ Fetch users failed:', error);
            setUsers([]); // Keep empty on error
            throw error;
        }
    }, []);

    // Helper function to extract data from different response formats
    const extractDataFromResponse = (response, ...possibleKeys) => {
        if (!response) {
            console.log('⚠️ Response is null/undefined');
            return [];
        }

        // If response is already an array
        if (Array.isArray(response)) {
            console.log('✅ Response is array, length:', response.length);
            return response;
        }

        // Check for data property first
        if (response.data && Array.isArray(response.data)) {
            console.log('✅ Found data array, length:', response.data.length);
            return response.data;
        }

        // Check for specific keys
        for (const key of possibleKeys) {
            if (response[key] && Array.isArray(response[key])) {
                console.log(`✅ Found ${key} array, length:`, response[key].length);
                return response[key];
            }
        }

        // If response.data exists but isn't array, check its properties
        if (response.data) {
            for (const key of possibleKeys) {
                if (response.data[key] && Array.isArray(response.data[key])) {
                    console.log(`✅ Found data.${key} array, length:`, response.data[key].length);
                    return response.data[key];
                }
            }
        }

        console.log('⚠️ No array found in response, returning empty array');
        return [];
    };

    // Helper function to extract single item from response
    const extractSingleItem = (response) => {
        if (!response) return null;

        // If response has data property
        if (response.data) {
            return response.data;
        }

        // If response is the item itself
        return response;
    };

    // PDF functions
    const generateInvoicePDF = useCallback(async (id) => {
        try {
            console.log('📄 Generating invoice PDF for:', id);
            const response = await apiService.generateInvoicePDF(id);
            console.log('✅ PDF generated:', response);
            return response.data?.pdfUrl || response.pdfUrl;
        } catch (error) {
            console.error('❌ Generate PDF failed:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }, []);

    const generateOrderReceipt = useCallback(async (id) => {
        try {
            console.log('🧾 Generating order receipt for:', id);
            const response = await apiService.generateOrderReceipt(id);
            console.log('✅ Receipt generated:', response);
            return response.data?.pdfUrl || response.pdfUrl;
        } catch (error) {
            console.error('❌ Generate receipt failed:', error);
            throw new Error(`Failed to generate receipt: ${error.message}`);
        }
    }, []);

    const value = {
        // State
        maintenanceRequests,
        invoices,
        groceryItems,
        groceryOrders,
        users,
        loading,
        error,
        dataFetched,

        // Maintenance functions
        fetchMaintenanceRequests,
        addMaintenanceRequest,
        updateMaintenanceStatus,

        // Invoice functions
        fetchInvoices,
        createInvoice,
        updateInvoiceStatus,

        // Grocery functions
        fetchGroceryItems,
        createGroceryItem,
        updateGroceryItem,
        deleteGroceryItem,
        addOrder,
        createGroceryOrder: addOrder, // Alias
        fetchGroceryOrders,
        updateGroceryOrderStatus,

        // User functions
        fetchUsers,

        // PDF functions
        generateInvoicePDF,
        generateOrderReceipt,

        // Refresh function
        fetchAllData,

        // Reset function for logout
        resetData: () => {
            setMaintenanceRequests([]);
            setInvoices([]);
            setGroceryItems([]);
            setGroceryOrders([]);
            setUsers([]);
            setDataFetched(false);
            setError(null);
        }
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};