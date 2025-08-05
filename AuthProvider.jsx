import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState({ id: "", name: "", email: "", userType: "" });
  const[notificationCount,setNotificationCount]=useState(0);
  const [review,setReview]=useState(null);

  
  useEffect(() => {
    checkLoginStatus();
    // checkForPendingReview();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      const user = await AsyncStorage.getItem('user');
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("name");
      const email = await AsyncStorage.getItem("email");
      console.log("Current stored values:", id, name, email);
      if(loggedIn==='true'){
        checkForPendingReview(id);
      }
      setUserDetail({ id, name, email, userType: user });
      setUserType(user); 
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    } finally { 
      setLoading(false);
    }
  };
   const checkForPendingReview=async(userId)=>{
      try{
        console.log(userId ,"hello")
        const response=await axios.get(`http://10.0.2.2:4000/review/not-reviewed/${userId}`);
        console.log(response); 
        console.log("chekcing for pending review");
        if(response.data.response.length>0){
          setReview(1);
        }
  
      }catch(error){
        console.log(error);
      }
    }

  const login = async (userData, type) => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true'); 
      await AsyncStorage.setItem('user', type);
      await AsyncStorage.setItem('userId', userData._id || '');
      await AsyncStorage.setItem('name', userData.name || '');
      await AsyncStorage.setItem('email', userData.email || '');
      
      const newUserDetail = { 
        id: userData._id || '',
        name: userData.name || '',
        email: userData.email || '',
        userType: type
      };
      
      console.log("Login setting user details:", newUserDetail);
      setUserDetail(newUserDetail);
      setIsLoggedIn(true);
      setUserType(type);
    } catch (error) {
      console.error('Error setting login data:', error);
    }
  };

  const updateUserDetail = async (newUserDetail) => {
    try {
      console.log("Updating user details to:", newUserDetail);
      
      // Create updated user object
      const updatedUser = {
        ...userDetail,
        ...newUserDetail
      };
      
      // Update AsyncStorage with new user details
      if (newUserDetail.name) {
        await AsyncStorage.setItem('name', newUserDetail.name);
      }
      if (newUserDetail.email) {
        await AsyncStorage.setItem('email', newUserDetail.email);
      }
      
      // Force update the state with new object reference
      setUserDetail({...updatedUser});
      
      console.log("User details after update:", updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user details:', error);
      return false;
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
        checkLoginStatus,
        updateUserDetail,
        setNotificationCount,
        notificationCount,
        review,
        setReview
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);