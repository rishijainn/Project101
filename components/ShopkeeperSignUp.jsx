import { StyleSheet, Text, TextInput, View, Pressable, PermissionsAndroid, Platform, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Picker } from '@react-native-picker/picker';

const ShopkeeperSignUp = ({navigation}) => {
    const [location, setLocation] = useState(null);
    const [category, setCategory] = useState('');
    const [shopName, setShopName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');

    // Request Location Permission (Android)
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Access Required',
                        message: 'This app needs to access your location',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Location permission granted');
                    getLocation();
                } else {
                    console.log('Location permission denied');
                    Alert.alert('Permission Denied', 'Location access is required for accurate shop location.');
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            getLocation(); // iOS handles permissions automatically
        }
    };

    // Get Current Location
    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log('Location received:', position.coords);
                setLocation(position.coords);
            },
            (error) => {
                console.warn('Error getting location:', error);
                Alert.alert('Error', 'Failed to get location. Please ensure GPS is enabled.');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        requestLocationPermission(); // Ask for permission on component mount
    }, []);

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
                placeholder="Address"
                style={styles.input}
                placeholderTextColor="#555"
                value={address}
                onChangeText={setAddress}
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

            {/* Display Current Location */}
            {location && (
                <Text style={styles.locationText}>
                    Latitude: {location.latitude} | Longitude: {location.longitude}
                </Text>
            )}

            <Pressable
                style={styles.locationButton}
                onPress={getLocation} // Fetch location when pressed
            >
                <Text style={styles.continueText}>Get Current Location</Text>
            </Pressable>

            <Pressable
                style={styles.continueButton}
                onPress={() => console.log('Sign-Up Data:', { shopName, contactNo, city, address, category, location })}
            >
                <Text style={styles.continueText} onPress={() => navigation.navigate('SignUp')}>Sign Up</Text>
            </Pressable>
        </View>
    );
};

export default ShopkeeperSignUp;

const styles = StyleSheet.create({
    formContainer: { flex: 1, padding: 25, alignItems: 'center', backgroundColor: '#F8F9FA' },
    label: { fontSize: 35, fontWeight: 'bold', marginBottom: 20, color: '#005F73' },
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
    locationText: { fontSize: 16, marginVertical: 10, color: '#005F73' },
    locationButton: {
        width: '100%',
        backgroundColor: '#ff9f00',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 4,
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#2D6A4F',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    continueText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
