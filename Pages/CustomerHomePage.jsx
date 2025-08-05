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

// import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform, StatusBar, Image, Dimensions } from 'react-native';
// import React, { useState, useRef } from 'react';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useAuth } from '../AuthProvider';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import ReviewModal from '../CustomerPages/CustomerComponent/ReviewModal';

// const { width, height } = Dimensions.get('window');
// const cardWidth = width * 0.85;

// // Enhanced color palette with modern gradients and depth
// const colors = {
//   primary: '#4F46E5',        // Indigo primary
//   primaryLight: '#6366F1',   // Lighter indigo
//   primaryDark: '#3730A3',    // Darker indigo
//   secondary: '#06B6D4',      // Cyan secondary
//   accent: '#F59E0B',         // Amber accent
//   accentLight: '#FCD34D',    // Light amber
//   tertiary: '#8B5CF6',       // Violet tertiary
//   success: '#10B981',        // Emerald success
//   warning: '#F97316',        // Orange warning
//   error: '#EF4444',          // Red error
  
//   // Neutral colors
//   gray50: '#F9FAFB',
//   gray100: '#F3F4F6',
//   gray200: '#E5E7EB',
//   gray300: '#D1D5DB',
//   gray400: '#9CA3AF',
//   gray500: '#6B7280',
//   gray600: '#4B5563',
//   gray700: '#374151',
//   gray800: '#1F2937',
//   gray900: '#111827',
  
//   white: '#FFFFFF',
//   black: '#000000',
  
//   // Background colors
//   background: '#FAFAFB',
//   surface: '#FFFFFF',
//   surfaceElevated: '#FFFFFF',
  
//   // Text colors
//   textPrimary: '#111827',
//   textSecondary: '#6B7280',
//   textTertiary: '#9CA3AF',
//   textInverse: '#FFFFFF',
// };

// const categories = [
//   { id: '1', name: "Electronics", icon: "phone-portrait-outline", gradient: [colors.primary, colors.primaryLight] },
//   { id: '2', name: "Groceries", icon: "basket-outline", gradient: [colors.success, '#34D399'] },
//   { id: '3', name: "Clothing", icon: "shirt-outline", gradient: [colors.tertiary, '#A78BFA'] },
//   { id: '4', name: "Home & Garden", icon: "home-outline", gradient: [colors.secondary, '#67E8F9'] },
//   { id: '5', name: "Beauty", icon: "sparkles-outline", gradient: [colors.accent, colors.accentLight] },
//   { id: '6', name: "Sports", icon: "fitness-outline", gradient: [colors.warning, '#FB923C'] },
// ];

// const featuredCards = [
//   { 
//     id: '1', 
//     title: 'Daily Essentials',
//     description: 'Everything you need for your daily routine',
//     gradient: [colors.primary, colors.primaryLight],
//     icon: 'calendar-outline',
//     discount: '20% OFF'
//   },
//   { 
//     id: '2', 
//     title: 'Flash Deals',
//     description: 'Limited time offers ending soon',
//     gradient: [colors.accent, colors.accentLight],
//     icon: 'flash-outline',
//     discount: 'UP TO 50%'
//   },
//   { 
//     id: '3', 
//     title: 'Trending Now',
//     description: 'Most popular items in your area',
//     gradient: [colors.tertiary, '#A78BFA'],
//     icon: 'trending-up-outline',
//     discount: 'HOT'
//   },
//   { 
//     id: '4', 
//     title: 'Weekend Special',
//     description: 'Exclusive weekend discounts',
//     gradient: [colors.success, '#34D399'],
//     icon: 'gift-outline',
//     discount: '30% OFF'
//   }
// ];

// const CustomerHomePage = ({ navigation }) => {
//   const { userDetail, logout, notificationCount, setNotificationCount, Review, setReview } = useAuth();
//   const [activeCardIndex, setActiveCardIndex] = useState(0);
//   const flatListRef = useRef(null);

//   const handleNotificationPress = () => {
//     navigation.navigate('Notification');
//   };

//   const handleAddRequest = () => {
//     navigation.navigate("AddReq", { id: userDetail.id });
//   };

//   const handleScroll = (event) => {
//     const contentOffsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / (cardWidth + 20));
//     setActiveCardIndex(index);
//   };

