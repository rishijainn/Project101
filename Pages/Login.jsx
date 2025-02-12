import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import LoginContent from '../components/LoginContent';
import ForgotPassword from '../components/ForgotPassword';

const Login = ({ navigation }) => {

  const [isForgotPassword,setIsforgetPassword]=useState(false);
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerCss}>
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subText}>Please log in to continue and get the best from our app</Text>
      </View>

      {/* Form Section */}
     <LoginContent navigation={navigation} setIsforgetPassword={setIsforgetPassword}/>
      
    </View>
  );
};

export default Login;

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
        opacity:0.4
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
