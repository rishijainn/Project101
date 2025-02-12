import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';

const CustomerSignUp = ({ navigation }) => {
    const [isGenerated, setIsGenerated] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [enteredOtp, setEnteredOtp] = useState("");
    const [userType, setUserType] = useState(null); // Default selection

    const onChangeHandler = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    useEffect(()=>{

    },[userType])

    const generateOtp = () => {
        const generatedOtp = Math.floor(1000 + Math.random() * 9000);
        setOtp(generatedOtp);
        axios.post(`http://10.0.2.2:4000/${userType==="customer"?'user':'Shopkeeper'}/emailVerification/${form.email}/${generatedOtp}`)
            .then(() => setIsGenerated(true))
            .catch(error => console.error("OTP Error:", error));
    };

    const verification = () => {
        if (enteredOtp == otp) {
            setIsVerified(true);
            alert("OTP Verified Successfully!");
        } else {
            alert("Invalid OTP. Please try again.");
        }
    };

    const onSubmit = () => {
        axios.post(`http://10.0.2.2:4000/${userType==="customer"?'user':'Shopkeeper'}/signUp`, 
            JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                userType: userType,  // Send userType to backend
            }), 
            {
                headers: { 
                    "Content-Type": "application/json"
                }
            }
        )
        .then((response) => {
            console.log("Signup Response:", response.data);
            alert(response.data.message);
            if(userType=="customer"){
                navigation.navigate("Home");
            }
            else{
                navigation.navigate("ShopInfo");
            }
            
        })
        .catch(error => {
            console.error("Signup Error:", error.response ? error.response.data : error.message);
            alert(error.response?.data?.message || "Signup failed. Please try again.");
        });
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Sign Up</Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
                <Pressable 
                    style={[styles.userTypeButton, userType === "customer" && styles.userTypeButtonActive]} 
                    onPress={() => setUserType("customer")}
                >
                    <Text style={styles.userTypeText}>Customer</Text>
                </Pressable>

                <Pressable 
                    style={[styles.userTypeButton, userType === "shopkeeper" && styles.userTypeButtonActive]} 
                    onPress={() => setUserType("shopkeeper")}
                >
                    <Text style={styles.userTypeText}>Shopkeeper</Text>
                </Pressable>
            </View>

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

            <View style={styles.otpContainer}>
                <TextInput
                    placeholder="Enter OTP"
                    style={[styles.input, { flex: 1 }]}
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    onChangeText={(value) => setEnteredOtp(value)}
                />

                <Pressable style={styles.otpButton} onPress={generateOtp}>
                    <Text style={styles.otpButtonText}>Generate OTP</Text>
                </Pressable>
            </View>

            {isGenerated && (
                <Pressable style={styles.verifyButton} onPress={verification}>
                    <Text style={styles.verifyButtonText}>Verify OTP</Text>
                </Pressable>
            )}

            <Pressable
                style={[styles.signUpButton, isVerified ? styles.signUpButtonActive : styles.signUpButtonDisabled]}
                onPress={onSubmit}
                disabled={!isVerified}
            >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
            </Pressable>
        </View>
    )
}

export default CustomerSignUp;

const styles = StyleSheet.create({
    container: {
        flex: 3, alignItems: 'center', padding: 25 
    },
    heading: {
        fontSize: 22, fontWeight: 'bold', color: '#005F73', textAlign: 'center', marginBottom: 15,
    },
    userTypeContainer: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, width: '100%',
    },
    userTypeButton: {
        flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#005F73',
        alignItems: 'center', marginHorizontal: 5,
    },
    userTypeButtonActive: {
        backgroundColor: '#FFB300',
        opacity:0.4
    },
    userTypeText: {
        fontSize: 16, fontWeight: 'bold', color: '#333',
    },
    input: {
        width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff',
        paddingHorizontal: 15, borderRadius: 10, marginBottom: 12, color: '#333', fontSize: 16, elevation: 2,
    },
    otpContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15,
    },
    otpButton: {
        backgroundColor: '#2D6A4F', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10,
        marginLeft: 10, alignItems: 'center', justifyContent: 'center', elevation: 3,
    },
    otpButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    verifyButton: {
        width: '100%', backgroundColor: '#40916C', padding: 15, borderRadius: 10,
        alignItems: 'center', marginTop: 10, elevation: 3,
    },
    verifyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    signUpButton: {
        width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, elevation: 3,
    },
    signUpButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    signUpButtonActive: { backgroundColor: '#2D6A4F' },
    signUpButtonDisabled: { backgroundColor: '#A5A5A5' },
});
