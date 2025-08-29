import React from 'react';
import { StyleSheet, Dimensions, View, Linking } from 'react-native';
import { ActivityIndicator, Text, Button } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';

// Conditional import for react-native-pdf
let Pdf;
try {
    Pdf = require('react-native-pdf').default;
} catch (error) {
    console.warn('react-native-pdf not available in Expo Go. Using fallback PDF viewer.');
}

const PDFViewer = ({ uri, style }) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const source = React.useMemo(() => {
        console.log('PDF URI:', uri);
        try {
            // For file:// URIs, we need to handle them differently than remote URLs
            if (uri.startsWith('file://')) {
                // Remove file:// prefix and create a clean path
                const path = uri.replace('file://', '');
                return { uri: `file://${path}`, cache: true };
            } else {
                return { uri: encodeURI(uri), cache: true };
            }
        } catch (error) {
            console.error('Error creating PDF source:', error);
            setError('خطأ في تحميل الملف');
            return null;
        }
    }, [uri]);

    const openPDFInBrowser = async () => {
        try {
            if (uri.startsWith('file://')) {
                // For local files, we can't open them in a web browser
                // Show a message to the user
                setError('لا يمكن عرض الملفات المحلية في Expo Go. يرجى استخدام development build.');
            } else {
                // For remote URLs, open in web browser
                await WebBrowser.openBrowserAsync(uri);
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            setError('خطأ في فتح الملف');
        }
    };

    // If native PDF viewer is not available, show fallback UI
    if (!Pdf) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackTitle}>عارض PDF غير متوفر</Text>
                    <Text style={styles.fallbackText}>
                        عارض PDF الأصلي غير متوفر في Expo Go.
                    </Text>
                    <Text style={styles.fallbackSubtext}>
                        يمكنك فتح الملف في المتصفح أو استخدام development build للحصول على تجربة كاملة.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={openPDFInBrowser}
                        style={styles.openButton}
                        disabled={uri.startsWith('file://')}
                    >
                        فتح في المتصفح
                    </Button>
                    {uri.startsWith('file://') && (
                        <Text style={styles.warningText}>
                            الملفات المحلية تحتاج إلى development build لعرضها
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>عذراً، حدث خطأ أثناء تحميل الملف</Text>
                    <Text style={styles.errorDetail}>{error}</Text>
                </View>
            ) : (
                <Pdf
                    source={source}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`PDF loaded: ${numberOfPages} pages, path: ${filePath}`);
                        setIsLoading(false);
                    }}
                    onError={(error) => {
                        console.error('PDF Error:', error);
                        setError(error.toString());
                        setIsLoading(false);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={styles.pdf}
                    enablePaging={true}
                    horizontal={false}
                    spacing={0}
                />
            )}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>جاري تحميل الملف...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f5f5f5',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorDetail: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    fallbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    fallbackText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    fallbackSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    openButton: {
        marginBottom: 15,
        minWidth: 200,
    },
    warningText: {
        fontSize: 12,
        color: '#f57c00',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default PDFViewer;
