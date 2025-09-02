import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ShopkeeperSignUp = () => {
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState('');
  const [shopName, setShopName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [landMark, setLandMark] = useState('');
  const [streetNo, setStreetNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  const CoordinateAPI_KEY = 'AlzaSydcYsEvzeVyGiy-u5NpEOMQT2oijBSlwTL';
  const GEMINI_API_KEY = 'AIzaSyCZewNCb6UlGLZbzBWfQAdGrWWZZl1oLDk';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const BACKEND_URL = 'https://shoplocalbackend-1.onrender.com/Shopkeeper';

  // Format the address using Gemini API
  const formatAddress = async () => {
    if (!city.trim() || !pincode.trim() || !streetNo.trim()) {
      Alert.alert('Missing Information', 'Please provide city, pincode, and street number.');
      return null;
    }

    const prompt = `Format this address information into a proper single-line address suitable for geocoding:
Shop Name: ${shopName.trim()}
Street Number: ${streetNo.trim()}
City: ${city.trim()}
Pincode: ${pincode.trim()}
Landmark: ${landMark.trim() || 'None'}`;

    try {
      setLoading(true);

      // Adjust request format based on Gemini API (like ChatCompletion)
      const response = await axios.post(
        GEMINI_URL,
        {
          // Use messages style if Gemini uses Chat API similar to OpenAI
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Safely parse formatted address from response.
      // NOTE: Adapt this if your Gemini response shape differs.
      let formattedAddress =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        response?.data?.content?.parts?.[0]?.text?.trim();

      if (!formattedAddress) {
        // Fallback manual formatting
        formattedAddress = `${shopName.trim()}, ${streetNo.trim()}, ${city.trim()}, ${pincode.trim()}${
          landMark ? `, near ${landMark.trim()}` : ''
        }`;
      }

      setAddress(formattedAddress);

      return formattedAddress;
    } catch (error) {
      console.error('Error with Gemini API:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to format address. Using default format instead.');

      const fallbackAddress = `${shopName.trim()}, ${streetNo.trim()}, ${city.trim()}, ${pincode.trim()}${
        landMark ? `, near ${landMark.trim()}` : ''
      }`;
      setAddress(fallbackAddress);
      return fallbackAddress;
    } finally {
      setLoading(false);
    }
  };

  // Get coordinates for the given address string
  const getCoordinates = async (formattedAddress) => {
    if (!formattedAddress) return null;

    try {
      const response = await axios.get(
        `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(
          formattedAddress
        )}&key=${CoordinateAPI_KEY}`
      );

      // Extract location coordinates from response
      const results = response?.data?.results;
      if (results && results.length > 0) {
        const loc = results[0]?.geometry?.location;
        if (loc?.lat && loc?.lng) {
          return {
            latitude: loc.lat,
            longitude: loc.lng
          };
        }
      }

      Alert.alert('Error', 'Could not find coordinates for the address. Please try using current location.');
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error.response?.data || error.message);
      Alert.alert('Error', 'There was an issue fetching location coordinates.');
      return null;
    }
  };

  // Request and get current device location
  const getCurrentLocation = async () => {
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location to set your shop coordinates',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot get current location without permission');
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setUsingCurrentLocation(true);
          Alert.alert('Success', 'Current location captured successfully');
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error.message);
          Alert.alert('Error', 'Failed to get current location. Please check if GPS is enabled.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('Location permission error:', error.message);
      Alert.alert('Error', 'Failed to request location permission');
      setLoading(false);
    }
  };

  // Submit all shop info to backend
  const submitShopInfo = async (coords) => {
    if (!shopName.trim() || !contactNo.trim() || !city.trim() || !category || !pincode.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const locationCoords = usingCurrentLocation ? location : coords;

    if (!locationCoords) {
      Alert.alert('Location Required', 'Please get your current location or ensure address geocoding was successful.');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');

    try {
      setLoading(true);

      if (usingCurrentLocation && !address) {
        setAddress(`${shopName.trim()}, ${city.trim()}, ${pincode.trim()}`);
      }

      const payload = {
        name: shopName.trim(),
        no: contactNo.trim(),
        city: city.trim(),
        address: address || `${shopName.trim()}, ${city.trim()}, ${pincode.trim()}`,
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        category,
        pincode: pincode.trim()
      };

      const response = await axios.post(`${BACKEND_URL}/shopInfo/${userId}`, payload);

      if (response.status === 201) {
        Alert.alert('Success', 'Shop information registered successfully!');
        AsyncStorage.setItem("shopInfo","true");
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to register shop information.');
      }
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to save shop information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Main registration handler
  const handleShopRegistration = async () => {
    setLoading(true);

    let coordinates = null;

    if (!usingCurrentLocation) {
      const formattedAddress = await formatAddress();
      if (!formattedAddress) {
        setLoading(false);
        return;
      }

      coordinates = await getCoordinates(formattedAddress);
      if (!coordinates) {
        setLoading(false);
        return;
      }
    }

    await submitShopInfo(coordinates);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Shop Details</Text>

      <TextInput
        placeholder="Shop Name"
        style={styles.input}
        placeholderTextColor="#555"
        value={shopName}
        onChangeText={(text) => setShopName(text)}
      />

      <TextInput
        placeholder="Contact No"
        style={styles.input}
        placeholderTextColor="#555"
        keyboardType="phone-pad"
        value={contactNo}
        onChangeText={(text) => setContactNo(text)}
      />

      <TextInput
        placeholder="Enter Your City"
        style={styles.input}
        placeholderTextColor="#555"
        value={city}
        onChangeText={(text) => setCity(text)}
      />

      <TextInput
        placeholder="Street No"
        style={styles.input}
        placeholderTextColor="#555"
        value={streetNo}
        onChangeText={(text) => setStreetNo(text)}
      />

      <TextInput
        placeholder="Landmark near you"
        style={styles.input}
        placeholderTextColor="#555"
        value={landMark}
        onChangeText={(text) => setLandMark(text)}
      />

      <TextInput
        placeholder="Enter Your City Pincode"
        style={styles.input}
        placeholderTextColor="#555"
        keyboardType="number-pad"
        value={pincode}
        onChangeText={(text) => setPincode(text)}
      />

      <TextInput
        placeholder="Full Address (will be auto-filled)"
        style={[styles.input, { height: 80 }]}
        placeholderTextColor="#555"
        value={address}
        onChangeText={(text) => setAddress(text)}
        multiline
      />

      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Grocery" value="grocery" />
        <Picker.Item label="Electronics" value="electronics" />
        <Picker.Item label="Clothing" value="clothing" />
        <Picker.Item label="Pharmacy" value="pharmacy" />
      </Picker>

      <Pressable style={styles.locationButton} onPress={getCurrentLocation} disabled={loading}>
        <Text style={styles.locationText}>{loading ? 'Getting Location...' : 'Use Current Location'}</Text>
      </Pressable>

      {location && (
        <Text style={styles.coordsText}>
          Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      )}

      <Pressable
        style={[styles.continueButton, loading && styles.disabledButton]}
        onPress={handleShopRegistration}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.continueText}>Save</Text>
        )}
      </Pressable>
    </View>
  );
};

export default ShopkeeperSignUp;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  label: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#005F73',
    alignSelf: 'flex-start'
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: '#333',
    fontSize: 16,
    elevation: 3
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15
  },
  coordsText: {
    fontSize: 14,
    marginVertical: 5,
    color: '#0077b6',
    textAlign: 'center'
  },
  locationButton: {
    width: '100%',
    backgroundColor: '#ff9f00',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4
  },
  locationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#2D6A4F',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: '#96BFB3',
    elevation: 2
  },
  continueText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  }
});
