import { StyleSheet, Text, TextInput, View, Pressable, Modal, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ActivityIndicator } from 'react-native-paper';

const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [isUserEmail, setIsUserEmail] = useState(false);
    // const [isShopEmail, setIsShopEmail] = useState(false);
    const [userType, setUserType] = useState('');
    const [ask, setAsk] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(0);
    const [isOtpExpired, setIsOtpExpired] = useState(false);
    const [ShowOtpBox, setShowOtpBox] = useState(false);

    const [generatedOtp, setGenratedOtp] = useState('');
    // const [active, setActive] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [checkPassword, setCheckPassword] = useState({ password: '', confirmPassword: '' });

    const onChangeEmail = (value) => {
        setEmail(value);
        setError(null);
        setSuccessMessage('');
        setTimer(0);
        setIsOtpExpired(false);
    };

    const EmailValidation = async () => {
        setError(null);
        setSuccessMessage('');
        

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        try {
            const userResponse = await axios.get(`http://10.0.2.2:4000/user/emailValidation/${email}`);
            const shopResponse = await axios.get(`http://10.0.2.2:4000/Shopkeeper/emailValidation/${email}`);

            // setIsUserEmail(userResponse.data.success);
            // setIsShopEmail(shopResponse.data.success);

            if (!userResponse.data.success && !shopResponse.data.success) {
                setError("This email is not registered.");
                return;
            }

            if (userResponse.data.success && !shopResponse.data.success) {
                setUserType('user');
                generateOtp('user');
            } else if (!userResponse.data.success && shopResponse.data.success) {
                setUserType('customer');
                generateOtp('customer');
            } else {
                setAsk(true);
            }
        } catch (error) {
            setError("Something went wrong. Please try again later.");
        }
    };

    const verification = () => {
        console.warn(generatedOtp);
        console.warn(otp);
        if (generatedOtp == otp) {
            alert("OTP Verified Successfully!");
            setIsChangePassword(true);
            console.log(isChangePassword)
            setShowOtpBox(false)
        } else {
            alert("Invalid OTP. Please try again.");
        }
    };
    const generateOtp = async (selectedUserType) => {
        setIsLoading(true);
        const generatedOtp = Math.floor(1000 + Math.random() * 9000);
        setOtp(''); // Clear previous OTP
        setTimer(30); // Start the countdown

        try {
            await axios.post(`http://10.0.2.2:4000/${selectedUserType === "customer" ? 'user' : 'shopkeeper'}/emailVerification/${email}/${generatedOtp}`);
            setSuccessMessage("OTP has been sent to your email.");
            setGenratedOtp(generatedOtp);
            setTimeout(() => {
                setShowOtpBox(true); // Ensure state change propagates
            }, 100);
            console.log("ShowOtpBox state:", ShowOtpBox);

        } catch (error) {
            setError("Failed to send OTP. Please try again.");
        }
        setIsOtpExpired(false);
    };


    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        } else if (timer === 0) {
            setIsOtpExpired(true);
            setGenratedOtp('');
            setShowOtpBox(false);
        }
    }, [timer]);


    const handleOtpChange = (value) => {
        setOtp(value);
    };

    const onChangePassword = (name, value) => {
        setCheckPassword(prev => ({ ...prev, [name]: value }));
    };


    const updatePassword = () => {
        setIsLoading(true)
        try {
            axios.patch(`http://10.0.2.2:4000/${userType === "customer" ? 'user' : 'shopkeeper'}/updatePassword/${email}`, { password: checkPassword.confirmPassword });
            setIsLoading(false);
            navigation.navigate("Login");
        } catch {
            Alert.alert("error");
        }

    }
    return (


        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerCss}>
                <Text style={styles.heading}>Welcome</Text>
                <Text style={styles.subText}>Please log in to continue and get the best from our app</Text>
            </View>

            {
                isChangePassword ?
                    (<View style={styles.formContainer}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#007bff" />
                            ) : null}
                        </View>
                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            placeholderTextColor="#555"
                            value={checkPassword.password}
                            onChangeText={(value) => onChangePassword("password", value)}
                        />
                        <TextInput
                            placeholder="Confirm Password"
                            style={styles.input}
                            placeholderTextColor="#555"
                            secureTextEntry
                            value={checkPassword.confirmPassword}
                            onChangeText={(value) => onChangePassword("confirmPassword", value)}
                        />
                        <Pressable
                            style={styles.continueButton}
                            onPress={updatePassword}
                        >
                            <Text style={styles.continueText}>Change Password</Text>

                        </Pressable>

                    </View>) :

                    <View style={styles.formContainer}>

                        
                        <Text style={styles.label}>Enter your Email</Text>
                        <TextInput
                            placeholder="Email address"
                            style={styles.input}
                            placeholderTextColor="#555"
                            value={email}
                            onChangeText={onChangeEmail}
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}
                        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
                        {isLoading&& <ActivityIndicator size="large" color="#007bff" />}

                        {ask && (
                            <View style={styles.userTypeContainer}>
                                <Pressable
                                    style={[styles.userTypeButton, userType === "customer" && styles.userTypeButtonActive]}
                                    onPress={() => {
                                        setUserType("customer");
                                        generateOtp("customer");
                                    }}
                                >
                                    <Text style={styles.userTypeText}>Customer</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.userTypeButton, userType === "shopkeeper" && styles.userTypeButtonActive]}
                                    onPress={() => {
                                        setUserType("shopkeeper");
                                        generateOtp("shopkeeper");
                                    }}
                                >
                                    <Text style={styles.userTypeText}>Shopkeeper</Text>
                                </Pressable>
                            </View>
                        )}

                        {ShowOtpBox && (
                            <View style={styles.overlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.otpLabel}>Enter OTP</Text>

                                    {/* OTP Input */}
                                    <TextInput
                                        placeholder="Enter OTP"
                                        style={styles.OTPinput}
                                        placeholderTextColor="#888"
                                        keyboardType="numeric"
                                        value={otp}
                                        onChangeText={handleOtpChange}
                                    />

                                    {/* Timer */}
                                    <Text style={styles.timerText}>
                                        OTP expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                    </Text>

                                    {/* Verify Button */}
                                    <Pressable
                                        style={styles.modalButton}
                                        onPress={verification}
                                    >
                                        <Text style={styles.modalButtonText}>Verify</Text>
                                    </Pressable>

                                    {/* Close Modal Button */}
                                    <Pressable
                                        style={[styles.modalButton, { backgroundColor: "#D9534F", marginTop: 10 }]}
                                        onPress={() => setShowOtpBox(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Close</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}





                        <Pressable
                            style={styles.continueButton}
                            onPress={isOtpExpired ? () => generateOtp(userType) : EmailValidation}
                        >
                            {
                                generatedOtp ? <Text style={styles.continueText} onPress={verification}>Verify</Text> : null
                            }
                            {
                                generatedOtp ? null : <Text style={styles.continueText}>{isOtpExpired ? "Resend Code" : "Send Code"}</Text>
                            }

                        </Pressable>
                    </View>
            }


        </View>

    );
};

