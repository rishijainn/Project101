import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform, StatusBar, Image, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../AuthProvider';
import EncryptedStorage from 'react-native-encrypted-storage';
import ReviewModal from '../CustomerPages/CustomerComponent/ReviewModal';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Updated color palette with vibrant blue as primary color
const colors = {
  primary: '#2B78E4',    // Vibrant blue primary color
  secondary: '#1D5BBF',  // Darker blue for contrast
  accent: '#FF9500',     // Warm orange accent
  tertiary: '#8E44AD',   // Purple for variety
  light: '#F4F7FC',      // Light blue/gray background
  white: '#FFFFFF',      // Clean white UI elements
  lightText: '#6B7280',  // Medium gray for secondary text
  darkText: '#1F2937',   // Dark text for primary text
  success: '#34C759',    // Success color
  neutral: '#9CA3AF',    // Medium gray
};

const categories = [
  { id: '1', name: "Electronics", icon: "phone-portrait-outline", color: colors.primary },
  { id: '2', name: "Groceries", icon: "basket-outline", color: colors.tertiary },
  { id: '3', name: "Clothing", icon: "shirt-outline", color: colors.accent },
  // { id: '4', name: "Home", icon: "home-outline", color: colors.secondary },
  // { id: '5', name: "Others", icon: "ellipsis-horizontal-outline", color: colors.primary }
];

const featuredCards = [
  { 
    id: '1', 
    title: 'Daily Essentials',
    description: 'Find everything you need for your daily routine',
    color: colors.primary,
    icon: 'calendar-outline'
  },
  { 
    id: '2', 
    title: 'Flash Deals',
    description: 'Limited time offers from local shops',
    color: colors.accent,
    icon: 'flash-outline'
  },
  { 
    id: '3', 
    title: 'Popular Items',
    description: 'Most requested items near you',
    color: colors.tertiary,
    icon: 'trending-up-outline'
  },
  { 
    id: '4', 
    title: 'Seasonal Offers',
    description: 'Special discounts for this season',
    color: colors.secondary,
    icon: 'leaf-outline'
  }
];

const CustomerHomePage = ({ navigation }) => {
  const { userDetail, logout, notificationCount, setNotificationCount, Review, setReview } = useAuth();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleAddRequest = () => {
    navigation.navigate("AddReq", { id: userDetail.id });
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (cardWidth + 20));
    setActiveCardIndex(index);
  };

  const handleCloseReviewModal = () => {
    if (setReview) {
      setReview(0);
    }
  };

  const renderFeaturedCard = ({ item, index }) => (
    <Pressable
      style={styles.cardContainer}
      onPress={() => {
        // Handle card press action here
        console.log(`Card ${item.title} pressed`);
      }}
    >
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={item.icon} size={28} color={colors.white} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderDotIndicator = () => {
    return (
      <View style={styles.paginationContainer}>
        {featuredCards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeCardIndex ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header with greeting and notification */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {userDetail.name || 'User'}! 👋</Text>
              <Text style={styles.subText}>What are you looking for today?</Text>
            </View>
            <Pressable onPress={handleNotificationPress} style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.darkText} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Featured Cards Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
          </View>
          
          <FlatList
            ref={flatListRef}
            horizontal
            data={featuredCards}
            renderItem={renderFeaturedCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
            snapToInterval={cardWidth + 20}
            decelerationRate="fast"
            snapToAlignment="center"
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
          />
          
          {renderDotIndicator()}

          {/* Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryButton}
                onPress={() => {
                  // Handle category press action here
                  console.log(`Category ${category.name} pressed`);
                }}
              >
                <View style={[styles.categoryIconContainer]}>
                  <Ionicons name={category.icon} size={42} />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* New Request Button */}
          <Pressable
            style={styles.newRequestButton}
            onPress={handleAddRequest}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} style={{ marginRight: 10 }} />
            <Text style={styles.newRequestText}>Add New Request</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Review Modal - Rendered when Review === 1 from AuthProvider */}
      {Review === 1 && (
        <ReviewModal 
          visible={true}
          onClose={handleCloseReviewModal}
        />
      )}
    </View>
  );
};

export default CustomerHomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
    backgroundColor: colors.white,
    // borderBottomLeftRadius: 25,
    // borderBottomRightRadius: 25,
    // shadowColor: colors.darkText,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
    // elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  subText: {
    fontSize: 16,
    color: colors.lightText,
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // elevation: 1,
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkText,
  },
  cardsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  cardContainer: {
    width: cardWidth,
    marginHorizontal: 10,
  },
  card: {
    height: 200,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: colors.primary
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  categoryButton: {
    width: width / 3 - 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  categoryIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // elevation: 2,
    backgroundColor: colors.light,
  },
  categoryText: {
    color: colors.darkText,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  newRequestButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  newRequestText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});