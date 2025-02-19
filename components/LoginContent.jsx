import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';


const LoginContent = ({navigation,setIsforgetPassword}) => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [isLoading,setIsLoding]=useState(false);
    const BASE_URL = "http://10.0.2.2:4000";

    const onChangeHandler = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (user) => {
        try {
            const response = await axios.post(`${BASE_URL}/${user}/login`, form, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Login Response:", response.data);
            alert("Login Successful!");
            await AsyncStorage.multiSet([
                ["isLoggedIn", "true"],
                ["user", "customer"],
                ["userId", response.data.user._id],
                ["name", response.data.user.name],
                ["email", response.data.user.email]
            ]);
            
            navigation.replace("Home"); // ✅ Ensures user can't navigate back to Login
            setIsLoding(false);
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    const EmailValidation = async () => {
        setIsLoding(true);
        if (!form.email) {
            Alert.alert("Please enter your email.");
            return;
        }

        try {
            const userResponse = await axios.get(`http://10.0.2.2:4000/user/emailValidation/${form.email}`);
            const shopResponse = await axios.get(`http://10.0.2.2:4000/Shopkeeper/emailValidation/${form.email}`);

            // setIsUserEmail(userResponse.data.success);
            // setIsShopEmail(shopResponse.data.success);

            if (!userResponse.data.success && !shopResponse.data.success) {
                Alert.alert("This email is not registered.");
                return;
            }

            if (userResponse.data.success && !shopResponse.data.success) {
                onSubmitHandler('user');
            } else if (!userResponse.data.success && shopResponse.data.success) {
                onSubmitHandler('Shopkeeper');
            }
            
        } catch (error) {
            Alert.alert("Something went wrong. Please try again later.");
        }
        
    };
    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Login or Sign Up</Text>

            
            <TextInput
                placeholder="Email or Username"
                style={styles.input}
                placeholderTextColor="#555"
                onChangeText={(value) => onChangeHandler("email", value)}
            />

            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry={true}
                placeholderTextColor="#555"
                onChangeText={(value) => onChangeHandler("password", value)}
            />

            <Text style={styles.forgotPassword} onPress={() => navigation.navigate("Forget")}>Forgot Password?</Text>
            {isLoading && <ActivityIndicator size="large" color="#007bff" />}
            <Pressable style={styles.continueButton} onPress={EmailValidation}>
                <Text style={styles.continueText}>Continue</Text>
            </Pressable>

            {/* OR Section */}
            <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or, log in with</Text>
                <View style={styles.line} />
            </View>

            {/* Google Login Button */}
            <Pressable style={styles.googleButton}>
                <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <Text style={styles.signUpLink} onPress={() => navigation.navigate('category')}> Sign up</Text>
            </View>
        </View>
    )
}

export default LoginContent
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    headerCss: {
        flex: 1,
        backgroundColor: '#064635',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
    },
    heading: { fontWeight: 'bold', fontSize: 36, color: '#F8F9FA' },
    subText: { fontSize: 16, color: '#F8F9FA', textAlign: 'center', marginTop: 5 },

    formContainer: {
        flex: 3,
        backgroundColor: '#F8F9FA',
        padding: 25,
        alignItems: 'center',
    },
    label: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#005F73' },

    userTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    userTypeButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#2D6A4F',
        borderRadius: 10,
        alignItems: 'center',
    },
    userTypeButtonActive: {
        backgroundColor: '#FFB300',
        opacity: 0.4
    },
    userTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D6A4F',
    },

    input: {
        width: '100%',
        height: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 15,
        color: '#333',
        fontSize: 16,
        elevation: 3,
    },

    forgotPassword: { color: '#005F73', textAlign: 'right', alignSelf: 'flex-end', marginBottom: 15, fontSize: 16 },

    continueButton: {
        width: '100%',
        backgroundColor: '#2D6A4F',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
    },
    continueText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
        marginHorizontal: 10,
    },
    orText: { textAlign: 'center', fontSize: 16, color: '#555', fontWeight: '600' },

    googleButton: {
        width: '100%',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E88E5',
        elevation: 3,
    },
    googleText: { color: '#1E88E5', fontWeight: 'bold', fontSize: 18 },

    signUpContainer: { flexDirection: 'row', marginTop: 25 },
    signUpText: { color: '#333', fontSize: 16 },
    signUpLink: { color: '#FFC300', fontWeight: 'bold', fontSize: 16 },
});