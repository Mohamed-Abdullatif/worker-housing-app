// src/navigation/MainTabNavigator.js
import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useLocalization } from '../context/LocalizationContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import GroceryScreen from '../screens/GroceryScreen';
import ManagementScreen from '../screens/ManagementScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    const { currentUser, isLoading } = useAuth();
    const { theme, isDarkMode } = useThemeContext();
    const { t } = useLocalization();

    console.log('MainTabNavigator - currentUser:', currentUser);
    console.log('MainTabNavigator - isLoading:', isLoading);

    if (isLoading) {
        return null;
    }

    // Don't render navigator if user is not loaded
    if (!currentUser) {
        console.log('MainTabNavigator - No current user, returning null');
        return null;
    }

    const userType = currentUser.data?.type;
    const isAdmin = userType === 'admin';
    const isStaff = userType === 'staff' || userType === 'worker';
    const isResident = userType === 'resident';

    console.log('MainTabNavigator - User type:', userType);
    console.log('MainTabNavigator - isAdmin:', isAdmin, 'isStaff:', isStaff, 'isResident:', isResident);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Invoices':
                            iconName = focused ? 'receipt' : 'receipt-outline';
                            break;
                        case 'Maintenance':
                            iconName = focused ? 'build' : 'build-outline';
                            break;
                        case 'Grocery':
                            iconName = focused ? 'basket' : 'basket-outline';
                            break;
                        case 'Management':
                            iconName = focused ? 'settings' : 'settings-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                headerShown: false,
            })}
        >
            {/* Dashboard - Available to all users */}
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: t('tabs.dashboard'),
                }}
            />

            {/* Invoices - Available to all users */}
            <Tab.Screen
                name="Invoices"
                component={InvoicesScreen}
                options={{
                    tabBarLabel: t('tabs.invoices'),
                }}
            />

            {/* Maintenance - Available to all users */}
            <Tab.Screen
                name="Maintenance"
                component={MaintenanceScreen}
                options={{
                    tabBarLabel: t('tabs.maintenance'),
                }}
            />

            {/* Grocery - Available to residents and admins */}
            {(isResident || isAdmin) && (
                <Tab.Screen
                    name="Grocery"
                    component={GroceryScreen}
                    options={{
                        tabBarLabel: t('tabs.grocery'),
                    }}
                />
            )}

            {/* Management - Available to admins and staff */}
            {(isAdmin || isStaff) && (
                <Tab.Screen
                    name="Management"
                    component={ManagementScreen}
                    options={{
                        tabBarLabel: t('tabs.management'),
                    }}
                />
            )}

            {/* Profile - Available to all users */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: t('tabs.profile'),
                }}
            />
        </Tab.Navigator>
    );
}