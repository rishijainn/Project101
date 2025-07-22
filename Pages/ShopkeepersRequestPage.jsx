import React, { useEffect, useState } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Modal,
  TextInput,
  Switch
} from 'react-native'
import axios from 'axios'
import { useAuth } from '../AuthProvider'

const ShopkeepersRequestPage = () => {
  const { userDetail } = useAuth();
  const userId = userDetail?.id;
  const [shopDetails, setShopDetails] = useState(null);
  const [shopRequest, setShopRequest] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [price, setPrice] = useState('');
  const [providesDelivery, setProvidesDelivery] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState('');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `http://10.0.2.2:4000/noti/getShopKepperNotification/${userId}`
        );
        console.log(response)
        setShopDetails(response.data.shopInfo || null);
        setShopRequest(response.data.response || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
      }
    };

    fetchRequests();
  },[]);

  const openPriceModal = (item) => {
    setCurrentRequest(item);
    setPrice('');
    setProvidesDelivery(false);
    setDeliveryCost('');
    setPriceError('');
    setModalVisible(true);
  };

  const validateAndSubmit = () => {
    // Validate price
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setPriceError('Please enter a valid price');
      return;
    }
    
    // Validate delivery cost if delivery is provided
    if (providesDelivery && (!deliveryCost || isNaN(parseFloat(deliveryCost)) || parseFloat(deliveryCost) < 0)) {
      setPriceError('Please enter a valid delivery cost');
      return;
    }

    // All validations passed
    handleAcceptRequest();
  };

  const handleAcceptRequest = async () => {
    if (!currentRequest) return;
    
    const item = currentRequest;
    const RequestId = item.requestId;
    const ShopName = shopDetails.shopName;
    const shopAddress = shopDetails.address;
    const lat = shopDetails.location.coordinates[0];
    const lon = shopDetails.location.coordinates[1];
    const name = userDetail.name;
    const fcmToken = item.customerId.fcmToken;
    const customerId = item.customerId._id;

    try {
      const response = await axios.post(
        `http://10.0.2.2:4000/noti/sendAcceptedReq`,
        {
          customerId: customerId,
          ShopkeeperId: userDetail.id,
          requestId: RequestId,
          ShopName: ShopName,
          shopAddress: shopAddress,
          lat: lat,
          lon: lon,
          ShopkeeperName: name,
          messages: "hello I accept the request",
          fcmToken: fcmToken,
          price: parseFloat(price),
          providesDelivery: providesDelivery,
          deliveryCost: providesDelivery ? parseFloat(deliveryCost) : 0
        }
      );

      const deleteResponse = await axios.delete(
        `http://10.0.2.2:4000/noti/deleteShopNotification/${item._id}`
      );

      // Remove the accepted request from the list
      setShopRequest(prevRequests => 
        prevRequests.filter(request => request._id !== item._id)
      );
      
      // Close the modal
      setModalVisible(false);
    } catch (error) {
      console.log("Error processing request:", error);
      setPriceError('Failed to process request. Please try again.');
    }
  };

  const handleRejectRequest = async (item) => {
    try {
      await axios.delete(
        `http://10.0.2.2:4000/noti/deleteShopNotification/${item._id}`
      );

      // Remove the rejected request from the list
      setShopRequest(prevRequests => 
        prevRequests.filter(request => request._id !== item._id)
      );
    } catch (error) {
      console.log("Error rejecting request:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Requests</Text>
      {shopRequest.length > 0 ? (
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {shopRequest.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>New Request</Text>
              </View>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={[styles.button, styles.acceptButton]} 
                  onPress={() => openPriceModal(item)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </Pressable>
                <Pressable 
                  style={[styles.button, styles.rejectButton]} 
                  onPress={() => handleRejectRequest(item)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.noRequestText}>No Requests Found</Text>
          <Text style={styles.noRequestSubtext}>
            You'll see new requests here when they arrive
          </Text>
        </View>
      )}

      {/* Price and Delivery Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Offer</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price (₹):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Provide Delivery?</Text>
              <Switch
                value={providesDelivery}
                onValueChange={setProvidesDelivery}
                trackColor={{ false: "#767577", true: "#2ecc71" }}
                thumbColor={providesDelivery ? "#fff" : "#f4f3f4"}
              />
            </View>

            {providesDelivery && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Delivery Cost (₹):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter delivery cost"
                  value={deliveryCost}
                  onChangeText={setDeliveryCost}
                  keyboardType="numeric"
                />
              </View>
            )}

            {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={validateAndSubmit}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ShopkeepersRequestPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  messageLabel: {
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  message: {
    color: '#34495e',
    fontSize: 16,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noRequestText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7f8c8d',
    textAlign: 'center',
  },
  noRequestSubtext: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 22,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 6,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
  },
});