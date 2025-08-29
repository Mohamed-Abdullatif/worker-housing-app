// src/screens/ManagementScreen.js - FULLY DYNAMIC VERSION
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, TextInput, Button, SegmentedButtons, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useThemeContext } from '../context/ThemeContext';

export default function ManagementScreen() {
    const { users, addUser, removeUser } = useAuth();
    const {
        maintenanceRequests,
        invoices,
        users: dataUsers,
        loading,
        error,
        fetchUsers,
        updateMaintenanceStatus,
        fetchAllData
    } = useData();
    const { theme } = useThemeContext();

    const [activeSection, setActiveSection] = useState('residents');
    const [newUserForm, setNewUserForm] = useState({
        roomNumber: '',
        name: '',
        days: '30',
        contactNumber: ''
    });
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch data when component mounts
    useEffect(() => {
        console.log('👑 ManagementScreen mounted, fetching data...');
        if (!loading) {
            fetchAllData().catch(err => {
                console.error('Failed to fetch management data:', err);
            });
        }
    }, []);

    // Combine users from auth and data contexts
    const allUsers = React.useMemo(() => {
        const authUsers = users || [];
        const dataContextUsers = dataUsers || [];

        // Merge and deduplicate users
        const userMap = new Map();

        authUsers.forEach(user => {
            userMap.set(user.id || user._id, user);
        });

        dataContextUsers.forEach(user => {
            userMap.set(user.id || user._id, user);
        });

        return Array.from(userMap.values());
    }, [users, dataUsers]);

    const residents = React.useMemo(() =>
        allUsers.filter(u => u.type === 'resident'),
        [allUsers]
    );

    const pendingMaintenance = React.useMemo(() =>
        maintenanceRequests.filter(req => req.status === 'pending'),
        [maintenanceRequests]
    );

    const sectionOptions = [
        { value: 'residents', label: 'النزلاء' },
        { value: 'maintenance', label: 'الصيانة' },
        { value: 'analytics', label: 'التقارير' },
    ];

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            console.log('🔄 Refreshing management data...');
            await fetchAllData();
        } catch (error) {
            console.error('Refresh failed:', error);
            Alert.alert('خطأ', 'فشل في تحديث البيانات');
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddResident = async () => {
        if (!newUserForm.roomNumber || !newUserForm.name) {
            Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة');
            return;
        }

        setSubmitting(true);
        try {
            console.log('👤 Adding new resident:', newUserForm);
            const newUser = await addUser({
                ...newUserForm,
                days: parseInt(newUserForm.days) || 30
            });

            setNewUserForm({
                roomNumber: '',
                name: '',
                days: '30',
                contactNumber: ''
            });

            Alert.alert(
                'تم الإضافة بنجاح',
                `تم إضافة النزيل ${newUser.name}\nاسم المستخدم: ${newUser.username}\nكلمة المرور: password123`
            );
        } catch (error) {
            console.error('Add resident failed:', error);
            Alert.alert('خطأ', error.message || 'فشل في إضافة النزيل');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckout = (resident) => {
        Alert.alert(
            'تأكيد تسجيل الخروج',
            `هل أنت متأكد من تسجيل خروج ${resident.name} من غرفة ${resident.roomNumber}؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تأكيد',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeUser(resident.id || resident._id);
                            Alert.alert('تم', 'تم تسجيل خروج النزيل بنجاح');
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل في تسجيل خروج النزيل');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateMaintenanceStatus = async (requestId, status) => {
        try {
            console.log('📝 Updating maintenance status from management:', { requestId, status });
            await updateMaintenanceStatus(requestId, status, `Status updated to ${status} by admin`);
            Alert.alert('تم التحديث', 'تم تحديث حالة طلب الصيانة');
        } catch (error) {
            console.error('Update maintenance status failed:', error);
            Alert.alert('خطأ', error.message || 'فشل في تحديث حالة الصيانة');
        }
    };

    const renderResident = ({ item }) => {
        const getDaysStayed = () => {
            if (!item.checkInDate && !item.startDate) return 0;

            const checkIn = new Date(item.checkInDate || item.startDate);
            const today = new Date();
            const diffTime = Math.abs(today - checkIn);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        return (
            <Card style={styles.residentCard}>
                <Card.Content>
                    <View style={styles.residentHeader}>
                        <View style={styles.residentInfo}>
                            <Title style={styles.residentName}>{item.name}</Title>
                            <Text style={styles.residentRoom}>غرفة {item.roomNumber}</Text>
                            <Text style={styles.residentDate}>
                                {getDaysStayed()} يوم منذ {item.checkInDate || item.startDate || 'Unknown'}
                            </Text>
                            <Text style={styles.username}>المستخدم: {item.username}</Text>
                            {item.contactNumber && (
                                <Text style={styles.contact}>الهاتف: {item.contactNumber}</Text>
                            )}
                        </View>

                        <View style={styles.residentActions}>
                            <Chip
                                style={[styles.statusChip, { backgroundColor: item.active ? '#dcfce7' : '#fee2e2' }]}
                                textStyle={{ color: item.active ? '#16a34a' : '#dc2626' }}
                            >
                                {item.active ? 'نشط' : 'غير نشط'}
                            </Chip>
                            <Button
                                mode="contained"
                                onPress={() => handleCheckout(item)}
                                style={styles.checkoutButton}
                                compact
                                icon="logout"
                            >
                                خروج
                            </Button>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    const renderMaintenanceRequest = ({ item }) => (
        <Card style={styles.maintenanceCard}>
            <Card.Content>
                <View style={styles.maintenanceHeader}>
                    <Title style={styles.maintenanceTitle}>
                        غرفة {item.roomNumber} - {item.type}
                    </Title>
                    <Chip
                        style={[styles.statusChip, { backgroundColor: '#ca8a04' + '20' }]}
                        textStyle={{ color: '#ca8a04' }}
                    >
                        معلق
                    </Chip>
                </View>

                <Text style={styles.maintenanceDescription}>{item.description}</Text>
                <Text style={styles.maintenanceDate}>
                    {item.date || item.createdAt || new Date().toLocaleDateString()}
                </Text>
                {item.userName && (
                    <Text style={styles.maintenanceUser}>المستخدم: {item.userName}</Text>
                )}

                <View style={styles.maintenanceActions}>
                    <Button
                        mode="outlined"
                        onPress={() => handleUpdateMaintenanceStatus(item.id || item._id, 'in_progress')}
                        style={styles.actionButton}
                        compact
                    >
                        بدء العمل
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() => handleUpdateMaintenanceStatus(item.id || item._id, 'completed')}
                        style={styles.completeButton}
                        compact
                    >
                        إنجاز
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    const renderContent = () => {
        // Loading state
        if (loading && activeSection !== 'residents') {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading {activeSection}...</Text>
                </View>
            );
        }

        switch (activeSection) {
            case 'residents':
                return (
                    <ScrollView
                        style={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                    >
                        {/* Add Resident Form */}
                        <Card style={styles.formCard}>
                            <Card.Content>
                                <Title style={styles.formTitle}>إضافة نزيل جديد</Title>

                                <TextInput
                                    label="رقم الغرفة *"
                                    value={newUserForm.roomNumber}
                                    onChangeText={(text) => setNewUserForm({ ...newUserForm, roomNumber: text })}
                                    mode="outlined"
                                    style={styles.input}
                                />

                                <TextInput
                                    label="اسم النزيل *"
                                    value={newUserForm.name}
                                    onChangeText={(text) => setNewUserForm({ ...newUserForm, name: text })}
                                    mode="outlined"
                                    style={styles.input}
                                />

                                <TextInput
                                    label="عدد الأيام"
                                    value={newUserForm.days}
                                    onChangeText={(text) => setNewUserForm({ ...newUserForm, days: text })}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    style={styles.input}
                                />

                                <TextInput
                                    label="رقم الهاتف"
                                    value={newUserForm.contactNumber}
                                    onChangeText={(text) => setNewUserForm({ ...newUserForm, contactNumber: text })}
                                    mode="outlined"
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                />

                                <Button
                                    mode="contained"
                                    onPress={handleAddResident}
                                    style={styles.addButton}
                                    icon="account-plus"
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    إضافة نزيل
                                </Button>
                            </Card.Content>
                        </Card>

                        {/* Residents List */}
                        <Title style={styles.sectionTitle}>
                            النزلاء الحاليون ({residents.length})
                        </Title>

                        {residents.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={styles.emptyContent}>
                                    <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyText}>لا يوجد نزلاء حالياً</Text>
                                </Card.Content>
                            </Card>
                        ) : (
                            <FlatList
                                data={residents}
                                keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
                                renderItem={renderResident}
                                scrollEnabled={false}
                                nestedScrollEnabled
                            />
                        )}
                    </ScrollView>
                );

            case 'maintenance':
                return (
                    <ScrollView
                        style={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                    >
                        <Title style={styles.sectionTitle}>
                            طلبات الصيانة المعلقة ({pendingMaintenance.length})
                        </Title>

                        {pendingMaintenance.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={styles.emptyContent}>
                                    <Ionicons name="construct-outline" size={48} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyText}>لا توجد طلبات صيانة معلقة</Text>
                                </Card.Content>
                            </Card>
                        ) : (
                            <FlatList
                                data={pendingMaintenance}
                                keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
                                renderItem={renderMaintenanceRequest}
                                scrollEnabled={false}
                                nestedScrollEnabled
                            />
                        )}
                    </ScrollView>
                );

            case 'analytics':
                return (
                    <ScrollView
                        style={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                    >
                        <View style={styles.analyticsGrid}>
                            <Card style={[styles.analyticsCard, styles.blueCard]}>
                                <Card.Content style={styles.analyticsContent}>
                                    <Ionicons name="people" size={32} color="#2563eb" />
                                    <Title style={styles.analyticsNumber}>{residents.length}</Title>
                                    <Text style={styles.analyticsLabel}>إجمالي النزلاء</Text>
                                </Card.Content>
                            </Card>

                            <Card style={[styles.analyticsCard, styles.greenCard]}>
                                <Card.Content style={styles.analyticsContent}>
                                    <Ionicons name="cash" size={32} color="#16a34a" />
                                    <Title style={styles.analyticsNumber}>
                                        {invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0)}
                                    </Title>
                                    <Text style={styles.analyticsLabel}>الإيرادات (ج)</Text>
                                </Card.Content>
                            </Card>

                            <Card style={[styles.analyticsCard, styles.yellowCard]}>
                                <Card.Content style={styles.analyticsContent}>
                                    <Ionicons name="warning" size={32} color="#ca8a04" />
                                    <Title style={styles.analyticsNumber}>
                                        {invoices.filter(inv => inv.status === 'pending').length}
                                    </Title>
                                    <Text style={styles.analyticsLabel}>فواتير معلقة</Text>
                                </Card.Content>
                            </Card>

                            <Card style={[styles.analyticsCard, styles.redCard]}>
                                <Card.Content style={styles.analyticsContent}>
                                    <Ionicons name="construct" size={32} color="#dc2626" />
                                    <Title style={styles.analyticsNumber}>{pendingMaintenance.length}</Title>
                                    <Text style={styles.analyticsLabel}>صيانة معلقة</Text>
                                </Card.Content>
                            </Card>
                        </View>
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>إدارة النظام</Text>

                <SegmentedButtons
                    value={activeSection}
                    onValueChange={setActiveSection}
                    buttons={sectionOptions}
                    style={styles.sectionButtons}
                />
            </View>

            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#374151',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionButtons: {
        marginBottom: 8,
    },
    scrollContent: {
        flex: 1,
        padding: 16,
    },
    formCard: {
        marginBottom: 24,
        elevation: 2,
    },
    formTitle: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
    },
    addButton: {
        marginTop: 8,
        backgroundColor: '#16a34a',
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    emptyCard: {
        marginTop: 16,
        elevation: 1,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
        textAlign: 'center',
    },
    residentCard: {
        marginBottom: 12,
        elevation: 1,
    },
    residentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    residentInfo: {
        flex: 1,
    },
    residentName: {
        fontSize: 16,
        marginBottom: 4,
    },
    residentRoom: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    residentDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    username: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    contact: {
        fontSize: 12,
        color: '#6b7280',
    },
    residentActions: {
        alignItems: 'flex-end',
    },
    statusChip: {
        marginBottom: 8,
    },
    checkoutButton: {
        backgroundColor: '#dc2626',
    },
    maintenanceCard: {
        marginBottom: 12,
        elevation: 1,
    },
    maintenanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    maintenanceTitle: {
        fontSize: 14,
        flex: 1,
    },
    maintenanceDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    maintenanceDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    maintenanceUser: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    maintenanceActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 0.45,
    },
    completeButton: {
        flex: 0.45,
        backgroundColor: '#16a34a',
    },
    analyticsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    analyticsCard: {
        width: '48%',
        marginBottom: 16,
        elevation: 2,
    },
    analyticsContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    analyticsNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    analyticsLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    blueCard: {
        backgroundColor: '#dbeafe',
    },
    greenCard: {
        backgroundColor: '#dcfce7',
    },
    yellowCard: {
        backgroundColor: '#fef3c7',
    },
    redCard: {
        backgroundColor: '#fee2e2',
    },
});