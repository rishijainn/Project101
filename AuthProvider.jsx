import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState({ id: "", name: "", email: "", userType: "" });

  // Check login status on mount
  useEffect(() => {
    checkLoginStatus();
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      const user = await AsyncStorage.getItem('user');
      
      // Fetch user details
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("name");
      const email = await AsyncStorage.getItem("email");
      console.log(id,name,email);
      
      setUserDetail({ id, name, email, userType: user });
      setUserType(user);
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, type) => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', type);
      await AsyncStorage.setItem('userId', userData._id || '');
      await AsyncStorage.setItem('name', userData.name || '');
      await AsyncStorage.setItem('email', userData.email || '');
      
      setUserDetail({
        id: userData.userId || '',
        name: userData.name || '',
        email: userData.email || '',
        userType: type
      });
      
      setIsLoggedIn(true);
      setUserType(type);
    } catch (error) {
      console.error('Error setting login data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('name');
      await AsyncStorage.removeItem('email');
      
      setIsLoggedIn(false);
      setUserType('');
      setUserDetail({ id: "", name: "", email: "", userType: "" });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        userType, 
        loading, 
        userDetail,
        login, 
        logout, 
        checkLoginStatus 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);