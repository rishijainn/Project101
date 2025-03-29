import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerHomePage from '../Pages/CustomerHomePage';
import Request from '../Pages/Request';
import Profile from '../Pages/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons

const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'CustomerHomeTab') {
            iconName = 'home-outline';
          } else if (route.name === 'Request') {
            iconName = 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="CustomerHomeTab" 
        component={CustomerHomePage} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="Request" 
        component={Request} 
        options={{ tabBarLabel: 'Requests' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile} 
        options={{ tabBarLabel: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;
