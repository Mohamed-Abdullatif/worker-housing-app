// src/screens/GroceryScreen.js
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button, Chip, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useLocalization } from '../context/LocalizationContext';

export default function GroceryScreen() {
    const { groceryItems } = useData();
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemsCount } = useCart();
    const { currentUser } = useAuth();
    const { addOrder } = useData();
    const { theme } = useThemeContext();
    const { t } = useLocalization();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCart, setShowCart] = useState(false);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const categories = useMemo(() => [
        { key: 'all', label: t('grocery_screen.categories.all') },
        { key: 'food', label: t('grocery_screen.categories.food') },
        { key: 'dairy', label: t('grocery_screen.categories.dairy') },
        { key: 'fruits', label: t('grocery_screen.categories.fruits') },
        { key: 'grains', label: t('grocery_screen.categories.grains') },
        { key: 'meat', label: t('grocery_screen.categories.meat') },
        { key: 'bakery', label: t('grocery_screen.categories.bakery') },
    ], [t]);

    const filteredItems = useMemo(() => {
        console.log('Filtering items:', {
            selectedCategory,
            totalItems: groceryItems.length,
            categories: groceryItems.map(item => item.category)
        });
        if (selectedCategory === 'all') {
            return groceryItems;
        }
        return groceryItems.filter(item =>
            item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
        );
    }, [groceryItems, selectedCategory]);

    const handleAddToCart = (item) => {
        addToCart(item);
        Alert.alert(t('success'), t('grocery_screen.itemAddedToCart', { name: t(`grocery_screen.products.${item.name.toLowerCase()}`) }));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        const order = {
            roomNumber: currentUser.data?.roomNumber,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            total: getCartTotal(),
            status: 'pending'
        };

        await addOrder(order);
        clearCart();
        setShowCart(false);
        Alert.alert(t('grocery_screen.orderConfirmed'), t('grocery_screen.orderConfirmationMessage'));
    };

    const renderProductItem = ({ item }) => (
        <Card style={styles.productCard}>
            <Card.Content>
                <View style={styles.productHeader}>
                    <Ionicons name="cube-outline" size={32} color={theme.colors.icon.default} />
                    <Chip mode="outlined" style={styles.categoryChip}>
                        {t(`grocery_screen.categories.${item.category.toLowerCase()}`)}
                    </Chip>
                </View>

                <Title style={styles.productName}>{t(`grocery_screen.products.${item.name.toLowerCase()}`)}</Title>

                <View style={styles.productFooter}>
                    <Text style={styles.price}>{item.price} {t('payments.currency')}</Text>
                    <Chip
                        style={[
                            styles.stockChip,
                            item.stock > 10 ? styles.inStock :
                                item.stock > 0 ? styles.lowStock : styles.outOfStock
                        ]}
                        textStyle={styles.stockText}
                    >
                        {item.stock > 0 ? `${t('grocery_screen.available')} (${item.stock})` : t('grocery_screen.outOfStock')}
                    </Chip>
                </View>

                <Button
                    mode="contained"
                    onPress={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    style={[styles.addButton, item.stock === 0 && styles.disabledButton]}
                    icon="cart-plus"
                >
                    {t('grocery_screen.addToCart')}
                </Button>
            </Card.Content>
        </Card>
    );

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{t(`grocery_screen.products.${item.name.toLowerCase()}`)}</Text>
                <Text style={styles.cartItemPrice}>{item.price} {t('payments.currency')} × {item.quantity}</Text>
            </View>

            <View style={styles.quantityControls}>
                <TouchableOpacity
                    onPress={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                    style={styles.quantityButton}
                >
                    <Ionicons name="remove" size={20} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                    onPress={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                >
                    <Ionicons name="add" size={20} color={theme.colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => removeFromCart(item._id || item.id)}
                    style={styles.removeButton}
                >
                    <Ionicons name="trash" size={20} color={theme.colors.icon.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('grocery_screen.title')} {currentUser.data?.roomNumber}</Text>
            </View>

            {/* Categories */}
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <Chip
                        mode={selectedCategory === item.key ? 'flat' : 'outlined'}
                        selected={selectedCategory === item.key}
                        onPress={() => setSelectedCategory(item.key)}
                        style={styles.categoryFilterChip}
                    >
                        {item.label}
                    </Chip>
                )}
                contentContainerStyle={styles.categoriesContainer}
            />

            {/* Products */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => (item._id || item.id || '').toString()}
                renderItem={renderProductItem}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.productsContainer}
            />

            {/* Cart FAB */}
            <FAB
                style={styles.fab}
                icon="cart"
                label={getCartItemsCount() > 0 ? getCartItemsCount().toString() : undefined}
                onPress={() => setShowCart(true)}
            />

            {/* Cart Modal */}
            <Modal
                visible={showCart}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.cartModal}>
                    <View style={styles.cartHeader}>
                        <Text style={styles.cartTitle}>{t('grocery_screen.viewCart')} ({cart.length})</Text>
                        <TouchableOpacity onPress={() => setShowCart(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {cart.length === 0 ? (
                        <View style={styles.emptyCart}>
                            <Ionicons name="cart-outline" size={64} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyCartText}>{t('grocery_screen.emptyCart')}</Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={cart}
                                keyExtractor={(item) => (item._id || item.id || '').toString()}
                                renderItem={renderCartItem}
                                style={styles.cartList}
                            />

                            <View style={styles.cartFooter}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalText}>{t('payments.amount')}: {getCartTotal()} {t('payments.currency')}</Text>
                                </View>

                                <View style={styles.cartActions}>
                                    <Button
                                        mode="outlined"
                                        onPress={clearCart}
                                        style={styles.clearButton}
                                    >
                                        {t('grocery_screen.clearCart')}
                                    </Button>

                                    <Button
                                        mode="contained"
                                        onPress={handleCheckout}
                                        style={styles.checkoutButton}
                                    >
                                        {t('grocery_screen.confirmOrder')}
                                    </Button>
                                </View>
                            </View>
                        </>
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme.colors.text,
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    categoryFilterChip: {
        marginRight: 8,
        height: 36,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.chip.background,
    },
    productsContainer: {
        padding: 16,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        marginBottom: 16,
        elevation: 2,
        minHeight: 200,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryChip: {
        height: 32,
        paddingHorizontal: 8,
        backgroundColor: theme.colors.surfaceVariant,
    },
    productName: {
        fontSize: 16,
        marginBottom: 8,
        color: theme.colors.text,
    },
    productFooter: {
        marginBottom: 12,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    stockChip: {
        alignSelf: 'flex-start',
        minHeight: 32,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    stockText: {
        fontSize: 12,
        color: theme.colors.text,
        lineHeight: 16,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    inStock: {
        backgroundColor: theme.colors.card.green,
    },
    lowStock: {
        backgroundColor: theme.colors.card.yellow,
    },
    outOfStock: {
        backgroundColor: theme.colors.card.red,
    },
    addButton: {
        backgroundColor: theme.colors.button.primary,
        height: 40,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: theme.colors.button.default,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.button.primary,
    },
    cartModal: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCartText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    cartList: {
        flex: 1,
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        color: theme.colors.text,
    },
    cartItemPrice: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 24,
        textAlign: 'center',
        color: theme.colors.text,
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.card.red,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    cartFooter: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    totalContainer: {
        marginBottom: 16,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme.colors.text,
    },
    cartActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    clearButton: {
        flex: 0.45,
    },
    checkoutButton: {
        flex: 0.45,
        backgroundColor: theme.colors.button.primary,
    },
});