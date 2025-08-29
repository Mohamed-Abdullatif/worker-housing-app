import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { ActivityIndicator, Text } from 'react-native-paper';

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
});

export default PDFViewer;
