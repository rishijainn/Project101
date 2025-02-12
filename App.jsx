
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './Pages/SignUp';
import ShopkeeperSignUp from './components/ShopkeeperSignUp';
import Login from './Pages/Login'
import ForgotPassword from './components/ForgotPassword';
import Home from './Pages/Home';

const Stack = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ShopInfo" component={ShopkeeperSignUp}/>
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Forget" component={ForgotPassword}/>
      <Stack.Screen name="Home" component={Home}/>
     
        
      </Stack.Navigator>
    </NavigationContainer>
  )
  
}

export default App

const styles = StyleSheet.create({})
