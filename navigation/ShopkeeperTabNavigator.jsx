import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ShopkeeperHomePage from '../Pages/ShopkeeperHomePage';
import ShopkeepersRequestPage from '../Pages/ShopkeepersRequestPage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import icons

const Tab = createBottomTabNavigator();

const ShopkeeperTabNavigator = () => {
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
          if (route.name === 'ShopkeeperHomeTab') {
            iconName = 'home-outline';
          } else if (route.name === 'Request') {
            iconName = 'list-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="ShopkeeperHomeTab" 
        component={ShopkeeperHomePage} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="Request" 
        component={ShopkeepersRequestPage} 
        options={{ tabBarLabel: 'Requests' }} 
      />
    </Tab.Navigator>
  );
};

export default ShopkeeperTabNavigator;
