// src/screens/InvoicesScreen.js - FULLY DYNAMIC VERSION
import React, { useState, useMemo, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    Modal,
    TouchableOpacity,
    Image,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Button, Chip, SegmentedButtons, TextInput, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useLocalization } from '../context/LocalizationContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PDFService from '../services/PDFService';
import PDFViewer from '../components/PDFViewer';

export default function InvoicesScreen() {
    const { currentUser } = useAuth();
    const {
        invoices,
        loading,
        error,
        fetchInvoices,
        updateInvoiceStatus,
        fetchAllData
    } = useData();
    const { theme } = useThemeContext();
    const { t } = useLocalization();

    const [statusFilter, setStatusFilter] = useState('all');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentProof, setPaymentProof] = useState({ image: null, notes: '' });
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [selectedPdfUri, setSelectedPdfUri] = useState(null);
    const [viewProofModalVisible, setViewProofModalVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);

    const styles = useMemo(() => createStyles(theme, currentUser?.language === 'ar'), [theme, currentUser?.language]);

    // Fetch invoices when component mounts
    useEffect(() => {
        console.log('📄 InvoicesScreen mounted, fetching invoices...');
        if (!loading) {
            console.log('Current state:', { loading, invoicesCount: invoices.length, currentUser });
            fetchInvoices()
                .then(data => {
                    console.log('Fetched invoices successfully:', data);
                })
                .catch(err => {
                    console.error('Failed to fetch invoices on mount:', err);
                    setError(err.message || 'Failed to fetch invoices');
                });
        }
    }, [currentUser]);

    // Filter invoices for current user or show all for admin
    const userInvoices = useMemo(() => {
        if (!currentUser) return [];

        return currentUser.type === 'resident'
            ? invoices.filter(inv => inv.roomNumber === currentUser.roomNumber)
            : invoices;
    }, [invoices, currentUser]);

    const filteredInvoices = useMemo(() => {
        return statusFilter === 'all'
            ? userInvoices
            : userInvoices.filter(inv => inv.status === statusFilter);
    }, [userInvoices, statusFilter]);

    const filterOptions = [
        { value: 'all', label: t('payments.filters.all') },
        { value: 'pending', label: t('payments.filters.pending') },
        { value: 'paid', label: t('payments.filters.paid') },
    ];

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            console.log('🔄 Refreshing invoices...');
            await fetchInvoices();
        } catch (error) {
            console.error('Refresh failed:', error);
            Alert.alert(t('error'), 'Failed to refresh invoices');
        } finally {
            setRefreshing(false);
        }
    };

    const handleGeneratePDF = async (invoice) => {
        try {
            Alert.alert('جارِ التحميل', 'يرجى الانتظار...');
            const filePath = await PDFService.generateInvoicePDF(invoice);
            console.log('Generated PDF at:', filePath);
            const encodedPath = encodeURI(`file://${filePath}`);
            setSelectedPdfUri(encodedPath);
            setPdfModalVisible(true);
        } catch (error) {
            console.error('Error handling PDF:', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء معالجة الفاتورة');
        }
    };

    const handleMarkAsPaid = async (invoice) => {
        setUpdating(true);
        try {
            console.log('💰 Marking invoice as paid:', invoice.id);
            await updateInvoiceStatus(invoice.id || invoice._id, 'paid');
            Alert.alert(t('success'), t('payments.statusUpdated'));
        } catch (error) {
            console.error('Mark as paid failed:', error);
            Alert.alert(t('error'), error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleViewPaymentProof = (invoice) => {
        setSelectedProof(invoice.paymentProof);
        setViewProofModalVisible(true);
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('error'), t('permissions.gallery'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                selectionLimit: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setPaymentProof(prev => ({
                    ...prev,
                    image: selectedImage.uri,
                    imageType: selectedImage.type || 'image/jpeg',
                    imageSize: selectedImage.fileSize || 0,
                }));
                Alert.alert(t('success'), 'تم اختيار الصورة');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(t('error'), t('payments.error'));
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('error'), t('permissions.camera'));
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const capturedImage = result.assets[0];
                setPaymentProof(prev => ({
                    ...prev,
                    image: capturedImage.uri,
                    imageType: capturedImage.type || 'image/jpeg',
                    imageSize: capturedImage.fileSize || 0,
                }));
                Alert.alert(t('success'), 'تم التقاط الصورة');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert(t('error'), t('payments.error'));
        }
    };

    const handleUploadPaymentProof = (invoice) => {
        setSelectedInvoice(invoice);
        setUploadModalVisible(true);
    };

    const handleSubmitPaymentProof = async () => {
        if (!paymentProof.image) {
            Alert.alert(t('error'), t('payments.uploadInstructions'));
            return;
        }

        setUpdating(true);
        try {
            console.log('📤 Submitting payment proof for invoice:', selectedInvoice.id);
            await updateInvoiceStatus(selectedInvoice.id || selectedInvoice._id, 'paid', {
                image: paymentProof.image,
                notes: paymentProof.notes || ''
            });

            setUploadModalVisible(false);
            setSelectedInvoice(null);
            setPaymentProof({ image: null, notes: '' });
            Alert.alert(t('success'), t('payments.success'));
        } catch (error) {
            console.error('Submit payment proof failed:', error);
            Alert.alert(t('error'), error.message);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'paid': theme.colors.icon.green,
            'pending': theme.colors.icon.red,
            'overdue': theme.colors.icon.red
        };
        return colors[status] || theme.colors.textSecondary;
    };

    const getStatusLabel = (status) => {
        return t(`payments.invoiceStatus.${status}`);
    };

    const renderInvoiceItem = ({ item }) => {
        const canMarkAsPaid = (currentUser.type === 'admin' || currentUser.type === 'staff') && item.status === 'pending';

        return (
            <Card style={styles.invoiceCard}>
                <Card.Content>
                    <View style={styles.invoiceHeader}>
                        <View style={styles.invoiceInfo}>
                            <Title style={styles.invoiceTitle}>
                                {item.invoiceNumber}
                            </Title>
                            <Text style={styles.invoiceMonth}>{item.description}</Text>
                            <Text style={styles.invoiceType}>{item.type}</Text>
                            {item.dueDate && (
                                <Text style={styles.dueDate}>
                                    {t('payments.dueDate')}: {new Date(item.dueDate).toLocaleDateString()}
                                </Text>
                            )}
                        </View>

                        <View style={styles.amountSection}>
                            <Text style={styles.amount}>{item.amount?.toLocaleString() || 0} {t('payments.currency')}</Text>
                            <Chip
                                style={[
                                    styles.statusChip,
                                    { backgroundColor: getStatusColor(item.status) + '20' }
                                ]}
                                textStyle={{
                                    color: getStatusColor(item.status),
                                    fontWeight: 'bold',
                                    fontSize: 14,
                                    textAlign: 'center',
                                    lineHeight: 20,
                                    includeFontPadding: false,
                                    textAlignVertical: 'center',
                                }}
                            >
                                {getStatusLabel(item.status)}
                            </Chip>
                        </View>
                    </View>

                    <View style={styles.itemsSection}>
                        <Text style={styles.itemsTitle}>{t('payments.details')}:</Text>
                        {(item.items || ['monthlyRent', 'electricity', 'water', 'internet']).map((itemKey, index) => (
                            <View key={index} style={styles.itemRow}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.colors.icon.green} />
                                <Text style={styles.itemText}>
                                    {t(`payments.invoiceItems.${itemKey}`) || itemKey}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.actionButtons}>
                        <Button
                            mode="outlined"
                            onPress={() => handleGeneratePDF(item)}
                            style={styles.pdfButton}
                            icon="download"
                            contentStyle={styles.buttonContent}
                        >
                            {t('payments.downloadPDF')}
                        </Button>

                        {item.status === 'paid' && item.paymentProof ? (
                            <Button
                                mode="outlined"
                                onPress={() => handleViewPaymentProof(item)}
                                style={styles.viewProofButton}
                                icon="image"
                                contentStyle={styles.buttonContent}
                            >
                                {t('payments.viewProof')}
                            </Button>
                        ) : (
                            <>
                                {canMarkAsPaid && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handleMarkAsPaid(item)}
                                        style={styles.payButton}
                                        icon="cash"
                                        contentStyle={styles.buttonContent}
                                        loading={updating}
                                        disabled={updating}
                                    >
                                        {t('payments.markAsPaid')}
                                    </Button>
                                )}
                                {currentUser.type === 'resident' && item.status === 'pending' && (
                                    <Button
                                        mode="contained"
                                        onPress={() => handleUploadPaymentProof(item)}
                                        style={styles.uploadButton}
                                        icon="upload"
                                        contentStyle={styles.buttonContent}
                                    >
                                        {t('payments.uploadProof')}
                                    </Button>
                                )}
                            </>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    // Loading state
    if (loading && invoices.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading invoices...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error && invoices.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.icon.red} />
                    <Text style={styles.errorText}>Failed to load invoices</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {t('tabs.invoices')} {currentUser.type === 'resident' && `- ${t('payments.room')} ${currentUser.roomNumber}`}
                </Text>

                <SegmentedButtons
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    buttons={filterOptions}
                    style={styles.filterButtons}
                />
            </View>

            <FlatList
                data={filteredInvoices}
                keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
                renderItem={renderInvoiceItem}
                contentContainerStyle={styles.listContainer}
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
                            <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyText}>
                                {statusFilter === 'all' ? 'No invoices found' : `No ${statusFilter} invoices`}
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

            {/* Upload Payment Proof Modal */}
            <Portal>
                <Dialog
                    visible={uploadModalVisible}
                    onDismiss={() => setUploadModalVisible(false)}
                    style={styles.uploadModal}
                >
                    <Dialog.Title>{t('payments.uploadProof')}</Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.uploadSection}>
                            {paymentProof.image ? (
                                <View style={styles.imagePreview}>
                                    <Image source={{ uri: paymentProof.image }} style={styles.previewImage} />
                                    <View style={styles.imageActions}>
                                        <TouchableOpacity
                                            onPress={() => setPaymentProof(prev => ({ ...prev, image: null }))}
                                            style={styles.removeButton}
                                        >
                                            <Ionicons name="close-circle" size={28} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.uploadOptions}>
                                    <Text style={styles.uploadInstructions}>
                                        {t('payments.uploadInstructions')}
                                    </Text>
                                    <View style={styles.imageButtons}>
                                        <Button
                                            mode="outlined"
                                            onPress={pickImage}
                                            style={styles.imageButton}
                                            icon="image"
                                            contentStyle={styles.buttonContent}
                                        >
                                            {t('payments.selectImage')}
                                        </Button>
                                        <View style={styles.buttonSpacer} />
                                        <Button
                                            mode="outlined"
                                            onPress={takePhoto}
                                            style={styles.imageButton}
                                            icon="camera"
                                            contentStyle={styles.buttonContent}
                                        >
                                            {t('payments.takePhoto')}
                                        </Button>
                                    </View>
                                </View>
                            )}
                        </View>

                        <TextInput
                            mode="outlined"
                            label={t('payments.notes')}
                            value={paymentProof.notes}
                            onChangeText={text => setPaymentProof(prev => ({ ...prev, notes: text }))}
                            multiline
                            numberOfLines={3}
                            style={[styles.input, { marginTop: 16 }]}
                            placeholder={t('payments.notes')}
                        />
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <Button
                            onPress={() => setUploadModalVisible(false)}
                            style={styles.cancelButton}
                            mode="outlined"
                            disabled={updating}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onPress={handleSubmitPaymentProof}
                            mode="contained"
                            disabled={!paymentProof.image || updating}
                            style={styles.saveButton}
                            loading={updating}
                        >
                            {t('payments.submit')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* PDF Modal */}
            <Portal>
                <Modal
                    visible={pdfModalVisible}
                    onDismiss={() => setPdfModalVisible(false)}
                    style={styles.pdfModal}
                    contentContainerStyle={styles.pdfContainer}
                >
                    <View style={styles.pdfHeader}>
                        <Button
                            icon="close"
                            onPress={() => {
                                setPdfModalVisible(false);
                                setSelectedPdfUri(null);
                            }}
                            style={styles.closeButton}
                            mode="contained"
                        >
                            إغلاق
                        </Button>
                    </View>
                    <View style={styles.pdfContent}>
                        {selectedPdfUri && (
                            <PDFViewer uri={selectedPdfUri} style={styles.pdfViewer} />
                        )}
                    </View>
                </Modal>
            </Portal>

            {/* View Payment Proof Modal */}
            <Portal>
                <Dialog
                    visible={viewProofModalVisible}
                    onDismiss={() => {
                        setViewProofModalVisible(false);
                        setSelectedProof(null);
                    }}
                    style={styles.proofModal}
                >
                    <Dialog.Title>{t('payments.viewProof')}</Dialog.Title>
                    <Dialog.Content>
                        {selectedProof && (
                            <View style={styles.proofContent}>
                                <Image
                                    source={{ uri: selectedProof.image }}
                                    style={styles.proofImage}
                                    resizeMode="contain"
                                />
                                {selectedProof.notes && (
                                    <View style={styles.proofNotes}>
                                        <Text style={styles.proofNotesLabel}>{t('payments.notes')}:</Text>
                                        <Text style={styles.proofNotesText}>{selectedProof.notes}</Text>
                                    </View>
                                )}
                                <Text style={styles.proofDate}>
                                    {new Date(selectedProof.date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => {
                                setViewProofModalVisible(false);
                                setSelectedProof(null);
                            }}
                        >
                            {t('close')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const createStyles = (theme, isRTL) => StyleSheet.create({
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
    header: {
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: isRTL ? 'right' : 'left',
        color: theme.colors.text,
        width: '100%',
    },
    filterButtons: {
        marginBottom: 8,
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    invoiceCard: {
        marginBottom: 16,
        elevation: 2,
        backgroundColor: theme.colors.surface,
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    invoiceInfo: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    invoiceTitle: {
        fontSize: 16,
        marginBottom: 4,
        color: theme.colors.text,
        textAlign: isRTL ? 'right' : 'left',
        width: '100%',
    },
    invoiceMonth: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 2,
        textAlign: isRTL ? 'right' : 'left',
        width: '100%',
    },
    invoiceType: {
        fontSize: 12,
        color: theme.colors.primary,
        marginBottom: 2,
        textAlign: isRTL ? 'right' : 'left',
        width: '100%',
        textTransform: 'capitalize',
    },
    dueDate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: isRTL ? 'right' : 'left',
        width: '100%',
    },
    amountSection: {
        alignItems: isRTL ? 'flex-start' : 'flex-end',
        minHeight: 80,
        justifyContent: 'space-between',
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: isRTL ? 'right' : 'left',
    },
    statusChip: {
        minHeight: 36,
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },
    itemsSection: {
        marginBottom: 16,
        width: '100%',
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.colors.text,
        textAlign: isRTL ? 'right' : 'left',
        width: '100%',
    },
    itemRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        marginBottom: 4,
        width: '100%',
        justifyContent: isRTL ? 'flex-start' : 'flex-start',
    },
    itemText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: isRTL ? 0 : 8,
        marginRight: isRTL ? 8 : 0,
        textAlign: isRTL ? 'right' : 'left',
    },
    actionButtons: {
        flexDirection: 'column',
        gap: 12,
        marginTop: 16,
    },
    pdfButton: {
        borderColor: theme.colors.primary,
        borderRadius: 12,
        height: 48,
        width: '100%',
    },
    payButton: {
        backgroundColor: theme.colors.button.primary,
        borderRadius: 12,
        height: 48,
        width: '100%',
    },
    uploadButton: {
        backgroundColor: theme.colors.button.primary,
        borderRadius: 12,
        height: 48,
        width: '100%',
    },
    viewProofButton: {
        borderColor: theme.colors.primary,
        borderRadius: 12,
        height: 48,
        width: '100%',
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
    uploadModal: {
        backgroundColor: theme.colors.surface,
        padding: 24,
        maxHeight: '90%',
        borderRadius: 20,
        marginHorizontal: 16,
        elevation: 0,
        borderWidth: 0,
    },
    uploadSection: {
        marginVertical: 16,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        overflow: 'hidden',
    },
    uploadOptions: {
        padding: 16,
        alignItems: 'center',
    },
    uploadInstructions: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    imagePreview: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'contain',
    },
    imageActions: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
    },
    removeButton: {
        padding: 4,
    },
    imageButtons: {
        flexDirection: 'column',
        width: '100%',
        gap: 12,
    },
    imageButton: {
        width: '100%',
        borderColor: theme.colors.primary,
        height: 48,
        borderRadius: 12,
    },
    buttonContent: {
        height: '100%',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    input: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    dialogActions: {
        marginTop: 24,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 0,
        paddingBottom: 8,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
        borderColor: theme.colors.primary,
    },
    saveButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: theme.colors.primary,
    },
    pdfModal: {
        margin: 0,
        justifyContent: 'flex-end',
        position: 'relative',
    },
    pdfContainer: {
        backgroundColor: theme.colors.surface,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
    pdfHeader: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    pdfContent: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    pdfViewer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    closeButton: {
        margin: 0,
    },
    proofModal: {
        backgroundColor: theme.colors.surface,
        padding: 24,
        maxHeight: '90%',
        borderRadius: 20,
        marginHorizontal: 16,
    },
    proofContent: {
        alignItems: 'center',
    },
    proofImage: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 16,
    },
    proofNotes: {
        width: '100%',
        padding: 16,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        marginBottom: 16,
    },
    proofNotesLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: theme.colors.text,
    },
    proofNotesText: {
        fontSize: 14,
        color: theme.colors.text,
    },
    proofDate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});