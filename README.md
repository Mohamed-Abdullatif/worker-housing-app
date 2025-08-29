# Worker Housing App

A comprehensive React Native application for managing worker housing facilities, built with Expo. This app provides a complete solution for residents, staff, and administrators to manage accommodation services, maintenance requests, invoices, and grocery orders.

## 🏠 Overview

The Worker Housing App is designed to streamline the management of worker accommodation facilities. It offers different interfaces for residents, staff, and administrators, each tailored to their specific needs and responsibilities.

### Key Features

- **Multi-Role Support**: Separate dashboards for residents, staff, and administrators
- **Bilingual Support**: Full Arabic and English localization
- **Real-time Notifications**: Push notifications for important updates
- **Invoice Management**: Digital invoicing with payment proof uploads
- **Maintenance Requests**: Easy submission and tracking of maintenance issues
- **Grocery Ordering**: In-app grocery ordering system with cart functionality
- **PDF Generation**: Automated PDF generation for invoices and reports
- **Dark Mode**: Theme switching support
- **Offline Support**: Local data caching and synchronization

## 📱 User Roles

### 🏠 Residents
- View personal dashboard with room information and statistics
- Submit maintenance requests with priority levels and descriptions
- View and pay invoices with payment proof uploads
- Order groceries from the integrated store
- Track order and request statuses
- Receive push notifications for updates

### 👨‍💼 Staff
- Monitor all maintenance requests across the facility
- Update maintenance request statuses and add notes
- View maintenance statistics and analytics
- Manage resident requests and communications

### 👨‍💻 Administrators
- Complete system management and oversight
- User management (add/remove residents and staff)
- Financial oversight with revenue tracking
- System-wide analytics and reporting
- Invoice generation and management
- Grocery inventory management
- Push notification management

## 🛠 Technology Stack

### Frontend
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (~53.0.20) - Development platform and build tools
- **React Navigation** (6.1.9) - Navigation library
- **React Native Paper** (5.14.5) - Material Design components
- **Axios** (1.11.0) - HTTP client for API calls
- **React Native Vector Icons** (10.3.0) - Icon library

### State Management & Context
- **React Context API** - Global state management
- **AsyncStorage** - Local data persistence
- **Custom Hooks** - Reusable logic components

### Features & Services
- **Expo Notifications** - Push notification system
- **Expo Image Picker** - Image selection and camera access
- **React Native PDF** - PDF viewing and generation
- **React Native Reanimated** - Smooth animations
- **Reactotron** - Development debugging tool

### Development Tools
- **Babel** - JavaScript compiler
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Metro** - React Native bundler

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (16.x or higher)
- **pnpm** (Package manager)
- **Expo CLI** (@expo/cli)
- **React Native development environment**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WorkerHousingApp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   API_BASE_URL=http://your-api-server.com/api
   
   # Firebase Configuration
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   
   # Firebase Admin (for backend)
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_CERT_URL=your-cert-url
   ```

4. **Start the development server**
   ```bash
   pnpm start
   ```

5. **Run on specific platforms**
   ```bash
   # Android
   pnpm android
   
   # iOS
   pnpm ios
   
   # Web
   pnpm web
   ```

## 📱 Demo Accounts

The app includes demo accounts for testing different user roles:

### Resident Account
- **Username**: `resident_101`
- **Password**: `password123`
- **Room**: 101

### Staff Account
- **Username**: `staff_maintenance`
- **Password**: `password123`
- **Role**: Maintenance Staff

### Admin Account
- **Username**: `admin`
- **Password**: `password123`
- **Role**: System Administrator

## 🏗 Project Structure

```
WorkerHousingApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── PDFViewer.js    # PDF viewing component
│   ├── config/             # Configuration files
│   │   └── ReactotronConfig.js
│   ├── context/            # React Context providers
│   │   ├── AuthContext.js  # Authentication state
│   │   ├── CartContext.js  # Shopping cart state
│   │   ├── DataContext.js  # App data state
│   │   ├── LocalizationContext.js # Language/locale
│   │   └── ThemeContext.js # Theme management
│   ├── localization/       # Translation files
│   │   └── translations.js # Arabic/English translations
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainTabNavigator.js
│   ├── screens/           # App screens
│   │   ├── auth/         # Authentication screens
│   │   ├── DashboardScreen.js
│   │   ├── GroceryScreen.js
│   │   ├── InvoicesScreen.js
│   │   ├── MaintenanceScreen.js
│   │   ├── ManagementScreen.js
│   │   └── ProfileScreen.js
│   ├── services/         # External services
│   │   ├── api.service.js    # API client
│   │   ├── firebase.config.js
│   │   ├── NotificationService.js
│   │   ├── PDFService.js
│   │   └── smtp.config.js
│   ├── styles/           # Theme and styling
│   │   └── theme.js
│   └── utils/            # Utility functions
│       ├── dateUtils.js
│       ├── formatUtils.js
│       ├── userUtils.js
│       └── validationUtils.js
├── android/              # Android-specific files
├── ios/                 # iOS-specific files
├── assets/              # App assets (icons, images)
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Key Features Explained

