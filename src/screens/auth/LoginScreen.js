// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();
    const [username, setUsername] = useState('resident3');
    const [password, setPassword] = useState('resident123');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting login with:', { username });
            const response = await login(username, password);
            console.log('Login successful in LoginScreen:', response);

            // Don't show any success message - just let the navigation happen
            // The login was successful if we reach this point
        } catch (error) {
            console.error('Login error in LoginScreen:', error);

            // Network or server connection errors
            if (!error.response || error.message.includes('Network Error') || error.message.includes('Cannot read property')) {
                Alert.alert(
                    'خطأ في الاتصال',
                    'لا يمكن الاتصال بالخادم. تأكد من:\n\n' +
                    '1. تشغيل خادم API\n' +
                    '2. اتصال الإنترنت يعمل\n' +
                    '3. عنوان الخادم صحيح (localhost:5000)'
                );
                return;
            }

            // Handle specific HTTP status codes
            switch (error.response?.status) {
                case 401:
                    Alert.alert('خطأ في تسجيل الدخول', 'اسم المستخدم أو كلمة المرور غير صحيحة');
                    break;
                case 404:
                    Alert.alert('خطأ في الخادم', 'مسار API غير موجود. تأكد من تكوين الخادم بشكل صحيح');
                    break;
                case 500:
                    Alert.alert('خطأ في الخادم', 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
                    break;
                default:
                    Alert.alert(
                        'خطأ في تسجيل الدخول',
                        error.response?.data?.message || error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
                    );
            }
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (user, pass) => {
        setUsername(user);
        setPassword(pass);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Ionicons name="home" size={64} color="#2563eb" />
                        <Title style={styles.title}>نظام إدارة السكن</Title>
                        <Paragraph style={styles.subtitle}>تسجيل الدخول</Paragraph>
                    </View>

                    <Card style={styles.loginCard}>
                        <Card.Content>
                            <TextInput
                                label="اسم المستخدم"
                                value={username}
                                onChangeText={setUsername}
                                mode="outlined"
                                style={styles.input}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TextInput
                                label="كلمة المرور"
                                value={password}
                                onChangeText={setPassword}
                                mode="outlined"
                                secureTextEntry={!showPassword}
                                style={styles.input}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                style={styles.loginButton}
                                contentStyle={styles.loginButtonContent}
                            >
                                تسجيل الدخول
                            </Button>
                        </Card.Content>
                    </Card>

                    <Card style={styles.demoCard}>
                        <Card.Content>
                            <Title style={styles.demoTitle}>حسابات تجريبية</Title>

                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={() => quickLogin('resident1', 'password123')}
                            >
                                <Text style={styles.demoButtonText}>مقيم - John Doe (R101)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={() => quickLogin('admin1', 'admin123')}
                            >
                                <Text style={styles.demoButtonText}>إدمن - Admin One</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={() => quickLogin('worker1', 'worker123')}
                            >
                                <Text style={styles.demoButtonText}>موظف - Alex Martinez (W201)</Text>
                            </TouchableOpacity>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        minHeight: '100%',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    },
    loginCard: {
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    input: {
        marginBottom: 16,
    },
    loginButton: {
        marginTop: 16,
        backgroundColor: '#2563eb',
    },
    loginButtonContent: {
        paddingVertical: 8,
    },
    demoCard: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    demoTitle: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    demoButton: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    demoButtonText: {
        textAlign: 'center',
        color: '#374151',
        fontWeight: '500',
    },
});