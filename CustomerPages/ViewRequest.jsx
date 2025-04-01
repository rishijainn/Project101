import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Image, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';

const ViewRequest = ({ route, navigation }) => {
  const requestId = route.params.requestId;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://10.0.2.2:4000/noti/getAllNotifications/${requestId}`);
      console.log(response.data);
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [])

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBuy = (item) => {
    console.log("hello",item);
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmPurchase = () => {
    // Close modal
    console.log(selectedItem,"printing in viewRequest");
    setModalVisible(false);
    navigation.navigate("ShopDetails",{selectedItem:selectedItem});
    
    // Proceed with purchase
    // console.log(`Buy confirmed from shop: ${selectedItem.shopName}, price: ${selectedItem.price}`);
    // // Show success message
    // Alert.alert(
    //   "Purchase Initiated",
    //   `Your order with ${selectedItem.shopName} has been placed successfully.`,
    //   [{ text: "OK", onPress: () => navigation.navigate('YourOrders') }]
    // );
    // navigation.navigate('Checkout', { shopId: selectedItem.shopId, price: selectedItem.price });
  };

  const renderNotificationItem = (item, index) => (
    <View key={index} style={styles.notificationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.shopName}>{item.shopName || "Unknown Shop"}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>New</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Price:</Text>
        <Text style={styles.priceAmount}>₹{item.price || "N/A"}</Text>
      </View>

      {item.providesDelivery && (
        <View style={styles.deliveryContainer}>
          <View style={styles.deliveryIconContainer}>
            <View style={styles.deliveryIcon}></View>
          </View>
          <View style={styles.deliveryInfoContainer}>
            <Text style={styles.deliveryLabel}>Delivery Available</Text>
            <Text style={styles.deliveryCost}>
              {item.deliveryCost > 0 
                ? `Delivery charge: ₹${item.deliveryCost}` 
                : "Free delivery"}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => handleBuy(item)}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalShopName}>
              {selectedItem?.shopName || "Unknown Shop"}
            </Text>
            
            <Text style={styles.modalPrice}>
              ₹{selectedItem?.price || "N/A"}
            </Text>
            
            <Text style={styles.modalWarning}>
              Important: By confirming this purchase, all other offers for this request will be automatically removed. This action cannot be undone.
            </Text>
            
            <Text style={styles.modalConfirmText}>
              Would you like to proceed with this purchase?
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={confirmPurchase}
            >
              <Text style={styles.modalConfirmButtonText}>Confirm Purchase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Offers</Text>
        </View>
        <Text style={styles.requestIdText}>Request ID: {requestId}</Text>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {notifications.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Shop Offers ({notifications.length})</Text>
              {notifications.map((item, index) => renderNotificationItem(item, index))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconPlaceholder}></View>
              <Text style={styles.emptyTitle}>No offers yet</Text>
              <Text style={styles.emptyText}>When shops respond to your request, you'll see their offers here.</Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {renderConfirmationModal()}
    </SafeAreaView>
  );
};

export default ViewRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
  },
  backButtonText: {
    fontSize: 22,
    color: '#424242',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  requestIdText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    marginLeft: 46,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginRight: 8,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  deliveryIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 18,
  },
  deliveryIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  deliveryInfoContainer: {
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  deliveryCost: {
    fontSize: 14,
    color: '#616161',
  },
  buyButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  buyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#616161',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    elevation: 2,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    elevation: 1,
  },
  emptyIconPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalShopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalWarning: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    lineHeight: 22,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  modalConfirmButton: {
    flex: 1.5,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1976D2',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});