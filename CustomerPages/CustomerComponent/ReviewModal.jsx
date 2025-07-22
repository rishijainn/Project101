import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { useAuth } from '../../AuthProvider';

const ReviewModal = ({ visible = true, onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userDetail} = useAuth();
  console.log("called");

  const AddReview = async () => {
    // try {
    //   setIsLoading(true);
    //   const response = await axios.post(`http://10.0.2.2:4000/review/reviewShop`, {
    //     customerId: userDetail.id,
    //     shopId: shopId,
    //     rating: rating,
    //     review: review,
    //     name: name
    //   });
    //   console.log('Review submitted:', response.data);
      
      
    //   // Reset form
    //   resetForm();
      
    //   // Reset the Review state in auth context
    //   if (setAuthReview) {
    //     setAuthReview(0);
    //   }
      
    //   // Close modal
    //   if (onClose) {
    //     onClose();
    //   }
      
    //   Alert.alert('Success', 'Your review has been submitted successfully!');
    // } catch (error) {
    //   console.error('Error submitting review:', error);
    //   Alert.alert('Error', 'Failed to submit review. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
    console.log("hello")
  };

  const resetForm = () => {
    setRating(0);
    setReview('');
    setName('');
  };

  const handleSubmit = () => {
    if (!rating || !review.trim()) {
      Alert.alert('Incomplete', 'Please provide a rating and review.');
      return;
    }
    AddReview();
  };

  const handleClose = () => {
    resetForm();
    
    // Reset the Review state in auth context
    if (setAuthReview) {
      setAuthReview(0);
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <AntDesign name="close" size={24} color="#555" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Leave a Review</Text>
          
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={isLoading}
              >
                <AntDesign
                  name={rating >= star ? "star" : "staro"}
                  size={32}
                  color={rating >= star ? "#FFD700" : "#CCCCCC"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your review here..."
            value={review}
            onChangeText={setReview}
            multiline={true}
            numberOfLines={4}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[
              styles.button, 
              ((!rating || !review.trim()) || isLoading) && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!rating || !review.trim() || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});