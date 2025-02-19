import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './Pages/SignUp';
import ShopsInfo from './components/ShopsInfo';
import Login from './Pages/Login';
import ForgotPassword from './components/ForgotPassword';
import Home from './Pages/Home';
import CustomerHomePage from './Pages/CustomerHomePage';
import Profile from './Pages/Profile';
import Category from './Pages/Category';
import ShopkeeperSignUp from './Pages/ShopkeeperSignUp';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // 🔥 Use null to handle loading state

  useEffect(() => {
    Alert.alert("denied");
    const notificationPermission=async()=>{
      const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

      if(granted===PermissionsAndroid.RESULTS.GRANTED){
        fcmTocken();
      }
      else{
         Alert.alert("denied");
      }
    }
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedIn === 'true'); // ✅ Convert string to boolean
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
      }
    };
    notificationPermission();
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const fcmTocken=async()=>{
    const token=await messaging().getToken(); 
    console.log(token);
  }

  // 🔥 Show loading screen while checking login state
  if (isLoggedIn === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={CustomerHomePage} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ShopInfo" component={ShopsInfo} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ShopkeeperSignUp" component={ShopkeeperSignUp} />
            <Stack.Screen name="Forget" component={ForgotPassword} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="category" component={Category} />

            
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={CustomerHomePage} />
            <Stack.Screen name="ShopInfo" component={ShopsInfo} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ShopkeeperSignUp" component={ShopkeeperSignUp} />
            <Stack.Screen name="Forget" component={ForgotPassword} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="category" component={Category} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});
