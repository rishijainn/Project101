import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StatusBar, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const NotificationPage = () => {
  const { notificationCount, userDetail, setNotificationCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://shoplocalbackend-1.onrender.com/noti/cutomerNotification`, {
        params: { customer_id: userDetail.id }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
        // Reset notification count after viewing
        if (notificationCount > 0) {
          setNotificationCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setNotificationCount(0);
    getNotifications();
  }, [notificationCount]);

  const onRefresh = () => {
    setRefreshing(true);
    getNotifications();
  };

  const formatTime = (timestamp) => {
    // This is a placeholder - implement proper time formatting
    // based on your actual timestamp format
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderNotificationItem = ({ item }) => {
    // Assuming your notification object has these properties
    // Adjust according to your API response
    return (
      <TouchableOpacity style={styles.notificationItem}>
        <View style={styles.iconContainer}>
          {/* Using a circle with dot for unread and empty circle for read notifications */}
          <View style={[
            styles.notificationIcon, 
            { backgroundColor: item.read ? 'transparent' : '#2D6A4F' }
          ]}>
            {!item.read && <View style={styles.notificationDot} />}
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.notificationTitle}>{item.title || "New Notification"}</Text>
          <Text style={styles.notificationBody}>{item.message || "You have a new notification"}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.created_at) || "Just now"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyNotificationsView = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyNotificationIcon} />
        <View style={styles.emptySlashIcon} />
      </View>
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>When you receive notifications, they will appear here</Text>
    </View>
  );

  // Back button arrow component
  const BackButton = () => (
    <TouchableOpacity 
      style={styles.backButton} 
      onPress={() => navigation.goBack()}
    >
      <View style={styles.backArrow}>
        <View style={styles.backArrowLine} />
        <View style={styles.backArrowPoint} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2D6A4F" barStyle="light-content" />
      
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={notifications.length === 0 ? styles.flatListEmptyContainer : styles.flatListContainer}
          ListEmptyComponent={EmptyNotificationsView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2D6A4F"]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default NotificationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 16,
    paddingHorizontal: 15,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    width: 18,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backArrowLine: {
    width: 18,
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
  },
  backArrowPoint: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: -1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContainer: {
    paddingVertical: 12,
  },
  flatListEmptyContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  // New styles for notification icons without using Expo icons
  notificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  // Styles for empty notification icon
  emptyIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyNotificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#ccc',
  },
  emptySlashIcon: {
    position: 'absolute',
    width: 4,
    height: 80,
    backgroundColor: '#ccc',
    transform: [{ rotate: '45deg' }],
  },
});