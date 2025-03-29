
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userDetail, setUserDetail] = useState({ id: "", name: "", email: "", userType: "" });
  const [isLoggedIn, setIsLoggedIn] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("name");
        const email = await AsyncStorage.getItem("email");
        const userType = await AsyncStorage.getItem("user");
        const loggedInStatus=await AsyncStorage.getItem("isLoggedIn");
        console.log(id);
        setIsLoggedIn(loggedInStatus?loggedInStatus:false);
        
        setUserDetail({ id, name, email, userType });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail, isLoggedIn,setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);