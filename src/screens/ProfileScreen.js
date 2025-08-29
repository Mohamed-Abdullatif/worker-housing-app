// src/screens/ProfileScreen.js
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    List,
    Switch,
    Divider,
    Avatar,
    Text,
    Button,
    Card,
    ActivityIndicator,
    Portal,
    Modal,
    TextInput,
} from 'react-native-paper';
import { useThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import {
    getUserData,
    getUserDisplayName,
    getUserRoomNumber,
    getUserContactNumber,
    getUserId,
    getInitials,
    formatUserForDisplay,
    formatPhoneNumber,
    formatDateShort,
    getDaysStayed,
    isAdmin,
    isStaff,
    isResident
} from '../utils';
import apiService from '../services/api.service';

export default function ProfileScreen() {
    const { currentUser, logout } = useAuth();
    const { t, locale, changeLanguage, isLoading: localizationLoading } = useLocalization();
    const { theme, isDarkMode, toggleTheme } = useThemeContext();

    // Local state
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        contactNumber: '',
        username: ''
    });
    const [updating, setUpdating] = useState(false);

    const styles = useMemo(() => createStyles(theme), [theme]);

    // Safely get user data using utility functions
    const user = getUserData(currentUser);
    const userId = getUserId(currentUser);
    const userDisplayName = getUserDisplayName(currentUser);
    const userRoomNumber = getUserRoomNumber(currentUser);
    const userContactNumber = getUserContactNumber(currentUser);
    const userType = user?.type || 'resident';
    const daysStayed = getDaysStayed(user);

    console.log('ProfileScreen - currentUser:', currentUser);
    console.log('ProfileScreen - user:', user);
    console.log('ProfileScreen - userDisplayName:', userDisplayName);

    // Load user profile data
    useEffect(() => {
        if (user && userId) {
            loadUserProfile();
        }
    }, [user, userId]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get updated user profile from API
            const response = await apiService.getCurrentUser();
            console.log('Profile API response:', response);

            const profileData = response.data?.user || response.user || response;
            setUserProfile(profileData);

            // Initialize edit form with current data
            setEditForm({
                name: profileData.name || userDisplayName || '',
                contactNumber: profileData.contactNumber || userContactNumber || '',
                username: profileData.username || user?.username || ''
            });

        } catch (error) {
            console.error('Error loading user profile:', error);
            setError('Failed to load profile data');

            // Fallback to current user data
            setUserProfile(user);
            setEditForm({
                name: userDisplayName || '',
                contactNumber: userContactNumber || '',
                username: user?.username || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUserProfile();
        setRefreshing(false);
    }, []);

    const handleLogout = useCallback(async () => {
        Alert.alert(
            t('settings.logout'),
            'Are you sure you want to logout?',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('settings.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    }, [logout, t]);

    const toggleLanguage = useCallback(() => {
        changeLanguage(locale === 'ar' ? 'en' : 'ar');
    }, [locale, changeLanguage]);

    const handleThemeToggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    const handleEditProfile = useCallback(() => {
        setEditModalVisible(true);
    }, []);

    const handleSaveProfile = useCallback(async () => {
        try {
            setUpdating(true);

            // Validate required fields
            if (!editForm.name.trim()) {
                Alert.alert(t('error'), 'Name is required');
                return;
            }

            // In a real app, you would call an API to update the profile
            // For now, we'll simulate it
            const updatedProfile = {
                ...userProfile,
                name: editForm.name.trim(),
                contactNumber: editForm.contactNumber.trim(),
                username: editForm.username.trim()
            };

            setUserProfile(updatedProfile);
            setEditModalVisible(false);
            Alert.alert(t('success'), 'Profile updated successfully');

        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert(t('error'), 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    }, [editForm, userProfile, t]);

    const handleChangePassword = useCallback(() => {
        Alert.alert(
            t('settings.changePassword'),
            'This feature will be available soon',
            [{ text: 'OK' }]
        );
    }, [t]);

    const handlePrivacyPolicy = useCallback(() => {
        Alert.alert(
            t('settings.privacyPolicy'),
            'Privacy policy content will be shown here',
            [{ text: 'OK' }]
        );
    }, [t]);

    // Safe initials generation
    const userInitials = useMemo(() => {
        const displayName = userProfile?.name || userDisplayName || 'User';
        return getInitials(displayName);
    }, [userProfile?.name, userDisplayName]);

    // Format user type for display
    const getUserTypeLabel = useCallback((type) => {
        switch (type) {
            case 'admin':
                return t('admin');
            case 'staff':
                return t('staff');
            case 'resident':
                return t('resident');
            default:
                return type;
        }
    }, [t]);

    // Show loading screen while fetching profile
    if (loading && !userProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (error && !userProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.icon.red} />
                    <Text style={styles.errorText}>Failed to load profile</Text>
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

    const displayProfile = userProfile || user || {};

    return (
        <SafeAreaView style={styles.container}>
            <Portal>
                <Modal visible={localizationLoading} dismissable={false} contentContainerStyle={styles.loadingModal}>
                    <ActivityIndicator animating={true} size={48} color={theme.colors.primary} />
                    <Text style={styles.loadingText}>{t('settings.changingLanguage')}</Text>
                    <Text style={styles.loadingSubText}>{t('settings.pleaseWait')}</Text>
                </Modal>
            </Portal>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Profile Header */}
                <Card style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <Avatar.Text
                            size={80}
                            label={userInitials}
                            style={styles.avatar}
                            color="#fff"
                            backgroundColor={theme.colors.primary}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>
                                {displayProfile.name || userDisplayName || 'Unknown User'}
                            </Text>
                            <Text style={styles.role}>
                                {getUserTypeLabel(displayProfile.type || userType)}
                            </Text>
                            {(isResident(currentUser) || displayProfile.type === 'resident') && (
                                <Text style={styles.roomInfo}>
                                    {t('roomNumber')}: {displayProfile.roomNumber || userRoomNumber}
                                </Text>
                            )}
                            {displayProfile.contactNumber && (
                                <Text style={styles.contactInfo}>
                                    {formatPhoneNumber(displayProfile.contactNumber)}
                                </Text>
                            )}
                        </View>
                        <Button
                            mode="outlined"
                            onPress={handleEditProfile}
                            style={styles.editButton}
                            compact
                        >
                            Edit
                        </Button>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.additionalInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>
                                Username: {displayProfile.username || user?.username || 'N/A'}
                            </Text>
                        </View>

                        {(isResident(currentUser) || displayProfile.type === 'resident') && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                                <Text style={styles.infoText}>
                                    Days Stayed: {daysStayed}
                                </Text>
                            </View>
                        )}

                        {displayProfile.createdAt && (
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                                <Text style={styles.infoText}>
                                    Member Since: {formatDateShort(displayProfile.createdAt)}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Settings List */}
                <List.Section>
                    <List.Subheader>{t('settings.appearance')}</List.Subheader>

                    <List.Item
                        title={t('settings.language')}
                        description={locale === 'ar' ? 'العربية' : 'English'}
                        left={props => <List.Icon {...props} icon="translate" />}
                        right={props => (
                            <Button
                                mode="text"
                                onPress={toggleLanguage}
                                labelStyle={styles.switchButton}
                            >
                                {locale === 'ar' ? 'EN' : 'عربي'}
                            </Button>
                        )}
                    />

                    <List.Item
                        title={t('settings.darkMode')}
                        left={props => <List.Icon {...props} icon={isDarkMode ? "weather-night" : "white-balance-sunny"} />}
                        right={props => <Switch value={isDarkMode} onValueChange={handleThemeToggle} />}
                    />

                    <Divider />

                    <List.Subheader>{t('settings.notifications')}</List.Subheader>
                    <List.Item
                        title={t('settings.pushNotifications')}
                        left={props => <List.Icon {...props} icon="bell-outline" />}
                        right={props => <Switch value={true} />}
                    />

                    <Divider />

                    <List.Subheader>{t('settings.security')}</List.Subheader>
                    <List.Item
                        title={t('settings.changePassword')}
                        left={props => <List.Icon {...props} icon="lock-outline" />}
                        onPress={handleChangePassword}
                    />

                    <List.Item
                        title={t('settings.privacyPolicy')}
                        left={props => <List.Icon {...props} icon="shield-outline" />}
                        onPress={handlePrivacyPolicy}
                    />

                    <Divider />

                    <List.Item
                        title={t('settings.logout')}
                        left={props => <List.Icon {...props} icon="logout" color={theme.colors.icon.red} />}
                        onPress={handleLogout}
                        titleStyle={{ color: theme.colors.icon.red }}
                    />
                </List.Section>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Portal>
                <Modal
                    visible={editModalVisible}
                    onDismiss={() => setEditModalVisible(false)}
                    contentContainerStyle={styles.editModal}
                >
                    <Text style={styles.modalTitle}>Edit Profile</Text>

                    <TextInput
                        mode="outlined"
                        label="Full Name"
                        value={editForm.name}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                        style={styles.input}
                    />

                    <TextInput
                        mode="outlined"
                        label="Contact Number"
                        value={editForm.contactNumber}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, contactNumber: text }))}
                        style={styles.input}
                        keyboardType="phone-pad"
                    />

                    <TextInput
                        mode="outlined"
                        label="Username"
                        value={editForm.username}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
                        style={styles.input}
                        autoCapitalize="none"
                    />

                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setEditModalVisible(false)}
                            style={styles.cancelButton}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSaveProfile}
                            style={styles.saveButton}
                            loading={updating}
                            disabled={updating}
                        >
                            Save
                        </Button>
                    </View>
                </Modal>
            </Portal>
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
    profileCard: {
        margin: 16,
        elevation: 2,
        backgroundColor: theme.colors.surface,
    },
    profileHeader: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    roomInfo: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    contactInfo: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    editButton: {
        borderColor: theme.colors.primary,
    },
    additionalInfo: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        marginTop: 8,
        paddingTop: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 8,
    },
    switchButton: {
        fontSize: 14,
        color: theme.colors.primary,
    },
    versionContainer: {
        padding: 16,
        alignItems: 'center',
    },
    versionText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    loadingModal: {
        backgroundColor: theme.colors.surface,
        padding: 32,
        margin: 40,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    loadingSubText: {
        color: theme.colors.textSecondary,
        marginTop: 8,
        fontSize: 14,
    },
    editModal: {
        backgroundColor: theme.colors.surface,
        padding: 24,
        margin: 20,
        borderRadius: 16,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 0.45,
        borderColor: theme.colors.primary,
    },
    saveButton: {
        flex: 0.45,
        backgroundColor: theme.colors.primary,
    },
});