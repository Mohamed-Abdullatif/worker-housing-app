// src/services/NotificationConfig.js
export const notifications = {
    // Maintenance notifications
    maintenanceRequestReceived: (roomNumber, type) => ({
        title: 'طلب صيانة جديد',
        body: `تم استلام طلب صيانة ${type} من غرفة ${roomNumber}`,
        data: { type: 'maintenance', roomNumber, maintenanceType: type }
    }),

    urgentMaintenance: (roomNumber, type) => ({
        title: '🚨 طلب صيانة عاجل',
        body: `طلب صيانة عاجل: ${type} في غرفة ${roomNumber}`,
        data: { type: 'maintenance', roomNumber, maintenanceType: type, priority: 'urgent' }
    }),

    maintenanceStatusUpdate: (status, type) => {
        const statusText = {
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتملة',
            'cancelled': 'ملغية'
        }[status] || status;

        return {
            title: 'تحديث حالة الصيانة',
            body: `تم تحديث حالة طلب صيانة ${type} إلى ${statusText}`,
            data: { type: 'maintenance_update', status, maintenanceType: type }
        };
    },

    // Invoice notifications
    newInvoice: (roomNumber, amount) => ({
        title: 'فاتورة جديدة',
        body: `تم إصدار فاتورة جديدة لغرفة ${roomNumber} بقيمة ${amount} ريال`,
        data: { type: 'invoice', roomNumber, amount }
    }),

    invoiceDueReminder: (amount, dueDate) => ({
        title: 'تذكير بموعد الفاتورة',
        body: `تذكير: فاتورة بقيمة ${amount} ريال مستحقة في ${dueDate}`,
        data: { type: 'invoice_reminder', amount, dueDate }
    }),

    invoiceOverdue: (amount, daysPastDue) => ({
        title: 'فاتورة متأخرة',
        body: `لديك فاتورة متأخرة بقيمة ${amount} ريال منذ ${daysPastDue} يوم`,
        data: { type: 'invoice_overdue', amount, daysPastDue }
    }),

    paymentConfirmed: (roomNumber, amount) => ({
        title: 'تأكيد الدفع',
        body: `تم تأكيد دفع فاتورة غرفة ${roomNumber} بقيمة ${amount} ريال`,
        data: { type: 'payment_confirmed', roomNumber, amount }
    }),

    // Order notifications
    orderConfirmed: (itemCount, total) => ({
        title: 'تأكيد الطلب',
        body: `تم تأكيد طلبك (${itemCount} عناصر) بقيمة ${total} ريال`,
        data: { type: 'order_confirmed', itemCount, total }
    }),

    orderDelivered: (roomNumber) => ({
        title: 'تم توصيل الطلب',
        body: `تم توصيل طلبك إلى غرفة ${roomNumber}`,
        data: { type: 'order_delivered', roomNumber }
    }),

    // System notifications
    systemMaintenance: (date, duration) => ({
        title: 'صيانة النظام',
        body: `سيتم إجراء صيانة للنظام في ${date} لمدة ${duration}`,
        data: { type: 'system_maintenance', date, duration }
    }),

    announcement: (title, message) => ({
        title: `إعلان: ${title}`,
        body: message,
        data: { type: 'announcement', title }
    })
};
