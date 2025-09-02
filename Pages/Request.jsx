import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../AuthProvider';

const Request = ({route, navigation}) => {
  const {userDetail}=useAuth();
  const userId = userDetail.id;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log(userId)
      const response = await axios.get(`https://shoplocalbackend-1.onrender.com/user/getRequest/${userId}`);
      console.log("Requests loaded:", response.data.response?.length || 0);
      setRequests(response.data.response || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Could not load requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    } 
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewRequest = (item) => {
    navigation?.navigate('ViewRequest', { requestId: item._id });
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.statusText}>{item.status || "Pending"}</Text>
      </View>
      
      <Text style={styles.requestTitle}>{item.itemName || "Request"}</Text>
      
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description || "No description provided"}
      </Text>
      
      <View style={styles.requestFooter}>
        <Text style={styles.dateText}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
        </Text>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleViewRequest(item)}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4CAF50'; // green
      case 'in progress':
        return '#2196F3'; // blue
      case 'pending':
        return '#FFC107'; // amber
      case 'cancelled':
        return '#F44336'; // red
      default:
        return '#9E9E9E'; // grey
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.heading}>My Requests</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubText}>Pull down to refresh</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Request;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  heading: {
    textAlign: 'center',
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 6,
  },
  requestDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  viewButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 1,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 1,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});