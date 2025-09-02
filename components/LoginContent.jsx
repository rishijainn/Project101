import { StyleSheet, Text, TextInput, View, Pressable, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../AuthProvider';

const LoginContent = ({navigation, setIsforgetPassword}) => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setloading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const BASE_URL = "https://shoplocalbackend-1.onrender.com";
    const{login}=useAuth();


    const onChangeHandler = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (user) => { 
        try {
            const response = await axios.post(`${BASE_URL}/${user}/login`, form, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("helo")
            await login(response.data.user,user === "Shopkeeper" ? "Shopkeeper" : "customer");
           
            console.log("helo kese ho")
            setloading(false);
             
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            Alert.alert("Login Failed", error.response?.data?.message || "Please check your credentials and try again.");
            setloading(false);
        }
    };

    const EmailValidation = async () => {
        if (!form.email) {
            Alert.alert("Email Required", "Please enter your email address.");
            return;
        }
        
        if (!form.password) {
            Alert.alert("Password Required", "Please enter your password.");
            return;
        }
        
        setloading(true);

        try {
            const userResponse = await axios.get(`${BASE_URL}/user/emailValidation/${form.email}`);
            const shopResponse = await axios.get(`${BASE_URL}/Shopkeeper/emailValidation/${form.email}`);

            if (!userResponse.data.success && !shopResponse.data.success) {
                Alert.alert("Account Not Found", "This email is not registered with us.");
                setloading(false);
                return;
            }

            if (userResponse.data.success && !shopResponse.data.success) {
                onSubmitHandler('user');
            } else if (!userResponse.data.success && shopResponse.data.success) {
                onSubmitHandler('Shopkeeper');
            }
        } catch (error) {
            Alert.alert("Connection Error", `Something went wrong. Please check your connection and try again.${error}`);
            
        }
        setloading(false);
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Login or Sign Up</Text>
            
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Email or Username"
                    style={styles.input}
                    placeholderTextColor="#8A8D91"
                    onChangeText={(value) => onChangeHandler("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#8A8D91"
                    onChangeText={(value) => onChangeHandler("password", value)}
                />
                <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Text style={styles.eyeIconText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Forget")}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Pressable 
                style={styles.continueButton} 
                onPress={EmailValidation}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.continueText}>Continue</Text>
                )}
            </Pressable>

            <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or, log in with</Text>
                <View style={styles.line} />
            </View>

            <Pressable 
                style={styles.googleButton}
                onPress={() => navigation.navigate('ShopInfo')}
            >
                <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <Text 
                    style={styles.signUpLink} 
                    onPress={() => navigation.navigate('category')}
                >
                    Sign up
                </Text>
            </View>
        </View>
    );
};

export default LoginContent;

const styles = StyleSheet.create({
    formContainer: {
        flex: 3,
        backgroundColor: '#F8F9FA',
        padding: 25,
        alignItems: 'center',
    },
    label: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#064635',
        alignSelf: 'center',
    },
    inputWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 60,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        borderRadius: 12,
        color: '#333',
        fontSize: 16,
        elevation: 3,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 20,
    },
    eyeIconText: {
        color: '#064635',
        fontWeight: '600',
    },
    forgotPassword: {
        color: '#005F73',
        textAlign: 'right',
        alignSelf: 'flex-end',
        marginBottom: 25,
        fontSize: 16,
        fontWeight: '500',
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#2D6A4F',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        height: 60,
        justifyContent: 'center',
    },
    continueText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#DADADA',
        marginHorizontal: 10,
    },
    orText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        fontWeight: '600',
    },
    googleButton: {
        width: '100%',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E88E5',
        elevation: 3,
        height: 60,
        justifyContent: 'center',
    },
    googleText: {
        color: '#1E88E5',
        fontWeight: 'bold',
        fontSize: 18,
    },
    signUpContainer: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'center',
    },
    signUpText: {
        color: '#555',
        fontSize: 16,
    },
    signUpLink: {
        color: '#FFC300',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5,
    },
});