### Authentication System
- JWT-based authentication with token refresh
- Role-based access control (RBAC)
- Secure token storage using AsyncStorage
- Automatic logout on token expiration

### Dashboard System
- **Resident Dashboard**: Personal statistics, quick actions, room info
- **Staff Dashboard**: Maintenance request overview and management
- **Admin Dashboard**: System-wide analytics and management tools

### Maintenance Management
- Priority-based request system (Low, Medium, High, Urgent)
- Category-based classification (Electrical, Plumbing, AC, etc.)
- Status tracking (Pending, In Progress, Completed, Cancelled)
- Image attachments for maintenance issues
- Real-time status updates

### Invoice System
- Automated invoice generation
- Multiple payment methods support
- Payment proof upload with image capture
- PDF invoice generation and download
- Status tracking (Pending, Paid)

### Grocery System
- Category-based product browsing
- Shopping cart functionality
- Order confirmation and tracking
- Inventory management (admin)
- Real-time stock updates

### Notification System
- Push notifications using Expo Notifications
- Custom notification channels
- Arabic/English notification support
- Priority-based notification urgency
- In-app notification management

### Localization
- Complete Arabic and English support
- RTL (Right-to-Left) layout support
- Dynamic language switching
- Localized date and currency formatting

## 🎨 Theming

The app supports both light and dark themes with:
- Dynamic theme switching
- Consistent color schemes
- Material Design principles
- Accessible color contrasts
- Custom theme configurations

## 📊 API Integration

The app integrates with a RESTful API backend providing:
- User authentication and management
- Maintenance request CRUD operations
- Invoice generation and management
- Grocery inventory and ordering
- File upload and management
- Push notification delivery
- Analytics and reporting

### API Endpoints Structure
```
/api
├── /auth              # Authentication
├── /users            # User management
├── /maintenance      # Maintenance requests
├── /invoices         # Invoice management
├── /grocery          # Grocery system
├── /notifications    # Push notifications
├── /pdf              # PDF generation
└── /analytics        # Analytics and reports
```

## 🔒 Security Features

- JWT token-based authentication
- Secure API communication (HTTPS)
- Input validation and sanitization
- File upload security measures
- Role-based access control
- Secure local storage encryption

## 📱 Platform Support

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Permissions: Camera, Storage, Notifications

### iOS
- Minimum iOS: 13.0
- Permissions: Camera, Photo Library, Notifications
- App Store compliance ready

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📦 Building for Production

### Android
```bash
# Build APK
expo build:android

# Build AAB (recommended for Play Store)
expo build:android --type app-bundle
```

### iOS
```bash
# Build for App Store
expo build:ios

# Build for ad-hoc distribution
expo build:ios --type adhoc
```

## 🚀 Deployment

### Using Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit
```

## 🔧 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS pod installation issues**
   ```bash
   cd ios && pod install
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

4. **Notification permissions**
   - Ensure proper permissions are requested in app.json
   - Check device notification settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React Native best practices
- Maintain consistent code formatting
- Add proper error handling
- Include appropriate comments
- Test on both platforms
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Multi-role authentication system
- Maintenance request management
- Invoice and payment system
- Grocery ordering functionality
- Push notification support
- Bilingual support (Arabic/English)
- Dark mode support

## 🎯 Future Enhancements

- [ ] Offline mode improvements
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Chat system for maintenance requests
- [ ] Biometric authentication
- [ ] Advanced reporting features
- [ ] Multi-facility support
- [ ] Integration with IoT devices

---

**Built with ❤️ using React Native and Expo**
