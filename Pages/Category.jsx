import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';

const Category = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Who are you?</Text>
      <Text style={styles.subText}>Choose your role to continue</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('CustomerSignup')}>
        <Text style={styles.buttonText}>I am a Customer</Text>
      </Pressable>

      <Pressable style={styles.buttonShopkeeper} onPress={() => navigation.navigate('ShopkeeperSignUp')}>
        <Text style={styles.buttonText}>I am a Shopkeeper</Text>
      </Pressable>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  button: {
    width: '90%',
    backgroundColor: '#2D6A4F',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  buttonShopkeeper: {
    width: '90%',
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
