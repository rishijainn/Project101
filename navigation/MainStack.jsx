import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerTabNavigator from './CustomerTabNavigator';
import ShopkeeperTabNavigator from './ShopkeeperTabNavigator';
import CustomerHomePage from '../Pages/CustomerHomePage';
import ShopkeeperHomePage from '../Pages/ShopkeeperHomePage';
import AddRequest from '../Pages/AddRequest';
import Request from '../Pages/Request';
import Profile from '../Pages/Profile';
import ShopsInfo from '../components/ShopsInfo';
import Category from '../Pages/Category';
import Login from '../Pages/Login';
import LegalPolicy from '../CustomerPages/LegalPolicy';

const Stack = createStackNavigator();

const MainStack = ({ userType }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'customer' ? (
        <>
          <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
          <Stack.Screen name="Home" component={CustomerHomePage} />
          <Stack.Screen name="AddReq" component={AddRequest} />
          <Stack.Screen name="Request" component={Request} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ShopInfo" component={ShopsInfo} />
          <Stack.Screen name="category" component={Category} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Policy" component={LegalPolicy}/>
        </>
      ) : (
        <>
          <Stack.Screen name="ShopkeeperTabs" component={ShopkeeperTabNavigator} />
          <Stack.Screen name="ShHome" component={ShopkeeperHomePage} />
          <Stack.Screen name="AddReq" component={AddRequest} />
          <Stack.Screen name="Request" component={Request} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ShopInfo" component={ShopsInfo} />
          <Stack.Screen name="Login" component={Login} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainStack;