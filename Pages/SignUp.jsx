import { StyleSheet, Text, TextInput, View, Pressable, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import CustomerSignUp from '../components/CustomerSignUp';
import ShopkeeperSignUp from './ShopkeeperSignUp';

const SignUp = ({ route,navigation }) => {

    const userType=route.params.userType;
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerCss}>
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subText}>Sign up to continue and get the best from our app</Text>
            </View>

            {
                userType==='user'?
                <CustomerSignUp navigation={navigation} />:
                <ShopkeeperSignUp navigation={navigation}/>
            }
            

        </View>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    headerCss: {
        flex: 1,
        backgroundColor: '#064635',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
    },
    heading: { fontWeight: 'bold', fontSize: 36, color: '#F8F9FA' },
    subText: { fontSize: 16, color: '#F8F9FA', textAlign: 'center', marginTop: 5 },

    categoryContainer: { flex: 3, alignItems: 'center', padding: 25 },
    label: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#005F73' },
    roleSelection: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
    roleCard: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 5,
    },
    roleText: { marginTop: 10, fontSize: 18, fontWeight: 'bold' },

    formContainer: { flex: 3, padding: 25, alignItems: 'center' },
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
});