//   const handleCloseReviewModal = () => {
//     if (setReview) {
//       setReview(0);
//     }
//   };

//   const renderFeaturedCard = ({ item, index }) => (
//     <Pressable
//       style={styles.cardContainer}
//       onPress={() => {
//         console.log(`Card ${item.title} pressed`);
//       }}
//     >
//       <View style={[styles.card, { backgroundColor: item.gradient[0] }]}>
//         <View style={styles.cardHeader}>
//           <View style={styles.cardIconContainer}>
//             <Ionicons name={item.icon} size={28} color={colors.white} />
//           </View>
//           <View style={styles.discountBadge}>
//             <Text style={styles.discountText}>{item.discount}</Text>
//           </View>
//         </View>
//         <View style={styles.cardContent}>
//           <Text style={styles.cardTitle}>{item.title}</Text>
//           <Text style={styles.cardDescription}>{item.description}</Text>
//         </View>
//         <View style={styles.cardFooter}>
//           <Text style={styles.exploreText}>Explore Now</Text>
//           <Ionicons name="arrow-forward" size={18} color={colors.white} />
//         </View>
//         {/* Gradient overlay */}
//         <View style={[styles.gradientOverlay, { backgroundColor: item.gradient[1] }]} />
//       </View>
//     </Pressable>
//   );

//   const renderDotIndicator = () => {
//     return (
//       <View style={styles.paginationContainer}>
//         {featuredCards.map((_, index) => (
//           <View
//             key={index}
//             style={[
//               styles.paginationDot,
//               index === activeCardIndex ? styles.paginationDotActive : null,
//             ]}
//           />
//         ))}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContainer}
//         >
//           {/* Enhanced Header */}
//           <View style={styles.header}>
//             <View style={styles.headerContent}>
//               <View style={styles.profileSection}>
//                 <View style={styles.avatarContainer}>
//                   <Text style={styles.avatarText}>
//                     {userDetail?.name?.charAt(0)?.toUpperCase() || 'U'}
//                   </Text>
//                 </View>
//                 <View>
//                   <Text style={styles.greeting}>Hello, {userDetail?.name || 'User'}!</Text>
//                   <Text style={styles.subText}>What can we help you find today?</Text>
//                 </View>
//               </View>
//               <Pressable onPress={handleNotificationPress} style={styles.notificationButton}>
//                 <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
//                 {notificationCount > 0 && (
//                   <View style={styles.notificationBadge}>
//                     <Text style={styles.notificationBadgeText}>
//                       {notificationCount > 9 ? '9+' : notificationCount}
//                     </Text>
//                   </View>
//                 )}
//               </Pressable>
//             </View>
//           </View>

//           {/* Featured Cards Section */}
//           <View style={styles.sectionContainer}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Featured Deals</Text>
//               <Text style={styles.sectionSubtitle}>Limited time offers</Text>
//             </View>
            
//             <FlatList
//               ref={flatListRef}
//               horizontal
//               data={featuredCards}
//               renderItem={renderFeaturedCard}
//               keyExtractor={item => item.id}
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.cardsContainer}
//               snapToInterval={cardWidth + 20}
//               decelerationRate="fast"
//               snapToAlignment="center"
//               onScroll={handleScroll}
//               onMomentumScrollEnd={handleScroll}
//             />
            
//             {renderDotIndicator()}
//           </View>

//           {/* Categories */}
//           <View style={styles.sectionContainer}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Categories</Text>
//               <Text style={styles.sectionSubtitle}>Browse by category</Text>
//             </View>
            
//             <View style={styles.categoriesGrid}>
//               {categories.map((category, index) => (
//                 <Pressable
//                   key={category.id}
//                   style={[styles.categoryButton, { animationDelay: `${index * 100}ms` }]}
//                   onPress={() => {
//                     console.log(`Category ${category.name} pressed`);
//                   }}
//                 >
//                   <View style={[styles.categoryIconContainer, { backgroundColor: category.gradient[0] }]}>
//                     <Ionicons name={category.icon} size={32} color={colors.white} />
//                     <View style={[styles.categoryGradient, { backgroundColor: category.gradient[1] }]} />
//                   </View>
//                   <Text style={styles.categoryText}>{category.name}</Text>
//                 </Pressable>
//               ))}
//             </View>
//           </View>

