import { StyleSheet, Text, View, Pressable,ScrollView } from 'react-native';
import React from 'react';
import { Card } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../AuthProvider';

const Profile = ({navigation}) => {
  const {userDetail}=useAuth();

  const handlePreferences=(lable)=>{
    if(lable==='Legal Policy'){
      navigation.navigate("Policy");
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      {/* Profile Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitial}>{userDetail.name?.charAt(0)}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{userDetail.name}</Text>
              <Text style={styles.email}>{userDetail.email}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Activity Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityBox}>
              <FontAwesome name="search" size={24} color="#4CAF50" />
              <Text style={styles.activityLabel}>Total Searches</Text>
              <Text style={styles.activityValue}>{ "_ _"}</Text>
            </View>
            <View style={styles.activityBox}>
              <MaterialIcons name="chat" size={24} color="#2196F3" />
              <Text style={styles.activityLabel}>Total Responses</Text>
              <Text style={styles.activityValue}>{"_ _"}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Preferences Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceContainer}>
            {[
              { label: "Edit Profile", icon: "edit" },
              { label: "About Us", icon: "info" },
              { label: "Legal Policy", icon: "gavel" },
              { label: "Feedback", icon: "feedback" },
              { label: "Settings", icon: "settings" },
              { label: "Logout", icon: "logout", color: "#D32F2F" },
            ].map((item, index) => (
              <Pressable key={index} style={styles.preferenceButton} onPress={()=>{handlePreferences(item.label)}}>
                <MaterialIcons name={item.icon} size={20} color={item.color || "#333"} />
                <Text style={styles.preferenceText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card.Content>
      </Card>
    
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInitial: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityBox: {
    backgroundColor: '#E8F5E9',
    width: '48%',
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  activityLabel: {
    fontSize: 14,
    color: '#333',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  preferenceContainer: {
    marginTop: 10,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  preferenceText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});
