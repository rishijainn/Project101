import { StyleSheet, Text, TextInput, View, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const ShopkeeperSignUp = () => {

    // Form state
    const navigation=useNavigation();
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
    

    // API keys (in a real app, these should be stored securely)
    const CoordinateAPI_KEY = "AlzaSydcYsEvzeVyGiy-u5NpEOMQT2oijBSlwTL";
    const GEMINI_API_KEY = "AIzaSyCZewNCb6UlGLZbzBWfQAdGrWWZZl1oLDk";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const BACKEND_URL = "http://10.0.2.2:4000/Shopkeeper"; // Update with your actual backend URL

    // Use Gemini to format the address
    const formatAddress = async () => {
        if (!city || !pincode || !streetNo) {
            Alert.alert("Missing Information", "Please provide city, pincode, and street number.");
            return null;
        }

        const prompt = `Format this address information into a proper address string:
        Shop Name: ${shopName}
        Street Number: ${streetNo}
        City: ${city}
        Pincode: ${pincode}
        Landmark: ${landMark || "None"}
        
        Please format this as a single line complete address suitable for geocoding.`;

        try {
            setLoading(true);
            const response = await axios.post(GEMINI_URL, {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });

            console.log("Gemini response:", response.data);
            
            // Extracting formatted address from Gemini response structure
            let formattedAddress = null;
            
            // Check if response has expected structure
            if (response.data && response.data.candidates && 
                response.data.candidates[0] && response.data.candidates[0].content && 
                response.data.candidates[0].content.parts && 
                response.data.candidates[0].content.parts[0]) {
                
                formattedAddress = response.data.candidates[0].content.parts[0].text.trim();
            } 
            // Try alternative structure - the actual response might differ
            else if (response.data && response.data.content && response.data.content.parts) {
                formattedAddress = response.data.content.parts[0].text.trim();
            }
            // If all else fails, use a fallback
            else {
                // Construct a basic address format as fallback
                formattedAddress = `${shopName}, ${streetNo}, ${city}, ${pincode}${landMark ? `, near ${landMark}` : ''}`;
                console.log("Using fallback address format:", formattedAddress);
            }
            
            setAddress(formattedAddress);
            return formattedAddress;
            
        } catch (error) {
            console.error("Error with Gemini API:", error.response ? error.response.data : error.message);
            Alert.alert("Error", "Failed to format address. Using default format instead.");
            
            // Create a fallback address format
            const fallbackAddress = `${shopName}, ${streetNo}, ${city}, ${pincode}${landMark ? `, near ${landMark}` : ''}`;
            setAddress(fallbackAddress);
            return fallbackAddress;
        } finally {
            setLoading(false);
        }
        console.log(formatAddress)
    };

    // Get coordinates from formatted address
    const getCoordinates = async (formattedAddress) => {
        if (!formattedAddress) {
            return null;
        }

        try {
            const response = await axios.get(
                `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(formattedAddress)}&key=${CoordinateAPI_KEY}`
            );

            console.log("Geocoding response:", response.data);
            
            // Check if we have the expected structure
            if (response.data && response.data.results && response.data.results[0] && 
                response.data.results[0].geometry && response.data.results[0].geometry.location) {
                
                const location = response.data.results[0].geometry.location;
                return {
                    latitude: location.lat,
                    longitude: location.lng
                };
            } 
            // Try alternative structure
            else if (response.data && response.data.candidates && response.data.candidates[0] && 
                    response.data.candidates[0].geometry && response.data.candidates[0].geometry.location) {
                
                const location = response.data.candidates[0].geometry.location;
                return {
                    latitude: location.lat,
                    longitude: location.lng
                };
            } else {
                Alert.alert("Error", "Could not find coordinates for the address. Please try getting your current location instead.");
                return null;
            }
        } catch (error) {
            console.error("Error getting coordinates:", error.response ? error.response.data : error.message);
            Alert.alert("Error", "There was an issue fetching location coordinates.");
            return null;
        }
    };

    // Request location permission and get current location
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
                        buttonPositive: 'OK',
                    }
                );
                
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Cannot get current location without permission');
                    setLoading(false);
                    return;
                }
            }
            
            // Get current position using Geolocation API
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Current location: ${latitude}, ${longitude}`);
                    
                    setLocation({
                        latitude,
                        longitude
                    });
                    
                    setUsingCurrentLocation(true);
                    Alert.alert('Success', 'Current location captured successfully');
                    setLoading(false);
                },
                error => {
                    console.error('Error getting location:', error);
                    Alert.alert('Error', 'Failed to get current location. Please check if GPS is enabled.');
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            console.error('Location permission error:', error);
            Alert.alert('Error', 'Failed to request location permission');
            setLoading(false);
        }
    };

    // Submit shop information to backend
    const submitShopInfo = async (coords) => {
        if (!shopName || !contactNo || !city || !category || !pincode) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        // Use either the current location or the fetched coordinates
        const locationCoords = usingCurrentLocation ? location : coords;
        
        const userId=await AsyncStorage.getItem("userId");
        if (!locationCoords) {
            Alert.alert("Location Required", "Please get your current location or ensure address geocoding was successful.");
            return;
        }

        try {
            setLoading(true);
            // If using current location and address is empty, generate a basic address
            if (usingCurrentLocation && !address) {
                setAddress(`${shopName}, ${city}, ${pincode}`);
            }
            console.log(userId)
            
            const response = await axios.post(`${BACKEND_URL}/shopInfo/${userId}`, {
                name: shopName,
                no: contactNo,
                city,
                address: address || `${shopName}, ${city}, ${pincode}`,
                latitude: locationCoords.latitude,
                longitude: locationCoords.longitude,
                category,
                pincode
            });

            if (response.status === 201) {
                Alert.alert("Success", "Shop information registered successfully!");
                // Navigate to next screen or dashboard
                navigation.reset({
                    index: 0,
                    routes: [{ name: "ShopkeeperTabs" }]
                });
            } else {
                Alert.alert("Error", "Failed to register shop information.");
            }
        } catch (error) {
            console.error("Submit error:", error.response ? error.response.data : error.message);
            Alert.alert("Error", "Failed to save shop information. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle shop registration with multiple steps
    const handleShopRegistration = async () => {
        setLoading(true);
        
        let coordinates = null;
        
        // If not using current location, format address and get coordinates
        if (!usingCurrentLocation) {
            // Step 1: Format address using Gemini
            const formattedAddress = await formatAddress();
            if (!formattedAddress) {
                setLoading(false);
                return;
            }
            
            // Step 2: Get coordinates from formatted address
            coordinates = await getCoordinates(formattedAddress);
            if (!coordinates) {
                setLoading(false);
                return;
            }
        }
        
        // Step 3: Submit all information to backend
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
                onChangeText={setShopName}
            />
            
            <TextInput
                placeholder="Contact No"
                style={styles.input}
                placeholderTextColor="#555"
                keyboardType="phone-pad"
                value={contactNo}
                onChangeText={setContactNo}
            />
            
            <TextInput
                placeholder="Enter Your City"
                style={styles.input}
                placeholderTextColor="#555"
                value={city}
                onChangeText={setCity}
            />
            
            <TextInput
                placeholder="Street No"
                style={styles.input}
                placeholderTextColor="#555"
                value={streetNo}
                onChangeText={setStreetNo}
            />
            
            <TextInput
                placeholder="Landmark near you"
                style={styles.input}
                placeholderTextColor="#555"
                value={landMark}
                onChangeText={setLandMark}
            />
            
            <TextInput
                placeholder="Enter Your City Pincode"
                style={styles.input}
                placeholderTextColor="#555"
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
            />
            
            <TextInput
                placeholder="Full Address (will be auto-filled)"
                style={styles.input}
                placeholderTextColor="#555"
                value={address}
                onChangeText={setAddress}
                multiline
            />

            {/* Shop Category Selection */}
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

            {/* Current Location Button */}
            <Pressable
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={loading}
            >
                <Text style={styles.locationText}>
                    {loading ? "Getting Location..." : "Use Current Location"}
                </Text>
            </Pressable>

            {/* Display current location if available */}
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
                <Text style={styles.continueText}>
                    {loading ? "Processing..." : "Save"}
                </Text>
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
        color: '#005F73'
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
        elevation: 3,
    },
    picker: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
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
        elevation: 4,
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
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#96BFB3',
        elevation: 2,
    },
    continueText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
});