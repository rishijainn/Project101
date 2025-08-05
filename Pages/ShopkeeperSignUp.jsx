import { StyleSheet, Text, TextInput, View, Pressable, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Modal } from 'react-native-paper';

const CustomerSignUp = ({ navigation }) => {
    const [isGenerated, setIsGenerated] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", ConfirmPassword: "" });
    const [otp, setOtp] = useState("");
    const [enteredOtp, setEnteredOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let interval;
        if (isModalVisible && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTime => prevTime - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
            setIsModalVisible(false);
        }
        return () => clearInterval(interval);
    }, [isModalVisible, timer]);

    const onChangeHandler = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const generateOtp = async () => {
        if (form.password !== form.ConfirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        setIsLoading(true);
    
        try {
            const response = await axios.get(`http://10.0.2.2:4000/Shopkeeper/emailValidation/${form.email}`);
            console.log(response.data.success,"value")
            if (response.data.success) {
                Alert.alert("User already exists");
                setForm({ name: "", email: "", password: "", ConfirmPassword: "" });
                setIsLoading(false); // 🛠 **Move this here**
                return;
            }
    
            const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
            setOtp(generatedOtp);
    
            await axios.post(`http://10.0.2.2:4000/Shopkeeper/emailVerification/${form.email}/${generatedOtp}`);
            setIsGenerated(true);
            setIsModalVisible(true);
            setTimer(30);
        } catch (error) {
            console.error("OTP Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const verification = async () => {
        if (enteredOtp.trim() === otp.trim()) {
            setIsVerified(true);
            setIsModalVisible(false);
            await onSubmit();
            Alert.alert("Success", "OTP Verified Successfully!");
             
        } else {
            Alert.alert("Error", "Invalid OTP. Please try again.");
        }
    };

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `http://10.0.2.2:4000/Shopkeeper/SignUp`,
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            console.log("Signup Response:", response.data);
            Alert.alert("Success", response.data.message);

            await AsyncStorage.multiSet([
                ["isLoggedIn", "true"],
                ["user", "customer"],
                ["userId", response.data.user._id],
                ["name", response.data.user.name],
                ["email", response.data.user.email],
                ["shopInfo",'false']
            ]);

            navigation.navigate("ShopInfo");
        } catch (error) {
            console.error("Signup Error:", error.response ? error.response.data : error.message);
            Alert.alert("Error", error.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            
            <Text style={styles.heading}>Sign Up</Text>

            <TextInput
                placeholder="Username"
                style={styles.input}
                placeholderTextColor="#888"
                onChangeText={(value) => onChangeHandler("name", value)}
            />
            <TextInput
                placeholder="Email"
                style={styles.input}
                placeholderTextColor="#888"
                keyboardType="email-address"
                onChangeText={(value) => onChangeHandler("email", value)}
            />
            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#888"
                onChangeText={(value) => onChangeHandler("password", value)}
            />
            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#888"
                onChangeText={(value) => onChangeHandler("ConfirmPassword", value)}
            />

            {isLoading && <ActivityIndicator size="large" color="#007bff" />}

            <Pressable
                style={[styles.signUpButton, styles.signUpButtonActive]}
                onPress={generateOtp}
            >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
            </Pressable>

            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>OTP Verification</Text>
                        <Text style={styles.modalSubtitle}>Enter the OTP sent to your email</Text>

                        <TextInput
                            placeholder="Enter OTP"
                            style={styles.otpInput}
                            placeholderTextColor="#888"
                            keyboardType="numeric"
                            onChangeText={(value) => setEnteredOtp(value)}
                        />

                        <Text style={styles.timerText}>Time left: {timer}s</Text>

                        <Pressable style={styles.verifyButton} onPress={verification}>
                            <Text style={styles.verifyButtonText}>Verify OTP</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default CustomerSignUp;

const styles = StyleSheet.create({
    container: {
        flex: 3, alignItems: 'center', padding: 25
    },
    heading: {
        fontSize: 22, fontWeight: 'bold', color: '#005F73', textAlign: 'center', marginBottom: 15,
    },
    input: {
        width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
        paddingHorizontal: 15, borderRadius: 10, marginBottom: 12, color: '#333', fontSize: 16, elevation: 2,
    },
    signUpButton: {
        width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, elevation: 3,
    },
    signUpButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    signUpButtonActive: { backgroundColor: '#2D6A4F' },

   // Updated styles for the first code to match the second one
modalContainer: {
    width: 400,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    alignSelf: "center"
},
modalContent: {
    width: '85%', 
    backgroundColor: '#fff', 
    padding: 25, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5,
},
modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#005F73', 
    marginBottom: 10 
},
otpInput: { 
    width: '90%', 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 18, 
    textAlign: 'center' 
},
timerText: { 
    fontSize: 16, 
    color: '#FF5733', 
    marginBottom: 15, 
    fontWeight: 'bold' 
},
verifyButton: { 
    width: '90%', 
    backgroundColor: '#40916C', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
},
verifyButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
},
});