import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './AuthProvider';
import { UserProvider } from './UserProvider';
import MainStack from './navigation/MainStack';
import AuthStack from './navigation/AuthStack';
import EncryptedStorage from 'react-native-encrypted-storage';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const AppContent = () => {
  const { isLoggedIn, userType, loading, userDetail,setNotificationCount } = useAuth();

 
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Notification permission granted");
          updateFcmToken();
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };


    requestNotificationPermission();
  }, []);


  // Update FCM Token on User Change
  useEffect(() => {
    if (userDetail?.id) {
      updateFcmToken();
      console.log("the user detail  from appCOntent line 43 is ",userDetail)
    }
  }, [userDetail?.id]);

  // Handle Incoming Notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      setNotificationCount((prev)=>prev+1)
      Alert.alert("New Notification", JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // Update FCM Token Function
  const updateFcmToken = async () => {
  try {
    if (!userDetail?.id) {
      console.log("User not logged in, skipping FCM token update");
      return;
    }

    const newToken = await messaging().getToken();
    if (!newToken) {
      console.warn("FCM token is null. Skipping update.");
      return;
    }

    await EncryptedStorage.setItem("fcm", newToken);

    const endpoint = userDetail.userType?.toLowerCase() === "shopkeeper" ? "Shopkeeper" : "user";
    console.log(userDetail.id);
    const response = await axios.post(
      `http://10.0.2.2:4000/${endpoint}/setFcm/${userDetail.id}`,
      { fcmToken: newToken }
    );

    console.log("✅ FCM token updated successfully:", response);
  } catch (error) {
    console.error("❌ Error updating FCM token:", error);
  }
};


  // Show Loader While Auth State is Loading
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer key={isLoggedIn ? 'main' : 'auth'}>
        {isLoggedIn ? <MainStack userType={userType} /> : <AuthStack />}
      </NavigationContainer>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});

export default AppContent;
