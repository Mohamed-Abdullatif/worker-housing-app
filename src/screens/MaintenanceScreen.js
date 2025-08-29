// src/screens/MaintenanceScreen.js - FULLY DYNAMIC VERSION
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    FlatList,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, TextInput, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { useData } from '../context/DataContext';

export default function MaintenanceScreen() {
    const { currentUser } = useAuth();
    const {
        maintenanceRequests,
        loading,
        error,
        fetchMaintenanceRequests,
        addMaintenanceRequest,
        updateMaintenanceStatus
    } = useData();
    const { theme } = useThemeContext();
    const { t } = useLocalization();

    const styles = useMemo(() => createStyles(theme), [theme]);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        priority: 'medium'
    });
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch maintenance requests when component mounts
    useEffect(() => {
        console.log('🔧 MaintenanceScreen mounted, fetching requests...');
        if (!loading && maintenanceRequests.length === 0) {
            fetchMaintenanceRequests().catch(err => {
                console.error('Failed to fetch maintenance requests on mount:', err);
            });
        }
    }, []);

    // Filter requests for current user (residents) or show all (admin/staff)
    const userRequests = useMemo(() => {
        if (!currentUser) return [];

        if (currentUser.type === 'resident') {
            return maintenanceRequests.filter(req => req.roomNumber === currentUser.roomNumber);
        }

        // Admin/staff see all requests
        return maintenanceRequests;
    }, [maintenanceRequests, currentUser]);

    const maintenanceTypes = useMemo(() => [
        { value: 'electrical', label: t('maintenance_screen.types.electrical'), icon: 'flash' },
        { value: 'plumbing', label: t('maintenance_screen.types.plumbing'), icon: 'water' },
        { value: 'ac', label: t('maintenance_screen.types.ac'), icon: 'snow' },
        { value: 'cleaning', label: t('maintenance_screen.types.cleaning'), icon: 'brush' },
        { value: 'general', label: t('maintenance_screen.types.general'), icon: 'build' },
        { value: 'other', label: t('maintenance_screen.types.other'), icon: 'ellipsis-horizontal' },
    ], [t]);

    const priorityLevels = useMemo(() => [
        { value: 'low', label: t('maintenance_screen.priority.low'), color: theme.colors.icon.green },
        { value: 'medium', label: t('maintenance_screen.priority.medium'), color: theme.colors.icon.yellow },
        { value: 'high', label: t('maintenance_screen.priority.high'), color: theme.colors.icon.orange },
        { value: 'urgent', label: t('maintenance_screen.priority.urgent'), color: theme.colors.icon.red },
    ], [theme, t]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            console.log('🔄 Refreshing maintenance requests...');
            await fetchMaintenanceRequests();
        } catch (error) {
            console.error('Refresh failed:', error);
            Alert.alert(t('error'), 'Failed to refresh maintenance requests');
        } finally {
            setRefreshing(false);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!formData.type || !formData.description) {
            Alert.alert(t('error'), t('maintenance_screen.fillRequired'));
            return;
        }

        setSubmitting(true);
        try {
            const requestData = {
                type: formData.type,
                description: formData.description,
                priority: formData.priority,
                roomNumber: currentUser.roomNumber,
                residentId: currentUser.id || currentUser._id,
                userId: currentUser.id || currentUser._id,
                userName: currentUser.name
            };

            console.log('🔧 Submitting maintenance request:', requestData);
            await addMaintenanceRequest(requestData);

            // Reset form
            setFormData({
                type: '',
                description: '',
                priority: 'medium'
            });

            Alert.alert(t('success'), t('maintenance_screen.requestSuccess'));
        } catch (error) {
            console.error('Submit maintenance request failed:', error);
            Alert.alert(t('error'), error.message || 'Failed to submit maintenance request');
        } finally {
            setSubmitting(false);
        }
    }, [formData, currentUser, addMaintenanceRequest, t]);

    const handleUpdateStatus = useCallback(async (requestId, newStatus) => {
        try {
            console.log('📝 Updating maintenance status:', { requestId, newStatus });
            await updateMaintenanceStatus(requestId, newStatus, `Status updated to ${newStatus}`);
            Alert.alert(t('success'), 'Maintenance status updated successfully');
        } catch (error) {
            console.error('Update status failed:', error);
            Alert.alert(t('error'), error.message || 'Failed to update status');
        }
    }, [updateMaintenanceStatus, t]);

    const getStatusColor = useCallback((status) => {
        const colors = {
            'pending': theme.colors.icon.yellow,
            'in_progress': theme.colors.icon.blue,
            'completed': theme.colors.icon.green,
            'cancelled': theme.colors.icon.red
        };
        return colors[status] || theme.colors.textSecondary;
    }, [theme]);

    const getStatusLabel = useCallback((status) => {
        return t(`maintenance_screen.status.${status}`);
    }, [t]);

    const renderRequestItem = useCallback(({ item }) => {
        const priorityColor = priorityLevels.find(p => p.value === item.priority)?.color || theme.colors.icon.yellow;
        const statusColor = getStatusColor(item.status);
        const isAdmin = currentUser.type === 'admin' || currentUser.type === 'staff';

        return (
            <View style={styles.cardWrapper}>
                <Card style={styles.requestCard}>
                    <View style={[styles.cardBorder, { backgroundColor: priorityColor }]} />
                    <Card.Content>
                        <View style={styles.cardContent}>
                            <View style={styles.requestHeader}>
                                <View style={styles.typeContainer}>
                                    <Ionicons
                                        name={maintenanceTypes.find(t => t.value === item.type)?.icon || 'build'}
                                        size={24}
                                        color={theme.colors.primary}
                                        style={styles.typeIcon}
                                    />
                                    <Title style={styles.requestType}>
                                        {t(`maintenance_screen.types.${item.type}`)}
                                    </Title>
                                </View>
                                <Chip
                                    style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                                    textStyle={{ color: statusColor, fontWeight: '600' }}
                                >
                                    {getStatusLabel(item.status)}
                                </Chip>
                            </View>

                            <View style={styles.detailsContainer}>
                                <Text style={styles.requestDescription}>
                                    {item.description}
                                </Text>

                                <View style={styles.metaInfo}>
                                    <View style={styles.dateContainer}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={theme.colors.textSecondary}
                                            style={styles.metaIcon}
                                        />
                                        <Text style={styles.requestDate}>
                                            {item.date || item.createdAt || new Date().toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View style={styles.priorityContainer}>
                                        <Ionicons
                                            name="flag-outline"
                                            size={16}
                                            color={priorityColor}
                                            style={styles.metaIcon}
                                        />
                                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                                            {t(`maintenance_screen.priority.${item.priority}`)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Room info for admin view */}
                                {isAdmin && (
                                    <View style={styles.roomInfo}>
                                        <Ionicons
                                            name="home-outline"
                                            size={16}
                                            color={theme.colors.textSecondary}
                                            style={styles.metaIcon}
                                        />
                                        <Text style={styles.roomText}>
                                            Room: {item.roomNumber}
                                        </Text>
                                        {item.userName && (
                                            <Text style={styles.userText}>
                                                - {item.userName}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {/* Admin actions */}
                                {isAdmin && item.status === 'pending' && (
                                    <View style={styles.adminActions}>
                                        <Button
                                            mode="outlined"
                                            onPress={() => handleUpdateStatus(item.id || item._id, 'in_progress')}
                                            style={styles.actionButton}
                                            compact
                                        >
                                            Start Work
                                        </Button>
                                        <Button
                                            mode="contained"
                                            onPress={() => handleUpdateStatus(item.id || item._id, 'completed')}
                                            style={styles.completeButton}
                                            compact
                                        >
                                            Complete
                                        </Button>
                                    </View>
                                )}

                                {isAdmin && item.status === 'in_progress' && (
                                    <View style={styles.adminActions}>
                                        <Button
                                            mode="contained"
                                            onPress={() => handleUpdateStatus(item.id || item._id, 'completed')}
                                            style={styles.completeButton}
                                            compact
                                        >
                                            Mark Complete
                                        </Button>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </View>
        );
    }, [styles, getStatusColor, getStatusLabel, priorityLevels, theme, t, maintenanceTypes, currentUser, handleUpdateStatus]);

    // Loading state
    if (loading && maintenanceRequests.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading maintenance requests...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error && maintenanceRequests.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.icon.red} />
                    <Text style={styles.errorText}>Failed to load maintenance requests</Text>
                    <Text style={styles.errorDetail}>{error}</Text>
                    <Button
                        mode="contained"
                        onPress={handleRefresh}
                        style={styles.retryButton}
                    >
                        Retry
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    const renderContent = useCallback(() => (
        <>
            {/* Create Request Form (only for residents) */}
            {currentUser.type === 'resident' && (
                <Card style={styles.formCard}>
                    <Card.Content>
                        <Title style={styles.formTitle}>{t('maintenance_screen.title')}</Title>

                        <View style={styles.typeButtons}>
                            {maintenanceTypes.map(type => (
                                <Chip
                                    key={type.value}
                                    selected={formData.type === type.value}
                                    onPress={() => setFormData({ ...formData, type: type.value })}
                                    style={[
                                        styles.typeChip,
                                        formData.type === type.value && styles.selectedChip
                                    ]}
                                    icon={() => <Ionicons name={type.icon} size={18} color={formData.type === type.value ? theme.colors.text : theme.colors.textSecondary} />}
                                >
                                    {type.label}
                                </Chip>
                            ))}
                        </View>

                        <TextInput
                            mode="outlined"
                            label={t('maintenance_screen.description')}
                            value={formData.description}
                            onChangeText={text => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            placeholder="Describe the maintenance issue in detail..."
                        />

                        <View style={styles.priorityButtons}>
                            {priorityLevels.map(priority => (
                                <Chip
                                    key={priority.value}
                                    selected={formData.priority === priority.value}
                                    onPress={() => setFormData({ ...formData, priority: priority.value })}
                                    style={[
                                        styles.priorityChip,
                                        formData.priority === priority.value && { backgroundColor: priority.color + '20' }
                                    ]}
                                    textStyle={{ color: priority.color }}
                                >
                                    {priority.label}
                                </Chip>
                            ))}
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={styles.addButton}
                            loading={submitting}
                            disabled={submitting || !formData.type || !formData.description}
                        >
                            {t('maintenance_screen.submit')}
                        </Button>
                    </Card.Content>
                </Card>
            )}

            <Title style={styles.sectionTitle}>
                {currentUser.type === 'resident' ? t('maintenance_screen.previousRequests') : 'All Maintenance Requests'}
                {userRequests.length > 0 && ` (${userRequests.length})`}
            </Title>

            <FlatList
                data={userRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => (item.id || item._id || Math.random()).toString()}
                contentContainerStyle={styles.requestsList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <Ionicons name="construct-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyText}>
                                {currentUser.type === 'resident' ? 'No maintenance requests yet' : 'No maintenance requests found'}
                            </Text>
                            <Button
                                mode="outlined"
                                onPress={handleRefresh}
                                style={styles.refreshButton}
                            >
                                Refresh
                            </Button>
                        </Card.Content>
                    </Card>
                }
            />
        </>
    ), [styles, formData, maintenanceTypes, priorityLevels, handleSubmit, userRequests, renderRequestItem, submitting, refreshing, handleRefresh, currentUser, t]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                data={[1]}
                renderItem={() => renderContent()}
                keyExtractor={() => 'content'}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.text,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.icon.red,
        marginTop: 16,
        textAlign: 'center',
    },
    errorDetail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        flexGrow: 1,
    },
    formCard: {
        marginBottom: 24,
        elevation: 2,
        backgroundColor: theme.colors.surface,
        width: '100%',
        alignSelf: 'center',
    },
    formTitle: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
        color: theme.colors.text,
    },
    typeButtons: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8,
        justifyContent: 'center',
        width: '100%',
    },
    typeChip: {
        marginBottom: 8,
        backgroundColor: theme.colors.surfaceVariant,
    },
    selectedChip: {
        backgroundColor: theme.colors.primary,
    },
    input: {
        marginBottom: 12,
        backgroundColor: theme.colors.surface,
    },
    priorityButtons: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        marginVertical: 16,
        gap: 8,
        justifyContent: 'center',
        width: '100%',
    },
    priorityChip: {
        borderRadius: 8,
        height: 32,
    },
    addButton: {
        marginTop: 8,
        backgroundColor: theme.colors.button.primary,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 16,
        color: theme.colors.text,
    },
    requestsList: {
        paddingBottom: 24,
        flexGrow: 1,
    },
    cardWrapper: {
        marginBottom: 16,
        marginHorizontal: 2,
        borderRadius: 12,
    },
    cardBorder: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    requestCard: {
        elevation: 2,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    cardContent: {
        position: 'relative',
        zIndex: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    typeIcon: {
        marginRight: 8,
    },
    requestType: {
        fontSize: 18,
        color: theme.colors.text,
        fontWeight: '600',
    },
    statusChip: {
        borderRadius: 8,
        height: 32,
    },
    detailsContainer: {
        backgroundColor: theme.colors.surfaceVariant,
        padding: 12,
        borderRadius: 8,
    },
    requestDescription: {
        fontSize: 15,
        color: theme.colors.text,
        marginBottom: 12,
        lineHeight: 20,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: 4,
    },
    requestDate: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '600',
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    userText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    adminActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        flex: 0.45,
        borderColor: theme.colors.primary,
    },
    completeButton: {
        flex: 0.45,
        backgroundColor: theme.colors.button.primary,
    },
    emptyCard: {
        marginTop: 32,
        elevation: 1,
        backgroundColor: theme.colors.surface,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 12,
        textAlign: 'center',
    },
    refreshButton: {
        marginTop: 16,
        borderColor: theme.colors.primary,
    },
});