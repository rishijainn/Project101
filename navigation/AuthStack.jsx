import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../Pages/Login';
import Category from '../Pages/Category';
import SignUp from '../Pages/SignUp';
import ShopkeeperSignUp from '../Pages/ShopkeeperSignUp';
import ShopsInfo from '../components/ShopsInfo';
import ForgotPassword from '../components/ForgotPassword';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="category" component={Category}/>
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ShopkeeperSignUp" component={ShopkeeperSignUp} />
      <Stack.Screen name="ShopInfo" component={ShopsInfo} />
      <Stack.Screen name="Forget" component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;