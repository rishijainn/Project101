import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthProvider';

const ShopkeeperHomePage = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [todaySales, setTodaySales] = useState("₹0");
    const [pendingOrders, setPendingOrders] = useState(0);
    const { userDetail ,logout} = useAuth();
    const [activeCategory, setActiveCategory] = useState(0);
    
    // Sample data for orders
    const recentOrders = [];

    // Sample data for inventory categories
    const inventoryCategories = ["All Items", "Low Stock", "Popular Items", "New Arrivals"];

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                // Data fetching would happen here in a real app
                
                // Add a slight delay to simulate network request
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            } catch (error) {
                console.error("Error fetching user details:", error);
                setIsLoading(false);
            }
        };
        
        console.log("the user details are ", userDetail);
        fetchUserDetails();
        // Here you would also fetch real sales data, orders, etc.
    }, [userDetail]);
    
    const logOutHandler = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#064635" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <>
            {/* Shop Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.shopName}>{userDetail.shopName || "Your Shop"}</Text>
                    <Text style={styles.greeting}>Welcome back, {userDetail.name || "Shop Owner"}</Text>
                </View>
                <Pressable 
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle" size={46} color="#064635" />
                </Pressable>
            </View>

            {/* Dashboard Cards */}
            <View style={styles.dashboardCards}>
                <View style={styles.card}>
                    <View style={styles.cardIconContainer}>
                        <Ionicons name="cash-outline" size={24} color="#064635" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Today's Sales</Text>
                        <Text style={styles.cardValue}>{todaySales}</Text>
                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardIconContainer}>
                        <Ionicons name="time-outline" size={24} color="#064635" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Pending Orders</Text>
                        <Text style={styles.cardValue}>{pendingOrders}</Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search orders, inventory..."
                    placeholderTextColor="#999"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </Pressable>
                )}
            </View>

            {/* Inventory Categories */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoriesContainer}
            >
                {inventoryCategories.map((category, index) => (
                    <Pressable 
                        key={index} 
                        style={[
                            styles.categoryButton,
                            activeCategory === index && styles.activeCategoryButton
                        ]}
                        onPress={() => setActiveCategory(index)}
                    >
                        <Text style={[
                            styles.categoryText,
                            activeCategory === index && styles.activeCategoryText
                        ]}>
                            {category}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Recent Orders Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <Pressable 
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('AllOrders')}
                >
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2D6A4F" />
                </Pressable>
            </View>
        </>
    );

    const renderFooter = () => (
        <View style={styles.actionButtonsWrapper}>
            <View style={styles.actionButtonsContainer}>
                <Pressable 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AddItem')}
                >
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.actionButtonText}>Add Item</Text>
                </Pressable>
                <Pressable 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('InventoryList')}
                >
                    <Ionicons name="list" size={24} color="white" />
                    <Text style={styles.actionButtonText}>Inventory</Text>
                </Pressable>
                <Pressable 
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={logOutHandler}
                >
                    <Ionicons name="log-out" size={24} color="white" />
                    <Text style={styles.actionButtonText}>Logout</Text>
                </Pressable>
            </View>
            {/* Extra space for footer if needed */}
            <View style={{ height: 80 }} />
        </View>
    );

    const renderOrderItem = ({ item }) => (
        <Pressable 
            style={styles.orderItem}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        >
            <View style={styles.orderContent}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderCustomer}>{item.customer}</Text>
                    <Text style={styles.orderDetails}>{item.items} items · {item.time || ""}</Text>
                </View>
                <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalText}>{item.total}</Text>
                </View>
            </View>
            <View style={styles.orderActions}>
                <View style={[
                    styles.statusBadgeContainer,
                    item.status === 'Pending' ? styles.pendingStatusContainer :
                    item.status === 'Processing' ? styles.processingStatusContainer :
                    styles.readyStatusContainer
                ]}>
                    <View style={[
                        styles.statusDot,
                        item.status === 'Pending' ? styles.pendingDot :
                        item.status === 'Processing' ? styles.processingDot :
                        styles.readyDot
                    ]}></View>
                    <Text style={[
                        styles.statusText,
                        item.status === 'Pending' ? styles.pendingText :
                        item.status === 'Processing' ? styles.processingText :
                        styles.readyText
                    ]}>{item.status}</Text>
                </View>
                <Pressable 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
                >
                    <Text style={styles.viewButtonText}>View</Text>
                </Pressable>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <FlatList
                    data={recentOrders}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderOrderItem}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9FA'
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100 // Extra space at bottom
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#064635'
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16
    },
    shopName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#064635'
    },
    greeting: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    profileButton: { 
        padding: 2,
        borderRadius: 23,
        elevation: 2,
        shadowColor: '#064635',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: '#FFF'
    },
    dashboardCards: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20
    },
    card: { 
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%', 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    cardIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cardTitle: { 
        fontSize: 14, 
        color: '#666',
        marginBottom: 4
    },
    cardValue: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#064635'
    },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        borderRadius: 12, 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: { 
        flex: 1, 
        fontSize: 16, 
        color: '#333',
        paddingVertical: 0
    },
    categoriesContainer: { 
        marginBottom: 20,
        flexDirection: 'row'
    },
    categoryButton: { 
        backgroundColor: 'rgba(45, 106, 79, 0.1)', 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 20, 
        marginRight: 10
    },
    activeCategoryButton: {
        backgroundColor: '#2D6A4F'
    },
    categoryText: { 
        color: '#2D6A4F', 
        fontSize: 14, 
        fontWeight: '500'
    },
    activeCategoryText: {
        color: 'white'
    },
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#064635'
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    viewAllText: { 
        color: '#2D6A4F', 
        fontSize: 14,
        fontWeight: '500'
    },
    orderItem: { 
        backgroundColor: 'white', 
        marginBottom: 12, 
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    orderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16
    },
    orderInfo: {
        flex: 1
    },
    orderCustomer: { 
        fontSize: 16, 
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    orderDetails: { 
        fontSize: 14, 
        color: '#666'
    },
    orderTotal: {
        justifyContent: 'center'
    },
    orderTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#064635'
    },
    orderActions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        padding: 12
    },
    statusBadgeContainer: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    pendingStatusContainer: { 
        backgroundColor: 'rgba(255, 204, 0, 0.2)'
    },
    processingStatusContainer: { 
        backgroundColor: 'rgba(0, 123, 255, 0.2)'
    },
    readyStatusContainer: { 
        backgroundColor: 'rgba(40, 167, 69, 0.2)'
    },
    pendingDot: {
        backgroundColor: '#FFCC00'
    },
    processingDot: {
        backgroundColor: '#007BFF'
    },
    readyDot: {
        backgroundColor: '#28A745'
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500'
    },
    pendingText: {
        color: '#CC9900'
    },
    processingText: {
        color: '#0066CC'
    },
    readyText: {
        color: '#1E7E34'
    },
    viewButton: { 
        backgroundColor: '#064635', 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 8
    },
    viewButtonText: { 
        color: 'white', 
        fontSize: 14,
        fontWeight: '500'
    },
    actionButtonsWrapper: {
        marginTop: 20
    },
    actionButtonsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 20, 
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    actionButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10, 
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center'
    },
    actionButtonText: { 
        color: 'white', 
        fontSize: 16, 
        marginLeft: 8,
        fontWeight: '500'
    },
    logoutButton: { 
        backgroundColor: 'rgba(217, 83, 79, 0.6)',
        paddingHorizontal: 12,
        borderRadius: 8
    }
});

export default ShopkeeperHomePage;