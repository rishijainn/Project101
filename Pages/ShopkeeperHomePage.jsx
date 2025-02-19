import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
const categories = ["Electronics", "Groceries", "Clothing", "Home Essentials", "Others"];

const recentRequests = [
    { id: '1', item: 'Laptop Charger' },
    { id: '2', item: 'Organic Apples' },
    { id: '3', item: 'Phone Cover' },
];



const ShopkeeperHomePage = ({navigation}) => {
    const [search, setSearch] = useState('');

    const logOutHandler=async()=>{
        await AsyncStorage.setItem("isLoggedIn","false");
        navigation.navigate("Login");
      }
    return (
        <View style={styles.container}>
            {/* Ensures proper keyboard behavior */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer} 
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.greeting}>Hello, Customer! 👋</Text>
                        <Text style={styles.subText}>Find what you need from nearby shops</Text>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for items or shops..."
                            placeholderTextColor="#777"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    {/* Categories */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                        {categories.map((category, index) => (
                            <Pressable key={index} style={styles.categoryButton}>
                                <Text style={styles.categoryText}>{category}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Recent Requests */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Requests</Text>
                        <FlatList
                            data={recentRequests}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.requestItem}>
                                    <Text style={styles.requestText}>{item.item}</Text>
                                    <Pressable style={styles.requestButton}>
                                        <Text style={styles.requestButtonText}>View</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>

                    {/* New Request Button */}
                    <Pressable style={styles.newRequestButton}>
                        <Text style={styles.newRequestText}>+ New Request</Text>
                    </Pressable>
                    <Pressable style={styles.newRequestButton}>
                        <Text style={styles.newRequestText} onPress={logOutHandler}>LogOut</Text>
                    </Pressable>





                   
                    

                    {/* Extra padding to prevent overlap */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation}/>
            </View>
        </View>
    );
};

export default ShopkeeperHomePage;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8F9FA', 
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 100, // Ensures content is above footer
    },
    
    header: { marginBottom: 20, marginTop: 15, marginLeft: 10 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#064635' },
    subText: { fontSize: 16, color: '#555' },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 3,
        marginBottom: 20,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },

    categoriesContainer: { 
        paddingBottom: 10, 
        flexDirection: 'row',
    },
    categoryButton: {
        backgroundColor: '#2D6A4F',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginRight: 10,
    },
    categoryText: { color: 'white', fontSize: 16 },

    section: { marginBottom: 20, paddingHorizontal: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#064635', marginBottom: 10 },

    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 3,
        marginBottom: 10,
    },
    requestText: { fontSize: 16, color: '#333' },
    requestButton: {
        backgroundColor: '#FFB300',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    requestButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

    newRequestButton: {
        backgroundColor: '#064635',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
    },
    newRequestText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

    footerContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});
