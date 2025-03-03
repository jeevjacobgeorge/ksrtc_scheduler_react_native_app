// screens/HomeScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { getUnreadMessages, getAnnouncements, getSchedules } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  const loadData = async () => {
    try {
      // Get unread messages
      const messagesData = await getUnreadMessages();
      setUnreadMessages(messagesData || []);
      
      // Get recent announcements
      const announcementsData = await getAnnouncements();
      setAnnouncements((announcementsData?.results || []).slice(0, 3));
      
      // Get recent schedules
      const schedulesData = await getSchedules();
      setSchedules((schedulesData?.results || []).slice(0, 3));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    
    // Generate greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Set up refresh interval
    const interval = setInterval(loadData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const renderCard = ({ icon, color, count, label }) => (
    <TouchableOpacity 
      style={styles.dashboardItem}
      onPress={() => navigation.navigate(label)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.dashboardNumber}>{count}</Text>
        <Text style={styles.dashboardLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0078D7" barStyle="light-content" />
      
      {/* Header section with gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.headerText}>{userInfo?.name || 'Depot User'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={[1]} // Just a dummy item to render the content
        keyExtractor={() => 'home'}
        contentContainerStyle={styles.contentContainer}
        renderItem={() => (
          <View style={styles.content}>
            {/* Dashboard summary */}
            <Text style={styles.sectionHeading}>Dashboard</Text>
            <View style={styles.dashboardRow}>
              {renderCard({
                icon: "mail-unread",
                color: "#0078D7",
                count: unreadMessages.length,
                label: "Messages"
              })}
              
              {renderCard({
                icon: "megaphone",
                color: "#E74C3C",
                count: announcements.length,
                label: "Announcements"
              })}
              
              {renderCard({
                icon: "calendar",
                color: "#2ECC71",
                count: schedules.length,
                label: "Schedules"
              })}
            </View>
            
            {/* Recent Messages */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Messages</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('Messages')}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0078D7" />
                </TouchableOpacity>
              </View>
              
              {unreadMessages.length > 0 ? (
                unreadMessages.slice(0, 3).map(message => (
                  <TouchableOpacity 
                    key={message.id}
                    style={styles.messageItem}
                    onPress={() => navigation.navigate('Chat', { messageId: message.id })}
                  >
                    <View style={styles.avatarContainer}>
                      <Ionicons name="person" size={18} color="#fff" />
                    </View>
                    <View style={styles.messageContent}>
                      <Text style={styles.messageSender}>{message.sender_name}</Text>
                      <Text numberOfLines={1} style={styles.messageText}>
                        {message.content}
                      </Text>
                      <Text style={styles.messageTime}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="mail-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyText}>No new messages</Text>
                </View>
              )}
            </View>
            
            {/* Recent Announcements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('Announcements')}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0078D7" />
                </TouchableOpacity>
              </View>
              
              {announcements.length > 0 ? (
                announcements.map(announcement => (
                  <TouchableOpacity 
                    key={announcement.id}
                    style={styles.announcementItem}
                    onPress={() => navigation.navigate('Announcements', { screen: 'AnnouncementDetail', params: { announcement } })}
                  >
                    <View style={[styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(announcement.priority) }]}>
                      <Text style={styles.priorityText}>
                        {announcement.priority.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.announcementContent}>
                      <Text style={styles.announcementTitle}>{announcement.title}</Text>
                      <Text numberOfLines={2} style={styles.announcementText}>
                        {announcement.content}
                      </Text>
                      <Text style={styles.announcementTime}>
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="megaphone-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyText}>No announcements</Text>
                </View>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#0078D7']} 
            tintColor={'#0078D7'}
          />
        }
      />
    </SafeAreaView>
  );
};

// Helper function to get color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return '#3498DB';
    case 'medium':
      return '#F39C12';
    case 'high':
      return '#E74C3C';
    case 'urgent':
      return '#C0392B';
    default:
      return '#3498DB';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    backgroundColor: '#0078D7',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  content: {
    padding: 15,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
    color: '#333',
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dashboardItem: {
    width: (width - 50) / 3,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  dashboardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  dashboardLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#0078D7',
    fontSize: 14,
    marginRight: 3,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    marginRight: 10,
  },
  messageSender: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priorityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  announcementContent: {
    flex: 1,
    marginRight: 10,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  announcementText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  announcementTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
    fontSize: 14,
  },
});

export default HomeScreen;