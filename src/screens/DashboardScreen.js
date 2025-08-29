// src/screens/DashboardScreen.js - COMPLETE VERSION
import React, { useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLocalization } from '../context/LocalizationContext';
import { useThemeContext } from '../context/ThemeContext';
import {
    getUserData,
    getDaysStayed,
    isAdmin,
    isStaff,
    isResident,
    getUserDisplayName,
    getUserRoomNumber,
    formatCurrency,
    formatUserForDisplay
} from '../utils';

const ResidentDashboard = React.memo(({
    currentUser,
    invoices,
    maintenanceRequests,
    t,
    locale,
    changeLanguage,
    theme,
    isDarkMode,
    toggleTheme,
    refreshing,
    onRefresh,
    handleLogout,
    navigation,
    styles
}) => {
    // Use utility functions to get user data safely
    const user = getUserData(currentUser);
    const userRoomNumber = getUserRoomNumber(currentUser);
    const userDisplayName = getUserDisplayName(currentUser);
    const daysStayed = getDaysStayed(user);

    console.log('ResidentDashboard - user:', user);
    console.log('ResidentDashboard - userRoomNumber:', userRoomNumber);
    console.log('ResidentDashboard - daysStayed:', daysStayed);
    console.log('ResidentDashboard - invoices count:', invoices.length);
    console.log('ResidentDashboard - maintenance count:', maintenanceRequests.length);

    const userInvoices = React.useMemo(() => {
        const filtered = invoices.filter(inv => inv.roomNumber === userRoomNumber);
        console.log('User invoices filtered:', filtered.length, 'from total:', invoices.length);
        return filtered;
    }, [invoices, userRoomNumber]);

    const userMaintenance = React.useMemo(() => {
        const filtered = maintenanceRequests.filter(req => req.roomNumber === userRoomNumber);
        console.log('User maintenance filtered:', filtered.length, 'from total:', maintenanceRequests.length);
        return filtered;
    }, [maintenanceRequests, userRoomNumber]);

    const pendingInvoices = React.useMemo(() => {
        const pending = userInvoices.filter(inv => inv.status === 'pending');
        console.log('Pending invoices:', pending.length);
        return pending;
    }, [userInvoices]);

    const pendingMaintenance = React.useMemo(() => {
        const pending = userMaintenance.filter(req => req.status === 'pending');
        console.log('Pending maintenance:', pending.length);
        return pending;
    }, [userMaintenance]);

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    {t('welcome')} {userDisplayName}
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={styles.themeToggle}
                    >
                        <Ionicons
                            name={isDarkMode ? "sunny-outline" : "moon-outline"}
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeLanguage(locale === 'ar' ? 'en' : 'ar')}
                        style={styles.languageButton}
                    >
                        <Text style={styles.languageText}>
                            {locale === 'ar' ? 'EN' : 'عربي'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={theme.colors.icon.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <Card style={[styles.statCard, styles.blueCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="home" size={32} color={theme.colors.icon.blue} />
                        <Title style={styles.statNumber}>{userRoomNumber}</Title>
                        <Paragraph style={styles.statLabel}>{t('roomNumber')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.greenCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="calendar" size={32} color={theme.colors.icon.green} />
                        <Title style={styles.statNumber}>{daysStayed}</Title>
                        <Paragraph style={styles.statLabel}>{t('daysStayed')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.yellowCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="receipt" size={32} color={theme.colors.icon.yellow} />
                        <Title style={styles.statNumber}>{pendingInvoices.length}</Title>
                        <Paragraph style={styles.statLabel}>{t('pendingInvoices')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.redCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="build-outline" size={32} color={theme.colors.icon.red} />
                        <Title style={styles.statNumber}>{pendingMaintenance.length}</Title>
                        <Paragraph style={styles.statLabel}>{t('maintenanceRequests')}</Paragraph>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.quickActions}>
                <Title style={styles.sectionTitle}>{t('quickActions')}</Title>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Grocery')}
                    style={styles.actionButton}
                    icon={({ size, color }) => (
                        <Ionicons name="cart-outline" size={size} color={color} />
                    )}
                >
                    {t('orderGrocery')}
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Maintenance')}
                    style={[styles.actionButton, styles.maintenanceButton]}
                    icon={({ size, color }) => (
                        <Ionicons name="build-outline" size={size} color={color} />
                    )}
                >
                    {t('requestMaintenance')}
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Invoices')}
                    style={[styles.actionButton, styles.invoiceButton]}
                    icon={({ size, color }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    )}
                >
                    {t('viewInvoices')}
                </Button>
            </View>
        </ScrollView>
    );
});

const AdminDashboard = React.memo(({
    currentUser,
    invoices,
    maintenanceRequests,
    t,
    locale,
    changeLanguage,
    theme,
    isDarkMode,
    toggleTheme,
    refreshing,
    onRefresh,
    handleLogout,
    navigation,
    styles
}) => {
    // Use utility functions to get user data safely
    const user = getUserData(currentUser);
    const userDisplayName = getUserDisplayName(currentUser);

    console.log('AdminDashboard - user:', user);
    console.log('AdminDashboard - invoices count:', invoices.length);
    console.log('AdminDashboard - maintenance count:', maintenanceRequests.length);

    // For admin dashboard, get all residents from the users context
    const { users } = useAuth(); // Get users from AuthContext
    const residents = React.useMemo(() => {
        const filtered = users?.filter(u => isResident({ data: u }) || u.type === 'resident') || [];
        console.log('Admin - residents count:', filtered.length);
        return filtered;
    }, [users]);

    const totalRevenue = React.useMemo(() => {
        const revenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.amount || 0), 0);
        console.log('Admin - total revenue:', revenue);
        return revenue;
    }, [invoices]);

    const pendingInvoices = React.useMemo(() => {
        const pending = invoices.filter(inv => inv.status === 'pending');
        console.log('Admin - pending invoices:', pending.length);
        return pending;
    }, [invoices]);

    const pendingMaintenance = React.useMemo(() => {
        const pending = maintenanceRequests.filter(req => req.status === 'pending');
        console.log('Admin - pending maintenance:', pending.length);
        return pending;
    }, [maintenanceRequests]);

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>{t('adminDashboard')}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={styles.themeToggle}
                    >
                        <Ionicons
                            name={isDarkMode ? "sunny-outline" : "moon-outline"}
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeLanguage(locale === 'ar' ? 'en' : 'ar')}
                        style={styles.languageButton}
                    >
                        <Text style={styles.languageText}>
                            {locale === 'ar' ? 'EN' : 'عربي'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={theme.colors.icon.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <Card style={[styles.statCard, styles.blueCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="people" size={32} color={theme.colors.icon.blue} />
                        <Title style={styles.statNumber}>{residents.length}</Title>
                        <Paragraph style={styles.statLabel}>{t('totalResidents')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.greenCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="cash" size={32} color={theme.colors.icon.green} />
                        <Title style={styles.statNumber}>{formatCurrency(totalRevenue)}</Title>
                        <Paragraph style={styles.statLabel}>{t('revenue')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.yellowCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="warning" size={32} color={theme.colors.icon.yellow} />
                        <Title style={styles.statNumber}>{pendingInvoices.length}</Title>
                        <Paragraph style={styles.statLabel}>{t('pendingInvoices')}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.redCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="build-outline" size={32} color={theme.colors.icon.red} />
                        <Title style={styles.statNumber}>{pendingMaintenance.length}</Title>
                        <Paragraph style={styles.statLabel}>{t('pendingMaintenance')}</Paragraph>
                    </Card.Content>
                </Card>
            </View>

            <Button
                mode="contained"
                onPress={() => navigation.navigate('Management')}
                style={styles.managementButton}
                icon={({ size, color }) => (
                    <Ionicons name="settings-outline" size={size} color={color} />
                )}
            >
                {t('systemManagement')}
            </Button>
        </ScrollView>
    );
});

const StaffDashboard = React.memo(({
    currentUser,
    invoices,
    maintenanceRequests,
    t,
    locale,
    changeLanguage,
    theme,
    isDarkMode,
    toggleTheme,
    refreshing,
    onRefresh,
    handleLogout,
    navigation,
    styles
}) => {
    // Use utility functions to get user data safely
    const user = getUserData(currentUser);
    const userDisplayName = getUserDisplayName(currentUser);

    console.log('StaffDashboard - user:', user);

    const totalMaintenanceRequests = React.useMemo(() =>
        maintenanceRequests.length,
        [maintenanceRequests]
    );

    const pendingMaintenance = React.useMemo(() =>
        maintenanceRequests.filter(req => req.status === 'pending'),
        [maintenanceRequests]
    );

    const inProgressMaintenance = React.useMemo(() =>
        maintenanceRequests.filter(req => req.status === 'in_progress'),
        [maintenanceRequests]
    );

    const completedMaintenance = React.useMemo(() =>
        maintenanceRequests.filter(req => req.status === 'completed'),
        [maintenanceRequests]
    );

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    {t('welcome')} {userDisplayName}
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={styles.themeToggle}
                    >
                        <Ionicons
                            name={isDarkMode ? "sunny-outline" : "moon-outline"}
                            size={24}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeLanguage(locale === 'ar' ? 'en' : 'ar')}
                        style={styles.languageButton}
                    >
                        <Text style={styles.languageText}>
                            {locale === 'ar' ? 'EN' : 'عربي'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={theme.colors.icon.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <Card style={[styles.statCard, styles.blueCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="build" size={32} color={theme.colors.icon.blue} />
                        <Title style={styles.statNumber}>{totalMaintenanceRequests}</Title>
                        <Paragraph style={styles.statLabel}>Total Requests</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.yellowCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="time" size={32} color={theme.colors.icon.yellow} />
                        <Title style={styles.statNumber}>{pendingMaintenance.length}</Title>
                        <Paragraph style={styles.statLabel}>Pending</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.blueCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="play" size={32} color={theme.colors.icon.blue} />
                        <Title style={styles.statNumber}>{inProgressMaintenance.length}</Title>
                        <Paragraph style={styles.statLabel}>In Progress</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={[styles.statCard, styles.greenCard]}>
                    <Card.Content style={styles.statContent}>
                        <Ionicons name="checkmark-circle" size={32} color={theme.colors.icon.green} />
                        <Title style={styles.statNumber}>{completedMaintenance.length}</Title>
                        <Paragraph style={styles.statLabel}>Completed</Paragraph>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.quickActions}>
                <Title style={styles.sectionTitle}>Quick Actions</Title>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Maintenance')}
                    style={[styles.actionButton, styles.maintenanceButton]}
                    icon={({ size, color }) => (
                        <Ionicons name="build-outline" size={size} color={color} />
                    )}
                >
                    View All Maintenance
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Invoices')}
                    style={[styles.actionButton, styles.invoiceButton]}
                    icon={({ size, color }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    )}
                >
                    View All Invoices
                </Button>
            </View>
        </ScrollView>
    );
});

export default function DashboardScreen({ navigation }) {
    const { currentUser, logout } = useAuth();
    const { invoices, maintenanceRequests, fetchAllData } = useData();
    const { t, locale, changeLanguage } = useLocalization();
    const { theme, isDarkMode, toggleTheme } = useThemeContext();
    const [refreshing, setRefreshing] = React.useState(false);

    // Use utility functions for safe user type checking
    const userIsResident = isResident(currentUser);
    const userIsAdmin = isAdmin(currentUser);
    const userIsStaff = isStaff(currentUser);

    console.log('DashboardScreen - currentUser:', currentUser);
    console.log('DashboardScreen - userIsResident:', userIsResident);
    console.log('DashboardScreen - userIsAdmin:', userIsAdmin);
    console.log('DashboardScreen - userIsStaff:', userIsStaff);
    console.log('DashboardScreen - invoices.length:', invoices.length);
    console.log('DashboardScreen - maintenanceRequests.length:', maintenanceRequests.length);

    // Force data refresh on dashboard load
    useEffect(() => {
        console.log('DashboardScreen mounted - forcing data refresh');
        fetchAllData();
    }, []);

    const onRefresh = React.useCallback(async () => {
        console.log('Dashboard refresh triggered');
        setRefreshing(true);
        try {
            await fetchAllData();
        } catch (error) {
            console.error('Dashboard refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchAllData]);

    const handleLogout = React.useCallback(() => {
        logout();
    }, [logout]);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const sharedProps = {
        currentUser,
        invoices,
        maintenanceRequests,
        t,
        locale,
        changeLanguage,
        theme,
        isDarkMode,
        toggleTheme,
        refreshing,
        onRefresh,
        handleLogout,
        navigation,
        styles
    };

    // Render different dashboards based on user type
    const renderDashboard = () => {
        if (userIsResident) {
            return <ResidentDashboard {...sharedProps} />;
        } else if (userIsAdmin) {
            return <AdminDashboard {...sharedProps} />;
        } else if (userIsStaff) {
            return <StaffDashboard {...sharedProps} />;
        } else {
            // Fallback for unknown user types
            return <ResidentDashboard {...sharedProps} />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderDashboard()}
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: 16,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    headerActions: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    languageButton: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 12,
    },
    languageText: {
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    logoutButton: {
        padding: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        marginBottom: 16,
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    blueCard: {
        backgroundColor: theme.colors.card.blue,
    },
    greenCard: {
        backgroundColor: theme.colors.card.green,
    },
    yellowCard: {
        backgroundColor: theme.colors.card.yellow,
    },
    redCard: {
        backgroundColor: theme.colors.card.red,
    },
    quickActions: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
        color: theme.colors.text,
    },
    actionButton: {
        marginBottom: 12,
        backgroundColor: theme.colors.button.primary,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    maintenanceButton: {
        backgroundColor: theme.colors.button.maintenance,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceButton: {
        backgroundColor: theme.colors.button.invoice,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    managementButton: {
        marginTop: 16,
        backgroundColor: theme.colors.button.management,
    },
    themeToggle: {
        backgroundColor: theme.colors.surface,
        padding: 8,
        borderRadius: 6,
        marginRight: 12,
    }
});