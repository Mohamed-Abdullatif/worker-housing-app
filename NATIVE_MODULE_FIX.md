# 🚀 Fix for Native Module Error in Expo Go

## Problem
Your app uses native modules that are **not supported in Expo Go**:
- `react-native-blob-util`
- `react-native-html-to-pdf` 
- `react-native-push-notification`
- `@react-native-community/push-notification-ios`
- `react-native-pdf`

## Solutions

### Option 1: Create Development Build (Recommended) ✅

This allows you to use all your native modules while keeping Expo's benefits.

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Configure EAS
```bash
eas configure
```

#### Step 3: Create Development Build
```bash
# For iOS
eas build --profile development --platform ios

# For Android  
eas build --profile development --platform android
```

#### Step 4: Install Development Build
- Download and install the generated `.ipa` (iOS) or `.apk` (Android) file
- Use `expo start --dev-client` to run your app

### Option 2: Replace Native Modules with Expo Alternatives

Replace problematic modules with Expo-compatible ones:

#### Replace PDF Generation
```bash
# Remove
npm uninstall react-native-html-to-pdf react-native-blob-util

# Install Expo alternatives
npm install expo-print expo-sharing expo-file-system
```

#### Replace Push Notifications
```bash
# Remove
npm uninstall react-native-push-notification @react-native-community/push-notification-ios

# Use existing expo-notifications (already installed)
```

#### Replace PDF Viewing
```bash
# Remove
npm uninstall react-native-pdf

# Install Expo alternative
npm install expo-document-picker
```

### Option 3: Conditional Loading (Quick Fix)

Wrap native module imports in try-catch blocks:

```javascript
// In PDFService.js
let RNBlobUtil, RNHTMLtoPDF;

try {
  RNBlobUtil = require('react-native-blob-util');
  RNHTMLtoPDF = require('react-native-html-to-pdf');
} catch (error) {
  console.warn('Native modules not available in Expo Go');
}

class PDFService {
  async generateInvoicePDF(invoice) {
    if (!RNHTMLtoPDF) {
      throw new Error('PDF generation not available in Expo Go. Please use development build.');
    }
    // ... rest of the code
  }
}
```

## Recommended Implementation

### 1. Update package.json scripts
```json
{
  "scripts": {
    "start": "expo start",
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build:dev:ios": "eas build --profile development --platform ios",
    "build:dev:android": "eas build --profile development --platform android"
  }
}
```

### 2. Create eas.json configuration
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Update app.json for development builds
```json
{
  "expo": {
    "name": "Worker Housing System",
    "slug": "worker-housing-system",
    "developmentClient": {
      "silentLaunch": true
    }
  }
}
```

## Quick Start Instructions

### For Development Build (Recommended):
1. Run `eas configure` to set up your project
2. Run `eas build --profile development --platform ios` (or android)
3. Install the generated build on your device
4. Run `expo start --dev-client` to start development

### For Expo Go (Limited Features):
1. Comment out or conditionally load native modules
2. Run `expo start` and scan QR code with Expo Go
3. Some features (PDF generation, advanced notifications) won't work

## Benefits of Development Build

✅ **Full Native Module Support**: Use any React Native library
✅ **Expo SDK**: Keep all Expo features and services
✅ **Over-the-Air Updates**: Update JavaScript without rebuilding
✅ **Development Speed**: Fast refresh and debugging tools
✅ **Production Ready**: Same build process for app store deployment

## What Changes After Switching

- **Development**: Use your custom build instead of Expo Go
- **Features**: All native modules work perfectly
- **Debugging**: Same great developer experience
- **Deployment**: Can still use EAS Build for production builds

## Troubleshooting

### Build Fails
- Check that all native dependencies are properly linked
- Ensure iOS/Android minimum versions are compatible
- Run `expo doctor` to check for issues

### Module Not Found
- Clear cache: `expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Rebuild development client

### Push Notifications Not Working
- Ensure proper permissions in app.json
- Test on physical device (not simulator)
- Check Expo push notification credentials