//           {/* Quick Actions */}
//           <View style={styles.quickActionsContainer}>
//             <Pressable
//               style={styles.newRequestButton}
//               onPress={handleAddRequest}
//             >
//               <View style={styles.buttonContent}>
//                 <View style={styles.buttonIconContainer}>
//                   <Ionicons name="add-circle" size={24} color={colors.white} />
//                 </View>
//                 <View style={styles.buttonTextContainer}>
//                   <Text style={styles.newRequestText}>Create New Request</Text>
//                   <Text style={styles.newRequestSubtext}>Tell us what you need</Text>
//                 </View>
//                 <Ionicons name="arrow-forward" size={20} color={colors.white} />
//               </View>
//             </Pressable>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Review Modal */}
//       {Review === 1 && (
//         <ReviewModal 
//           visible={true}
//           onClose={handleCloseReviewModal}
//         />
//       )}
//     </View>
//   );
// };

// export default CustomerHomePage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingBottom: 40,
//   },
  
//   // Enhanced Header Styles
//   header: {
//     backgroundColor: colors.surface,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray100,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   profileSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatarContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   avatarText: {
//     color: colors.white,
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   greeting: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: colors.textPrimary,
//     marginBottom: 2,
//   },
//   subText: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     fontWeight: '500',
//   },
//   notificationButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: colors.gray50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//     borderWidth: 1,
//     borderColor: colors.gray100,
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   notificationBadge: {
//     position: 'absolute',
//     right: -2,
//     top: -2,
//     backgroundColor: colors.error,
//     borderRadius: 12,
//     minWidth: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//     borderWidth: 2,
//     borderColor: colors.white,
//   },
//   notificationBadgeText: {
//     color: colors.white,
//     fontSize: 11,
//     fontWeight: '700',
//   },

//   // Section Styles
//   sectionContainer: {
//     marginTop: 32,
//   },
//   sectionHeader: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: colors.textPrimary,
//     marginBottom: 4,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     fontWeight: '500',
//   },

//   // Enhanced Card Styles
//   cardsContainer: {
//     paddingHorizontal: 10,
//     paddingBottom: 10,
//   },
//   cardContainer: {
//     width: cardWidth,
//     marginHorizontal: 10,
//   },
//   card: {
//     height: 220,
//     borderRadius: 20,
//     padding: 24,
//     position: 'relative',
//     overflow: 'hidden',
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   gradientOverlay: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: '50%',
//     height: '100%',
//     opacity: 0.3,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//     zIndex: 2,
//   },
//   cardIconContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: 'rgba(255, 255, 255, 0.25)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backdropFilter: 'blur(10px)',
//   },
//   discountBadge: {
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   discountText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: colors.textPrimary,
//   },
//   cardContent: {
//     flex: 1,
//     justifyContent: 'center',
//     zIndex: 2,
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: colors.white,
//     marginBottom: 8,
//   },
//   cardDescription: {
//     fontSize: 15,
//     color: 'rgba(255, 255, 255, 0.9)',
//     lineHeight: 22,
//     fontWeight: '500',
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 16,
//     zIndex: 2,
//   },
//   exploreText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.white,
//   },

//   // Pagination Styles
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.gray300,
//     marginHorizontal: 4,
//     transition: 'all 0.3s ease',
//   },
//   paginationDotActive: {
//     width: 24,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.primary,
//     transform: [{ scaleY: 1.2 }],
//   },

//   // Enhanced Categories
//   categoriesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     gap: 16,
//   },
//   categoryButton: {
//     width: (width - 72) / 3, // Accounting for padding and gaps
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   categoryIconContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     position: 'relative',
//     overflow: 'hidden',
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   categoryGradient: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: '40%',
//     height: '100%',
//     opacity: 0.4,
//   },
//   categoryText: {
//     color: colors.textPrimary,
//     fontSize: 13,
//     textAlign: 'center',
//     fontWeight: '600',
//     lineHeight: 18,
//   },

//   // Enhanced Button Styles
//   quickActionsContainer: {
//     paddingHorizontal: 20,
//     marginTop: 32,
//   },
//   newRequestButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   buttonIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   buttonTextContainer: {
//     flex: 1,
//   },
//   newRequestText: {
//     color: colors.white,
//     fontWeight: '700',
//     fontSize: 18,
//     marginBottom: 2,
//   },
//   newRequestSubtext: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });