import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.notificationListener = null;
        this.responseListener = null;
    }

    async init() {
        if (Device.isDevice) {
            await this.registerForPushNotificationsAsync();
            this.setupListeners();
        }
    }

    async registerForPushNotificationsAsync() {
        try {
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return;
            }

            // Check if we already have permission
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // If we don't have permission, ask for it
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            const expoPushToken = await Notifications.getExpoPushTokenAsync({
                projectId: 'worker-housing-app', // Your Expo project ID
            });

            console.log('Push Token:', expoPushToken.data);

            // Store the token
            await AsyncStorage.setItem('pushToken', expoPushToken.data);

            // Store the token for the current user
            if (currentUser?.id) {
                await AsyncStorage.setItem(`pushToken_${currentUser.id}`, expoPushToken.data);
            }

            // Configure for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#2563EB',
                });
            }

            return expoPushToken.data;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    }



    setupListeners() {
        // When a notification is received while the app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(
            notification => {
                const data = notification.request.content.data;
                this.handleNotification(data);
            }
        );

        // When a user taps on a notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
            response => {
                const data = response.notification.request.content.data;
                this.handleNotificationResponse(data);
            }
        );
    }

    handleNotification(data) {
        // Handle different types of notifications
        switch (data.type) {
            case 'maintenance':
                // Handle maintenance notification
                break;
            case 'invoice':
                // Handle invoice notification
                break;
            case 'announcement':
                // Handle announcement notification
                break;
            default:
                break;
        }
    }

    handleNotificationResponse(data) {
        // Handle notification tap based on type
        switch (data.type) {
            case 'maintenance':
                // Navigate to maintenance screen
                break;
            case 'invoice':
                // Navigate to invoice screen
                break;
            case 'announcement':
                // Navigate to announcement screen
                break;
            default:
                break;
        }
    }

    async scheduleLocalNotification({ title, body, data, trigger }) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                    badge: 1,
                },
                trigger,
            });
        } catch (error) {
            console.error('Error scheduling local notification:', error);
        }
    }

    async sendPushNotification(expoPushToken, { title, body, data }) {
        try {
            const message = {
                to: expoPushToken,
                sound: 'default',
                title,
                body,
                data,
                badge: 1,
            };

            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }

    removeListeners() {
        if (this.notificationListener) {
            this.notificationListener.remove();
        }
        if (this.responseListener) {
            this.responseListener.remove();
        }
    }

    // Helper methods for specific notification types
    async notifyMaintenanceRequest(requestData, currentLanguage = 'ar') {
        const title = currentLanguage === 'ar' ? 'طلب صيانة جديد' : 'New Maintenance Request';
        const body = currentLanguage === 'ar'
            ? `تم استلام طلب صيانة جديد للغرفة ${requestData.roomNumber} - ${requestData.type}`
            : `New maintenance request from Room ${requestData.roomNumber} - ${requestData.type}`;
        const data = {
            type: 'maintenance',
            requestId: requestData.id,
            priority: requestData.priority,
            screen: 'maintenance'
        };

        // Schedule local notification for admin/workers
        await this.scheduleLocalNotification({
            title,
            body,
            data,
            trigger: null, // immediate
        });

        // Send to admin and maintenance workers
        const staffTokens = await AsyncStorage.getItem('staffPushTokens');
        if (staffTokens) {
            const tokens = JSON.parse(staffTokens);
            // Send to maintenance staff and admins
            tokens.filter(t => t.role === 'admin' || t.role === 'maintenance')
                .forEach(token => {
                    this.sendPushNotification(token.token, {
                        title,
                        body,
                        data: {
                            ...data,
                            sound: requestData.priority === 'urgent' ? 'urgent.wav' : 'default',
                            priority: requestData.priority === 'urgent' ? 'high' : 'default'
                        }
                    });
                });
        }
    }

    async notifyMaintenanceStatus(requestData) {
        const title = 'تحديث طلب الصيانة';
        const body = `تم تحديث حالة طلب الصيانة الخاص بك إلى ${requestData.status}`;
        const data = { type: 'maintenance', requestId: requestData.id };

        const userToken = await AsyncStorage.getItem(`pushToken_${requestData.userId}`);
        if (userToken) {
            await this.sendPushNotification(userToken, { title, body, data });
        }
    }

    async notifyNewInvoice(invoiceData) {
        const title = 'فاتورة جديدة';
        const body = `تم إصدار فاتورة جديدة بقيمة ${invoiceData.amount} ريال`;
        const data = { type: 'invoice', invoiceId: invoiceData.id };

        const userToken = await AsyncStorage.getItem(`pushToken_${invoiceData.userId}`);
        if (userToken) {
            await this.sendPushNotification(userToken, { title, body, data });
        }
    }

    async notifyPaymentReceived(invoiceData) {
        const title = 'تم استلام الدفع';
        const body = `تم استلام دفع الفاتورة رقم ${invoiceData.id}`;
        const data = { type: 'invoice', invoiceId: invoiceData.id };

        // Notify both user and admin
        const userToken = await AsyncStorage.getItem(`pushToken_${invoiceData.userId}`);
        const adminTokens = await AsyncStorage.getItem('adminPushTokens');

        if (userToken) {
            await this.sendPushNotification(userToken, { title, body, data });
        }

        if (adminTokens) {
            JSON.parse(adminTokens).forEach(token => {
                this.sendPushNotification(token, { title, body, data });
            });
        }
    }

    async notifyGroceryOrder(orderData, currentLanguage = 'ar') {
        const title = currentLanguage === 'ar' ? 'طلب بقالة جديد' : 'New Grocery Order';
        const body = currentLanguage === 'ar'
            ? `طلب جديد من الغرفة ${orderData.roomNumber} - ${orderData.items.length} منتجات`
            : `New order from Room ${orderData.roomNumber} - ${orderData.items.length} items`;
        const data = {
            type: 'grocery',
            orderId: orderData.id,
            screen: 'grocery',
            items: orderData.items.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        };

        // Schedule local notification for admin/workers
        await this.scheduleLocalNotification({
            title,
            body,
            data,
            trigger: null, // immediate
        });

        // Send to admin and grocery workers
        const staffTokens = await AsyncStorage.getItem('staffPushTokens');
        if (staffTokens) {
            const tokens = JSON.parse(staffTokens);
            // Send to grocery staff and admins
            tokens.filter(t => t.role === 'admin' || t.role === 'grocery')
                .forEach(token => {
                    this.sendPushNotification(token.token, { title, body, data });
                });
        }
    }

    async notifyGroceryOrderStatus(orderData, currentLanguage = 'ar') {
        const title = currentLanguage === 'ar' ? 'تحديث حالة الطلب' : 'Order Status Update';
        const body = currentLanguage === 'ar'
            ? `تم تحديث حالة طلبك إلى ${orderData.status}`
            : `Your order status has been updated to ${orderData.status}`;
        const data = {
            type: 'grocery',
            orderId: orderData.id,
            status: orderData.status,
            screen: 'grocery'
        };

        // Send to resident
        const userToken = await AsyncStorage.getItem(`pushToken_${orderData.userId}`);
        if (userToken) {
            await this.sendPushNotification(userToken, { title, body, data });
        }
    }

    async notifyGroceryOrderDelivery(orderData, currentLanguage = 'ar') {
        const title = currentLanguage === 'ar' ? 'تم توصيل طلبك' : 'Order Delivered';
        const body = currentLanguage === 'ar'
            ? 'تم توصيل طلبك بنجاح'
            : 'Your order has been delivered successfully';
        const data = {
            type: 'grocery',
            orderId: orderData.id,
            status: 'delivered',
            screen: 'grocery'
        };

        // Send to resident
        const userToken = await AsyncStorage.getItem(`pushToken_${orderData.userId}`);
        if (userToken) {
            await this.sendPushNotification(userToken, { title, body, data });
        }
    }

    async notifyAnnouncement(announcementData) {
        const title = 'إعلان جديد';
        const body = announcementData.message;
        const data = { type: 'announcement', id: announcementData.id };

        // Get all user tokens
        const allTokens = await AsyncStorage.getItem('allPushTokens');
        if (allTokens) {
            JSON.parse(allTokens).forEach(token => {
                this.sendPushNotification(token, { title, body, data });
            });
        }
    }
}

export default new NotificationService();