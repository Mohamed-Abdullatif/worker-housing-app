// src/localization/translations.js
export const translations = {
    ar: {
        // Common
        cancel: 'إلغاء',
        error: 'خطأ',
        success: 'تم بنجاح',
        close: 'إغلاق',

        // Grocery Screen
        grocery_screen: {
            title: 'البقالة - غرفة',
            categories: {
                all: 'جميع المنتجات',
                food: 'مواد غذائية',
                dairy: 'ألبان',
                fruits: 'فواكه',
                grains: 'حبوب',
                meat: 'لحوم',
                bakery: 'مخبوزات'
            },
            products: {
                rice: 'أرز',
                sugar: 'سكر',
                tea: 'شاي',
                soap: 'صابون',
                milk: 'حليب',
                apples: 'تفاح',
                "chicken breast": 'صدر دجاج',
                bread: 'خبز',
                eggs: 'بيض'
            },
            available: 'متوفر',
            addToCart: 'إضافة للسلة',
            viewCart: 'عرض السلة',
            clearCart: 'إفراغ السلة',
            confirmOrder: 'تأكيد الطلب',
            itemAddedToCart: 'تم إضافة {name} إلى السلة',
            orderConfirmed: 'تم تأكيد الطلب',
            orderConfirmationMessage: 'سيتم توصيل الطلب لغرفتك قريباً',
            outOfStock: 'غير متوفر',
            emptyCart: 'السلة فارغة'
        },

        // Permissions
        permissions: {
            gallery: 'يرجى السماح للتطبيق بالوصول إلى معرض الصور للتمكن من رفع إثبات الدفع',
            camera: 'يرجى السماح للتطبيق بالوصول إلى الكاميرا للتمكن من التقاط صور إثبات الدفع'
        },

        // Auth
        login: 'تسجيل الدخول',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        loginError: 'خطأ في تسجيل الدخول',
        invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        demoAccounts: 'حسابات تجريبية',
        resident: 'مقيم',
        admin: 'إدمن',
        staff: 'موظف',

        // Navigation
        tabs: {
            dashboard: 'الرئيسية',
            grocery: 'البقالة',
            maintenance: 'الصيانة',
            invoices: 'الفواتير',
            management: 'الإدارة',
            profile: 'الملف الشخصي'
        },

        // Dashboard
        welcome: 'مرحباً',
        adminDashboard: 'لوحة تحكم الإدمن',
        roomNumber: 'رقم الغرفة',
        daysStayed: 'يوم إقامة',
        pendingInvoices: 'فواتير معلقة',
        maintenanceRequests: 'طلبات صيانة',
        quickActions: 'إجراءات سريعة',
        orderGrocery: 'طلب من البقالة',
        requestMaintenance: 'طلب صيانة',
        viewInvoices: 'عرض الفواتير',
        totalResidents: 'إجمالي النزلاء',
        revenue: 'الإيرادات',
        pendingMaintenance: 'صيانة معلقة',
        systemManagement: 'إدارة النظام',

        // Maintenance Screen
        maintenance_screen: {
            title: 'طلب صيانة جديد',
            description: 'وصف المشكلة',
            submit: 'إرسال الطلب',
            previousRequests: 'طلبات الصيانة السابقة',
            noRequests: 'لا توجد طلبات صيانة سابقة',
            priority: {
                low: 'منخفضة',
                medium: 'متوسطة',
                high: 'عالية',
                urgent: 'عاجلة'
            },
            types: {
                electrical: 'كهرباء',
                plumbing: 'سباكة',
                ac: 'تكييف',
                cleaning: 'نظافة',
                general: 'صيانة عامة',
                other: 'أخرى'
            },
            status: {
                pending: 'قيد الانتظار',
                in_progress: 'قيد التنفيذ',
                completed: 'مكتمل',
                cancelled: 'ملغي'
            },
            requestSuccess: 'تم إرسال طلب الصيانة بنجاح',
            requestError: 'حدث خطأ أثناء إرسال الطلب',
            selectType: 'اختر نوع الصيانة',
            selectPriority: 'اختر مستوى الأولوية',
            descriptionPlaceholder: 'اكتب وصف المشكلة هنا...',
            descriptions: {
                ac: 'المكيف لا يعمل',
                plumbing: 'تسريب في الحمام',
                electrical: 'مشكلة في الكهرباء',
                cleaning: 'تحتاج الغرفة إلى تنظيف',
                general: 'صيانة عامة مطلوبة',
                other: 'مشكلة أخرى'
            }
        },

        // Payments & Invoices
        payments: {
            uploadProof: 'رفع إثبات الدفع',
            uploadInstructions: 'يرجى رفع صورة إيصال الدفع',
            selectImage: 'اختيار من المعرض',
            takePhoto: 'التقاط صورة',
            notes: 'ملاحظات (اختياري)',
            submit: 'حفظ',
            success: 'تم حفظ إيصال الدفع وتحديث حالة الفاتورة',
            error: 'حدث خطأ أثناء حفظ إيصال الدفع',
            fillRequired: 'يرجى اختيار صورة إيصال الدفع',
            invoiceStatus: {
                paid: 'مدفوعة',
                pending: 'غير مدفوعة'
            },
            invoiceItems: {
                monthlyRent: 'إيجار شهري',
                electricity: 'كهرباء',
                water: 'مياه',
                internet: 'إنترنت'
            },
            invoiceTitle: 'فاتورة غرفة',
            dueDate: 'تاريخ الاستحقاق',
            amount: 'المبلغ',
            details: 'تفاصيل الفاتورة',
            noInvoices: 'لا توجد فواتير',
            downloadPDF: 'تحميل PDF',
            markAsPaid: 'تحديد كمدفوعة',
            statusUpdated: 'تم تحديث حالة الفاتورة إلى مدفوعة',
            viewProof: 'عرض إيصال الدفع',
            close: 'إغلاق',
            room: 'غرفة',
            currency: 'ريال',
            filters: {
                all: 'الكل',
                pending: 'معلقة',
                paid: 'مدفوعة'
            }
        },

        // Status
        status: {
            pending: 'قيد الانتظار',
            in_progress: 'قيد التنفيذ',
            completed: 'مكتمل',
            cancelled: 'ملغي'
        },

        // Settings
        settings: {
            appearance: 'المظهر',
            language: 'اللغة',
            darkMode: 'الوضع الليلي',
            notifications: 'الإشعارات',
            pushNotifications: 'إشعارات التطبيق',
            security: 'الأمان',
            changePassword: 'تغيير كلمة المرور',
            privacyPolicy: 'سياسة الخصوصية',
            logout: 'تسجيل الخروج',
            changingLanguage: 'جاري تغيير اللغة',
            pleaseWait: 'برجاء الانتظار...'
        }
    },
    en: {
        // Common
        cancel: 'Cancel',
        error: 'Error',
        success: 'Success',
        close: 'Close',

        // Grocery Screen
        grocery_screen: {
            title: 'Grocery - Room',
            categories: {
                all: 'All Products',
                food: 'Food Items',
                dairy: 'Dairy',
                fruits: 'Fruits',
                grains: 'Grains',
                meat: 'Meat',
                bakery: 'Bakery'
            },
            products: {
                rice: 'Rice',
                sugar: 'Sugar',
                tea: 'Tea',
                soap: 'Soap',
                milk: 'Milk',
                apples: 'Apples',
                "chicken breast": 'Chicken Breast',
                bread: 'Bread',
                eggs: 'Eggs'
            },
            available: 'Available',
            addToCart: 'Add to Cart',
            viewCart: 'View Cart',
            clearCart: 'Clear Cart',
            confirmOrder: 'Confirm Order',
            itemAddedToCart: '{name} has been added to cart',
            orderConfirmed: 'Order Confirmed',
            orderConfirmationMessage: 'Your order will be delivered to your room soon',
            outOfStock: 'Out of Stock',
            emptyCart: 'Cart is empty'
        },

        // Permissions
        permissions: {
            gallery: 'Please allow access to your photo gallery to upload payment proof',
            camera: 'Please allow access to your camera to take photos of payment proof'
        },

        // Auth
        login: 'Login',
        username: 'Username',
        password: 'Password',
        loginError: 'Login Error',
        invalidCredentials: 'Invalid username or password',
        demoAccounts: 'Demo Accounts',
        resident: 'Resident',
        admin: 'Admin',
        staff: 'Staff',

        // Navigation
        tabs: {
            dashboard: 'Dashboard',
            grocery: 'Grocery',
            maintenance: 'Maintenance',
            invoices: 'Invoices',
            management: 'Management',
            profile: 'Profile'
        },

        // Dashboard
        welcome: 'Welcome',
        adminDashboard: 'Admin Dashboard',
        roomNumber: 'Room Number',
        daysStayed: 'Days Stayed',
        pendingInvoices: 'Pending Invoices',
        maintenanceRequests: 'Maintenance Requests',
        quickActions: 'Quick Actions',
        orderGrocery: 'Order Grocery',
        requestMaintenance: 'Request Maintenance',
        viewInvoices: 'View Invoices',
        totalResidents: 'Total Residents',
        revenue: 'Revenue',
        pendingMaintenance: 'Pending Maintenance',
        systemManagement: 'System Management',

        // Maintenance Screen
        maintenance_screen: {
            title: 'New Maintenance Request',
            description: 'Problem Description',
            submit: 'Submit Request',
            previousRequests: 'Previous Requests',
            noRequests: 'No maintenance requests found',
            priority: {
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                urgent: 'Urgent'
            },
            types: {
                electrical: 'Electrical',
                plumbing: 'Plumbing',
                ac: 'Air Conditioning',
                cleaning: 'Cleaning',
                general: 'General Maintenance',
                other: 'Other'
            },
            status: {
                pending: 'Pending',
                in_progress: 'In Progress',
                completed: 'Completed',
                cancelled: 'Cancelled'
            },
            requestSuccess: 'Maintenance request submitted successfully',
            requestError: 'Error submitting maintenance request',
            selectType: 'Select maintenance type',
            selectPriority: 'Select priority level',
            descriptionPlaceholder: 'Describe your problem here...',
            descriptions: {
                ac: 'AC not working',
                plumbing: 'Bathroom leak',
                electrical: 'Electrical issue',
                cleaning: 'Room needs cleaning',
                general: 'General maintenance needed',
                other: 'Other issue'
            }
        },

        // Payments & Invoices
        payments: {
            uploadProof: 'Upload Payment Receipt',
            uploadInstructions: 'Please upload a photo of your payment receipt',
            selectImage: 'Choose from Gallery',
            takePhoto: 'Take Photo',
            notes: 'Notes (optional)',
            submit: 'Save',
            success: 'Payment receipt saved and invoice status updated',
            error: 'Error saving payment receipt',
            fillRequired: 'Please select a payment receipt image',
            invoiceStatus: {
                paid: 'Paid',
                pending: 'Unpaid'
            },
            invoiceItems: {
                monthlyRent: 'Monthly Rent',
                electricity: 'Electricity',
                water: 'Water',
                internet: 'Internet'
            },
            invoiceTitle: 'Room Invoice',
            dueDate: 'Due Date',
            amount: 'Amount',
            details: 'Invoice Details',
            noInvoices: 'No invoices found',
            downloadPDF: 'Download PDF',
            markAsPaid: 'Mark as Paid',
            statusUpdated: 'Invoice status updated to paid',
            viewProof: 'View Payment Receipt',
            close: 'Close',
            room: 'Room',
            currency: 'SAR',
            filters: {
                all: 'All',
                pending: 'Pending',
                paid: 'Paid'
            }
        },

        // Status
        status: {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },

        // Settings
        settings: {
            appearance: 'Appearance',
            language: 'Language',
            darkMode: 'Dark Mode',
            notifications: 'Notifications',
            pushNotifications: 'Push Notifications',
            security: 'Security',
            changePassword: 'Change Password',
            privacyPolicy: 'Privacy Policy',
            logout: 'Logout',
            changingLanguage: 'Changing Language',
            pleaseWait: 'Please wait...'
        }
    }
};