export default ForgotPassword;

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

    userTypeContainer: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, width: '100%',
    },
    userTypeButton: {
        flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#005F73',
        alignItems: 'center', marginHorizontal: 5,
    },
    formContainer: {
        flex: 3,
        backgroundColor: '#F8F9FA',
        padding: 25,
        alignItems: 'center',
    },
    label: { fontSize: 25, fontWeight: 'bold', marginBottom: 15, color: '#005F73' },
    otpContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
        fontSize: 16,
        elevation: 3,
    },
    errorText: { color: 'red', fontSize: 14, marginBottom: 10 },
    successText: { color: 'green', fontSize: 14, marginBottom: 10 },
    timerText: { color: '#FF6347', fontSize: 14, marginTop: 10 },
    otpContainer: { alignItems: 'center', marginBottom: 15 },
    otpLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    otpInputContainer: { flexDirection: 'row', gap: 10 },
    otpBox: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#005F73',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#fff',
        elevation: 3,
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


    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // Ensure it's above everything
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10, // Shadow for Android
    },
    otpLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    OTPinput: {
        width: "100%",
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        textAlign: "center",
    },
    timerText: {
        color: "red",
        marginBottom: 10,
    },
    modalButton: {
        width: "100%",
        backgroundColor: "#064635",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

});
