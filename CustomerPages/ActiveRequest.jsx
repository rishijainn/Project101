import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { useNavigation } from '@react-navigation/native';

const ActiveRequest = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { userDetail } = useAuth();
  const navigation = useNavigation();

  const fetchActiveRequests = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(
        `http://10.0.2.2:4000/noti/getActiveRequest/${userDetail.id}`
      );
   
      
      setActiveRequests(response.data.data);
    } catch (error) {
      console.error("Failed to fetch active requests:", error);
      setError("Unable to load requests. Please check your connection and try again."); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userDetail.id]);

  useEffect(() => {
    fetchActiveRequests();
    
    // Set up interval to refresh data periodically (every 5 minutes)
    const refreshInterval = setInterval(fetchActiveRequests, 300000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchActiveRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveRequests();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteRequest = async (requestId) => {
    // Show confirmation alert before deleting
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Call the delete API endpoint
              console.log(requestId);
              await axios.delete('http://10.0.2.2:4000/noti/deleteRequest', {
                data: { requestId } // Send the requestId in the request body
              });
              
              // Update the UI by removing the deleted request
              setActiveRequests(prevRequests => 
                prevRequests.filter(request => 
                  (request.requestId || request._id) !== requestId
                )
              );
              
              // Show success message
              Alert.alert("Success", "Request deleted successfully");
            } catch (error) {
              console.error("Failed to delete request:", error);
              Alert.alert(
                "Error",
                "Failed to delete request. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₹0";
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'urgent':
        return '#FF3B30';
      case 'pending':
        return '#FF9500';
      case 'completed':
        return '#34C759';
      case 'accepted':
        return '#30B0FF';
      default:
        return '#007AFF';
    }
  };

  const renderRequest = ({ item }) => {
    // Extract all relevant data from the complex structure
 
    const shopName = item.shopName || "Unknown Shop";
    const shopAddress = item.shopAddress || "No address provided";
    const shopKeeperName = item.shopKeeperName || "";
    const price = formatPrice(item.price);
    const deliveryCost = formatPrice(item.deliveryCost);
    const providesDelivery = item.providesDelivery;
    const message = item.message || "";
    const status = item.requestId?.status || "pending";
    const createdAt = item.createdAt;
    const itemName = item.requestId?.itemName || "Unknown Item";
    const brand = item.requestId?.brand || "";
    const itemDescription = item.requestId?.description || "";
    // Get the requestId for delete functionality
    const requestId = item.requestId?._id || item._id;
    
    return (
      <View style={styles.requestCard}>
        {/* Shop Header */}
        <View style={styles.shopHeader}>
          <View style={styles.shopIconContainer}>
            <Text style={styles.shopIconText}>{shopName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.shopKeeperName}>{shopKeeperName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Item Details */}
        <View style={styles.itemSection}>
          <Text style={styles.sectionTitle}>Requested Item</Text>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{itemName}</Text>
            {brand && <Text style={styles.itemBrand}>{brand}</Text>}
            {itemDescription && <Text style={styles.itemDescription}>{itemDescription}</Text>}
          </View>
        </View>

        {/* Shop Response */}
        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>Shop Response</Text>
          <View style={styles.responseCard}>
            <Text style={styles.responseMessage}>{message}</Text>
            <View style={styles.pricingDetails}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>{price}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Delivery</Text>
                <Text style={styles.priceValue}>
                  {providesDelivery ? deliveryCost : "Not Available"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Shop Address</Text>
          <Text style={styles.addressText}>{shopAddress}</Text>
        </View>

        {/* Footer with Date and Actions */}
        <View style={styles.cardFooter}>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.deleteButton} 
              activeOpacity={0.7}
              onPress={() => handleDeleteRequest(item.requestId)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} activeOpacity={0.7}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTextPrimary}>No Active Requests</Text>
      <Text style={styles.emptyTextSecondary}>
        Pull down to refresh or check back later
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerText}>Active Requests</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchActiveRequests}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeRequests}
          keyExtractor={(item, index) => (item.requestId?._id || item._id || index.toString())}
          renderItem={renderRequest}
          contentContainerStyle={[
            styles.listContainer,
            activeRequests.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#007AFF']} 
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

// Back button icon component
const BackIcon = () => {
  return (
    <View style={styles.backIconContainer}>
      <View style={styles.backArrow}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#333',
    transform: [{ rotate: '45deg' }],
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 16,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 5,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  shopInfo: {
    marginLeft: 12,
    flex: 1,
  },
  shopName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  shopKeeperName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
  },
  itemSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  itemDetails: {
    backgroundColor: '#F6F8FA',
    padding: 12,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemBrand: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  responseSection: {
    marginBottom: 16,
  },
  responseCard: {
    backgroundColor: '#F6F8FA',
    padding: 12,
    borderRadius: 8,
  },
  responseMessage: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 20,
  },
  pricingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addressSection: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F6F8FA',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
  },
  contactButtonText: {
    color: '#333333',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTextPrimary: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyTextSecondary: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default ActiveRequest;