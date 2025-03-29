import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
// import { useUser } from '../UserProvider';
import { useAuth } from '../AuthProvider';
import axios from 'axios';

const categories = [
  { id: '1', name: "Electronics", icon: "phone-portrait-outline" },
  { id: '2', name: "Groceries", icon: "basket-outline" },
  { id: '3', name: "Clothing", icon: "shirt-outline" },
  { id: '4', name: "Home Essentials", icon: "home-outline" },
  { id: '5', name: "Others", icon: "ellipsis-horizontal-outline" }
];

const CustomerHomePage = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { userDetail,logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recentRequests, setRecentRequests] = useState(null);



  useEffect(() => {
    const fetchRequests = async () => {
      const userId = userDetail.id;
      console.log(userDetail);
      console.log(userId);
      const response = await axios.get(`http://10.0.2.2:4000/user/getRequest/${userId}`);
      console.log("helllo")
      console.log("Requests loaded:", response.data.response?.length || 0);

      console.log(response.data.response);
      const newReponse = response.data.response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
      console.log(newReponse);
      if (newReponse) {
        setRecentRequests(newReponse); 
      } 

    }
    console.log("calling fron useeffect");
    fetchRequests();
  }, [userDetail]);

  const logOutHandler = async () => {
    await logout();
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064635" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#064635" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {userDetail.name || 'User'}! 👋</Text>
              <Text style={styles.subText}>Find what you need from nearby shops</Text>
            </View>
            <Pressable onPress={logOutHandler} style={styles.profileButton}>
              <Ionicons name="log-out-outline" size={24} color="#064635" />
            </Pressable>
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
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </Pressable>
            )}
          </View>

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.seeAllText}>See All</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Pressable key={category.id} style={styles.categoryButton}>
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={category.icon} size={24} color="white" />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Recent Requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Requests</Text>
            <Text style={styles.seeAllText}>See All</Text>
          </View>



          {recentRequests?.length > 0 ? (
            recentRequests.map((item) => (
              <View key={item._id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestText}>{item.itemName}</Text>
                  <Text style={styles.requestDate}>{item.createdAt}</Text>
                </View>
                <View style={styles.requestActions}>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.status === 'Fulfilled' ? styles.fulfilledStatus : styles.pendingStatus
                    ]}
                  >
                    {item.status}
                  </Text>
                  <Pressable style={styles.requestButton}>
                    <Text style={styles.requestButtonText}>View</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
              No recent requests found.
            </Text>
          )}


          {/* New Request Button */}
          <Pressable
            style={styles.newRequestButton}
            onPress={() => navigation.navigate("AddReq", { id: userDetail.id })}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.newRequestText}>New Request</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CustomerHomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#064635',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#064635',
  },
  subText: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064635',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#777',
  },
  requestActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  pendingStatus: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  fulfilledStatus: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  requestButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  newRequestButton: {
    backgroundColor: '#064635',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  newRequestText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});