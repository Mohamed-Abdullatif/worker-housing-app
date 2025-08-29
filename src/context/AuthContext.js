import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api.service';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await apiService.getCurrentUser();
                // The response structure should be response.data.user
                const user = response.data?.user || response.user || response;
                console.log('Loaded user from token:', user);
                setCurrentUser(user);
            }
        } catch (error) {
            console.error('Load user error:', error);
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await apiService.login(username, password);
            console.log('Full API Response in AuthContext:', response);

            // The response structure is: response.data.user
            const user = response.data?.user;

            if (!user) {
                console.error('No user found in response:', response);
                throw new Error('Invalid response format from server');
            }

            console.log('Setting current user:', user);
            setCurrentUser(user);
            return { user }; // Return in expected format
        } catch (error) {
            console.error('AuthContext login error:', error);
            setError(error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await apiService.register(userData);
            const user = response.data?.user || response.user;
            setCurrentUser(user);
            return user;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updatePushToken = async (pushToken) => {
        try {
            await apiService.updatePushToken(pushToken);
        } catch (error) {
            console.error('Update push token error:', error);
        }
    };

    // Added missing methods that are used in ManagementScreen
    const addUser = async (userData) => {
        try {
            // Generate a unique username and add default data
            const username = `user_${userData.roomNumber}_${Date.now()}`;
            const newUser = {
                ...userData,
                id: Date.now().toString(),
                username,
                type: 'resident',
                checkInDate: new Date().toISOString().split('T')[0],
                password: 'password123' // Default password
            };

            // Add to local state (in a real app, this would be an API call)
            setUsers(prev => [...prev, newUser]);
            return newUser;
        } catch (error) {
            console.error('Add user error:', error);
            throw error;
        }
    };

    const removeUser = async (userId) => {
        try {
            // Remove from local state (in a real app, this would be an API call)
            setUsers(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Remove user error:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        users,
        login,
        register,
        logout,
        updatePushToken,
        addUser,
        removeUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};