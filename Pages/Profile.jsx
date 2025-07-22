import { StyleSheet, Text, View, Pressable, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Card } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../AuthProvider';
import axios from 'axios';

const Profile = ({navigation}) => {
  const { userDetail, updateUserDetail, logout } = useAuth();
  
  // Profile edit state
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // OTP verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');

  // Update form fields when user details change
  useEffect(() => {
    if (userDetail) {
      setEditName(userDetail.name || '');
      setEditEmail(userDetail.email || '');
    }
  }, [userDetail]);

  const navigationOptions = [
    { label: "Active Requests", icon: "assignment", color: "#FF9800" },
    { label: "Edit Profile", icon: "edit", color: "#4CAF50" },
    { label: "About Us", icon: "info", color: "#2196F3" },
    { label: "Legal Policy", icon: "gavel", color: "#9C27B0" },
    { label: "Feedback", icon: "feedback", color: "#009688" },
    { label: "Settings", icon: "settings", color: "#607D8B" },
    { label: "Logout", icon: "logout", color: "#D32F2F" },
  ];

  const handlePreferences = (label) => {
    switch (label) {
      case 'Legal Policy':
        navigation.navigate("Policy");
        break;
      case 'Active Requests':
        navigation.navigate("activeRequest");
        break;
      case 'Edit Profile':
        openEditModal();
        break;
      case 'Logout':
        confirmLogout();
        break;
      case 'About Us':
        navigation.navigate("AboutUs");
        break;
      case 'Feedback':
        navigation.navigate("Feedback");
        break;
      case 'Settings':
        navigation.navigate("Settings");
        break;
      default:
        console.log("Action not implemented yet");
    }
  }

  const openEditModal = () => {
    setEditName(userDetail?.name || '');
    setEditEmail(userDetail?.email || '');
    setModalVisible(true);
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => logout() }
      ]
    );
  };

  const generateOtp = () => {
    let newOtp = '';
    for (let i = 0; i < 4; i++) {
      const digit = Math.floor(Math.random() * 10);
      newOtp += digit.toString();
    }
    return newOtp;
  };

  const validateInputs = () => {
    if (!editName.trim()) {
      Alert.alert("Invalid Input", "Name cannot be empty");
      return false;
    }
    
    if (!editEmail.trim() || !/\S+@\S+\.\S+/.test(editEmail)) {
      Alert.alert("Invalid Input", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateInputs()) return;
    
    setIsSubmitting(true);
    
    try {
      // If email is unchanged, just update the name
      if (editEmail === userDetail.email) {
        await updateProfileWithoutEmailChange();
      } else {
        // If email is changed, we need to verify with OTP
        await sendOtpForEmailVerification();
      }
    } catch (error) {
      handleError(error, "Profile update error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProfileWithoutEmailChange = async () => {
    console.log("Updating profile without email change:", userDetail.id, editName, editEmail);
    
    try {
      const response = await axios.patch(
        `http://10.0.2.2:4000/user/updateUserProfile/${userDetail.id}`,
        { name: editName, email: editEmail }
      );
      console.log(response);
      
      if (response.data.customer) {
        // First update the local state
        console.log("the updated data is","name: ",editName,"email :",editEmail);
        const success = await updateUserDetail({
          name: editName,
          email: editEmail
        });
      
        if (success) {
          setModalVisible(false);
          // Alert.alert("Success", "Your profile has been updated successfully!");
          console.log("sucessfully updated the profile");
        } else {
          Alert.alert("Warning", "Profile updated in database but local state update failed");
        }
      } else {
        Alert.alert("Error", response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const sendOtpForEmailVerification = async () => {
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    console.log(newOtp);
    
    try {
      const otpResponse = await axios.post(
        `http://10.0.2.2:4000/user/emailVerification/${editEmail}/${newOtp}`
      );
      console.log(otpResponse);
      
      if (otpResponse.data.success) {
        setEmailToVerify(editEmail);
        setModalVisible(false);
        setShowOtpModal(true);
      } else {
        Alert.alert("Error", otpResponse.data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("OTP send failed:", error);
      Alert.alert("Error", "Failed to send verification code. Please try again.");
    }
  };

  const handleVerifyEmail = async () => {
    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter a 4-digit verification code.");
      return;
    }
     console.log("the actual otp is",otp, " andt the entered one is ",generatedOtp)
    if (otp != generatedOtp) {
      Alert.alert("Verification Failed", "Invalid verification code. Please try again.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.patch(
        `http://10.0.2.2:4000/user/updateUserProfile/${userDetail.id}`,
        { name: editName, email: emailToVerify, emailVerified: true }
      );
      
      if (response.data.customer) {
        // Update local state
        const success = await updateUserDetail({
          name: editName,
          email: emailToVerify
        });
        
        resetOtpState();
        
        if (success) {
          Alert.alert("Success", "Your email has been verified and profile updated successfully!");
        } else {
          Alert.alert("Warning", "Profile updated in database but local state update failed");
        }
      } else {
        Alert.alert("Error", response.data.message || "Failed to update profile");
      }
    } catch (error) {
      handleError(error, "Profile update error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOtpState = () => {
    setShowOtpModal(false);
    setOtp('');
    setGeneratedOtp('');
    setEmailToVerify('');
  };

  const resendOTP = async () => {
    if (!emailToVerify) return;
    
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://10.0.2.2:4000/user/sendOTP/${userDetail.id}`,
        { email: emailToVerify, otp: newOtp }
      );
      
      if (response.data.success) {
        Alert.alert("Success", `A new verification code has been sent to ${emailToVerify}`);
      } else {
        Alert.alert("Error", response.data.message || "Failed to resend verification code");
      }
    } catch (error) {
      handleError(error, "Resend OTP error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error, prefix = "Error") => {
    console.error(`${prefix}:`, error);
    Alert.alert(
      "Error",
      error.response?.data?.message || "An error occurred. Please try again."
    );
  };

  const closeOtpModal = () => {
    if (!isSubmitting) {
      resetOtpState();
    }
  };

  const closeEditModal = () => {
    if (!isSubmitting) {
      setModalVisible(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      {/* Profile Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitial}>{userDetail?.name?.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{userDetail?.name || 'User'}</Text>
              <Text style={styles.email}>{userDetail?.email || 'No email'}</Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => handlePreferences('Edit Profile')}
            >
              <MaterialIcons name="edit" size={24} color="#4CAF50" />
            </Pressable>
          </View>
        </Card.Content>
      </Card>
      
      {/* Active Requests Button */}
      <Pressable
        style={styles.activeRequestsButton}
        onPress={() => handlePreferences('Active Requests')}
      >
        <MaterialIcons name="assignment" size={24} color="#FFFFFF" />
        <Text style={styles.activeRequestsText}>View Active Requests</Text>
      </Pressable>
      
      {/* Activity Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityBox}>
              <FontAwesome name="search" size={24} color="#4CAF50" />
              <Text style={styles.activityLabel}>Total Searches</Text>
              <Text style={styles.activityValue}>{"0"}</Text>
            </View>
            <View style={styles.activityBox}>
              <MaterialIcons name="chat" size={24} color="#2196F3" />
              <Text style={styles.activityLabel}>Total Responses</Text>
              <Text style={styles.activityValue}>{"0"}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Preferences Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceContainer}>
            {navigationOptions.map((item, index) => (
              <Pressable 
                key={index} 
                style={styles.preferenceButton} 
                onPress={() => handlePreferences(item.label)}
              >
                <MaterialIcons name={item.icon} size={20} color={item.color} />
                <Text style={styles.preferenceText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              editable={!isSubmitting}
            />
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            
            {editEmail !== userDetail?.email && (
              <Text style={styles.noteText}>
                Note: Changing your email will require verification.
              </Text>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSaveChanges}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* OTP Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOtpModal}
        onRequestClose={closeOtpModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Email</Text>
            
            <Text style={styles.verificationText}>
              We've sent a verification code to {emailToVerify}. Please enter the 4-digit code below.
            </Text>
            
            <Text style={styles.inputLabel}>Verification Code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={(text) => {
                // Only allow numbers and limit to 4 digits
                const numericValue = text.replace(/[^0-9]/g, '');
                if (numericValue.length <= 4) {
                  setOtp(numericValue);
                }
              }}
              placeholder="0000"
              keyboardType="number-pad"
              maxLength={4}
              editable={!isSubmitting}
            />
            
            <Pressable onPress={resendOTP} disabled={isSubmitting}>
              <Text style={styles.resendText}>
                Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </Pressable>
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeOtpModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  (isSubmitting || otp.length !== 4) && styles.disabledButton
                ]}
                onPress={handleVerifyEmail}
                disabled={isSubmitting || otp.length !== 4}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Verify Email</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 10,
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
    width: '100%',
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
  editButton: {
    padding: 8,
  },
  activeRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    width: '100%',
    maxWidth: 400,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeRequestsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  noteText: {
    color: '#FF9800',
    marginBottom: 15,
    fontSize: 14,
  },
  verificationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  resendText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  resendLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});