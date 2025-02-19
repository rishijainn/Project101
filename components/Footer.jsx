import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Footer = ({ navigation ,userDetail}) => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
        <FontAwesome name="home" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Requests')} style={styles.iconButton}>
        <Ionicons name="list" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile',{name:userDetail.name,email:userDetail.email})} style={styles.iconButton}>
        <FontAwesome name="user" size={28} color="white" />
      </TouchableOpacity>
    
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf:"center",
    backgroundColor: '#064635',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#333', // Darker border for a seamless look
  },
  iconButton: {
    padding: 10,
  },
});
