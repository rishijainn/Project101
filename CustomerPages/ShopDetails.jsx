import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Platform ,BackHandler} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation,useFocusEffect } from '@react-navigation/native';

const ShopDetails = ({ route }) => {
    const navigation = useNavigation();
    const {selectedItem} = route.params;
    console.log(selectedItem);
    const ShopName = selectedItem.shopName;
    const ShopKeeperName = selectedItem.shopKeeperName;
    const address = selectedItem.shopAddress;
    const openTime = '8:00 Am';
    const CloseTime = '10:00 Pm';
    const latitude = selectedItem.lat;
    const longitude = selectedItem.lon;
    const deliveryCost = selectedItem.deliveryCost;

  const isOpen = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes(); 
    
    const openHours = parseInt(openTime.split(':')[0]);
    const openMinutes = parseInt(openTime.split(':')[1]);
    
    const closeHours = parseInt(CloseTime.split(':')[0]);
    const closeMinutes = parseInt(CloseTime.split(':')[1]);
    
    const currentTime = currentHours * 60 + currentMinutes;
    const openTimeMinutes = openHours * 60 + openMinutes;
    const closeTimeMinutes = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to Home when back button is pressed
        navigation.navigate('CustomerTabs');
        return true; // Prevents default back behavior
      };
      
      // Add event listener for back button
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Clean up on unmount
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = ShopName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    Linking.openURL(url);
  };

  const callShop = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const goToHome = () => {
    navigation.navigate('CustomerTabs');
  };

  return (
    <View style={styles.container}>
      {/* Back Button Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goToHome}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Details</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.shopNameText}>{ShopName}</Text>
          <View style={styles.timingContainer}>
            <Icon name="access-time" size={18} color="#555" />
            <Text style={styles.timingText}>{openTime} - {CloseTime}</Text>
          </View>
        </View>
        
        {/* Shop Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon name="person" size={22} color="#4a6572" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Shop Owner</Text>
              <Text style={styles.detailValue}>{ShopKeeperName}</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <Icon name="location-on" size={22} color="#4a6572" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{address}</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <FontAwesome name="truck" size={20} color="#4a6572" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>
                {deliveryCost > 0 ? `Available (₹${deliveryCost})` : 'Not Available'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={openMaps}
          >
            <Icon name="directions" size={20} color="#fff" />
            <Text style={styles.buttonText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => callShop('1234567890')} // Replace with actual phone from params
          >
            <Icon name="call" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
        </View>
        
        {/* Map Preview */}
        <View style={styles.mapPreviewContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.mapPreview} onPress={openMaps}>
            {/* You would ideally use a proper map component here */}
            <View style={styles.mapPlaceholder}>
              <Icon name="map" size={40} color="#4a6572" />
              <Text style={styles.mapText}>Tap to open in Maps</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShopDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  shopStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shopStatusText: {
    fontWeight: 'bold',
    color: '#4caf50',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  shopNameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  detailsCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#4caf50',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  mapPreviewContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  mapPreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1f5fe',
  },
  mapText: {
    marginTop: 8,
    color: '#4a6572',
  }
});