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
  PermissionsAndroid
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { ActivityIndicator } from 'react-native-paper';

const AddRequest = ({ navigation, route }) => {
  const [request, setAddRequest] = useState({
    item: "",
    image: null,
    company: "",
    quantity: "",
    extraDetail: "",
    range: ""
  });
  const [isLoading,setIsLoading]=useState(false);


  // Fix the parameter access - route instead of rout
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
    const prompt=`select the category for ${request.item} among [Grocery,Electronics,Clothing,Pharmacy]`
    const { item, image, company, quantity, extraDetail, range } = request;
    let Category='';
    setIsLoading(true);
    if (!item.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name');
      return;
    }

    if (!company.trim()) {
      Alert.alert('Validation Error', 'Please enter a company name');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity');
      return;
    }

    await axios.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA58ho_64s0kqAvoBztIexzcvZFsGR9x0A",
      { "contents": [{ "parts": [{ "text": prompt }] }] }
  )
      .then((response) => {
          const responseData = response.data.candidates[0].content.parts[0].text;
          try {
              
              Category=responseData;
              console.log(Category);
          } catch (e) {
              console.log("Error parsing response:", e);
          }
      }).catch((error) => {
          console.log("There is some issue with the Bot, please try again later", error);
      })

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
      formData.append('range', range);
      formData.append('lat', lat);
      formData.append('lon', lon);
      formData.append('category',Category);

      // Add image if it exists
      if (image) {
        // Assuming 'image' contains either a URI or file information
        // You'll need to format this according to your image picker's output
        const imageFile = {
          uri: image,
          type: 'image/jpeg', // or determine the type dynamically
          name: 'upload.jpg'  // or generate a unique name
        };
        formData.append('itemImage', imageFile);
      }

      console.log('Sending FormData:', formData);

      // Send FormData with proper headers
      const response = await axios.post(
        "http://10.0.2.2:4000/user/create-request",
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
              range: ""
            });
            // Optionally navigate back or to another screen
            // navigation.goBack();
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
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Create New Request</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter item name'
            placeholderTextColor="#A9A9A9"
            value={request.item}
            onChangeText={(val) => onRequestChangeHandler('item', val)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter company name'
            placeholderTextColor="#A9A9A9"
            value={request.company}
            onChangeText={(val) => onRequestChangeHandler('company', val)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter quantity'
            placeholderTextColor="#A9A9A9"
            keyboardType='numeric'
            value={request.quantity}
            onChangeText={(val) => onRequestChangeHandler('quantity', val)}
          />
        </View>
        {isLoading && <ActivityIndicator size="large" color="#007bff" />}

        {/* Image Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Item Image</Text>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
          >
            {request.image ? (
              <Image
                source={{ uri: request.image }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.imagePickerText}>Select Image</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Extra Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder='Additional information'
            placeholderTextColor="#A9A9A9"
            value={request.extraDetail}
            onChangeText={(val) => onRequestChangeHandler('extraDetail', val)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Range</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter range (1-10 km)'
            placeholderTextColor="#A9A9A9"
            keyboardType='numeric'
            value={request.range}
            onChangeText={(val) => onRequestChangeHandler('range', val)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  innerContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePickerText: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  }
});

export default AddRequest;