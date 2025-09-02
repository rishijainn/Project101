import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  PermissionsAndroid,
  StatusBar
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Color Theme
const COLORS = {
  primary: '#3A86FF',     // Primary Blue for buttons and key elements
  secondary: '#06D6A0',   // Secondary Green for success indicators
  accent: '#FFBE0B',      // Amber Yellow for accent elements
  notification: '#FF6B6B', // Soft Coral for notification badges
  background: '#F7F9FC',  // Light background
  white: '#FFFFFF',
  lightGray: '#E1E1E1',
  darkGray: '#333333',
  mediumGray: '#A9A9A9'
};

const AddRequest = ({ navigation, route }) => {
  const [request, setAddRequest] = useState({
    item: "",
    image: null,
    company: "",
    quantity: "",
    extraDetail: "",
    // range: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const userId = route.params.id;
  const [location, setLocation] = useState(null);

  const onRequestChangeHandler = (key, value) => {
    console.log(key, " ", value);
    setAddRequest((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Could not select image');
      } else {
        const selectedImage = response.assets && response.assets[0];
        if (selectedImage) {
          onRequestChangeHandler('image', selectedImage.uri);
          console.log(selectedImage.uri);
        }
      }
    });
  };

  const handleSubmit = async () => {
    const prompt = `select the category for ${request.item} among [grocery,electronics,clothing,pharmacy]`;
    const { item, image, company, quantity, extraDetail } = request;
    let Category = '';
    setIsLoading(true);
    
    if (!item.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name');
      setIsLoading(false);
      return;
    }
    
    if (!company.trim()) {
      Alert.alert('Validation Error', 'Please enter a company name');
      setIsLoading(false);
      return;
    }
    
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity');
      setIsLoading(false);
      return;
    }

    await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA58ho_64s0kqAvoBztIexzcvZFsGR9x0A",
      { "contents": [{ "parts": [{ "text": prompt }] }] }
    )
    .then((response) => {
      const responseData = response.data.candidates[0].content.parts[0].text;
      try {
        Category = responseData;
        console.log(Category);
      } catch (e) {
        console.log("Error parsing response:", e);
      }
    }).catch((error) => {
      console.log("There is some issue with the Bot, please try again later", error);
    });

    try {
      // Use location state for coordinates
      const lat = location ? location.coords.latitude : null;
      const lon = location ? location.coords.longitude : null;
      
      // Create FormData object
      const formData = new FormData();
      
      // Add text fields
      formData.append('userId', userId);
      formData.append('itemName', item);
      formData.append('brand', company);
      formData.append('quantity', quantity);
      formData.append('description', extraDetail);
      // formData.append('range', range);
      formData.append('lat', lat);
      formData.append('lon', lon);
      formData.append('category', Category);
      
      // Add image if it exists
      if (image) {
        const imageFile = {
          uri: image,
          type: 'image/jpeg', // or determine the type dynamically
          name: 'upload.jpg' // or generate a unique name
        };
        formData.append('itemImage', imageFile);
      }
      
      console.log('Sending FormData:', formData);
      
      // Send FormData with proper headers
      const response = await axios.post(
        "https://shoplocalbackend-1.onrender.com/user/create-request",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log(response.data);
      Alert.alert('Success', 'Request submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setAddRequest({
              item: "",
              image: null,
              company: "",
              quantity: "",
              extraDetail: "",
              // range: ""
            });
            // Navigate back after successful submission
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error('Error submitting request:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
    
    setIsLoading(false);
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      console.log('granted', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
        console.log('You can use Geolocation');
        return true;
      } else {
        console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Position obtained:', position);
        setLocation(position);
      },
      error => {
        console.log('Geolocation error:', error.code, error.message);
        setLocation(null);
        Alert.alert('Location Error', 'Unable to get your current location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Professional Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Request</Text>
        
        <View style={styles.headerRightSpace} />
      </View>
      
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            {/* Item Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                placeholderTextColor={COLORS.mediumGray}
                value={request.item}
                onChangeText={(val) => onRequestChangeHandler('item', val)}
              />
            </View>
            
            {/* Company Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter company name"
                placeholderTextColor={COLORS.mediumGray}
                value={request.company}
                onChangeText={(val) => onRequestChangeHandler('company', val)}
              />
            </View>
            
            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor={COLORS.mediumGray}
                keyboardType="numeric"
                value={request.quantity}
                onChangeText={(val) => onRequestChangeHandler('quantity', val)}
              />
            </View>
            
            {isLoading && 
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Processing your request...</Text>
              </View>
            }
            
            {/* Image Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Item Image</Text>
              
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {request.image ? (
                  <Image 
                    source={{ uri: request.image }} 
                    style={styles.imagePreview} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Icon name="add-photo-alternate" size={40} color={COLORS.accent} />
                    <Text style={styles.imagePickerText}>Select Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Extra Details */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Extra Details</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any additional details here"
                placeholderTextColor={COLORS.mediumGray}
                value={request.extraDetail}
                onChangeText={(val) => onRequestChangeHandler('extraDetail', val)}
                multiline
                numberOfLines={4}
              />
            </View>
            
            {/* Range
            <View style={styles.formGroup}>
              <Text style={styles.label}>Range</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter range"
                placeholderTextColor={COLORS.mediumGray}
                value={request.range}
                onChangeText={(val) => onRequestChangeHandler('range', val)}
              />
            </View> */}
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#3A86FF', // Primary Blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRightSpace: {
    width: 40, // Balance the back button width
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  innerContainer: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#A9A9A9',
    fontSize: 16,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#3A86FF', // Primary Blue
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  loadingText: {
    marginTop: 10,
    color: '#3A86FF', // Primary Blue
    fontSize: 14,
  },
  successIndicator: {
    color: '#06D6A0', // Secondary Green
  },
  accentElement: {
    color: '#FFBE0B', // Amber Yellow
  },
  notificationBadge: {
    backgroundColor: '#FF6B6B', // Soft Coral
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default AddRequest;