// screens/MessagesScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { getMessages, markMessageAsRead } from '../utils/api';
import { formatTimeAgo } from '../utils/dateUtils';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MessagesScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadMessages = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      setError(null);
      
      const response = await getMessages(pageNum);
      console.log(response);
      
      const newMessages = response?.results || [];
      
      if (shouldRefresh || pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      
      // Check if there are more pages
      setHasMore(response?.next !== null);
      setPage(pageNum);
    } catch (error) {
      console.log('Error loading messages:', error);
      setError('Could not load messages. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadMessages(page + 1);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Set up refresh interval
    const interval = setInterval(() => loadMessages(1, true), 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleMessagePress = async (message) => {
    try {
      // Mark message as read if unread
      if (!message.is_read) {
        await markMessageAsRead(message.id);
        
        // Update the local state to mark this message as read
        setMessages(current => 
          current.map(msg => 
            msg.id === message.id ? { ...msg, is_read: true } : msg
          )
        );
      }
      
      // Navigate to chat
      navigation.navigate('Chat', { messageId: message.id });
    } catch (error) {
      console.log('Error marking message as read:', error);
      // Still navigate even if marking as read fails
      navigation.navigate('Chat', { messageId: message.id });
    }
  };

  const renderItem = ({ item }) => {
    // Check if the message is from today
    const messageDate = new Date(item.timestamp);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();
    
    // Format date display
    const dateDisplay = isToday 
      ? formatTimeAgo(messageDate)
      : messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
    return (
      <TouchableOpacity 
        style={[styles.messageItem, !item.is_read && styles.unreadItem]}
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.messageRow}>
          <View style={[styles.avatarContainer, 
            { backgroundColor: item.is_announcement ? '#E74C3C' : '#0078D7' }]}>
            <Ionicons 
              name={item.is_announcement ? "megaphone" : "mail"} 
              size={16} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.messageSender, !item.is_read && styles.unreadText]}>
                {item.sender_name}
              </Text>
              <Text style={styles.messageTime}>{dateDisplay}</Text>
            </View>
            
            <Text numberOfLines={2} style={[styles.messageText, !item.is_read && styles.unreadText]}>
              {item.content}
            </Text>
            
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="mail-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptyText}>
        You don't have any messages yet. Messages from officers will appear here.
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#E74C3C" />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity 
        style={[styles.refreshButton, styles.errorButton]}
        onPress={onRefresh}
      >
        <Text style={styles.refreshButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0078D7" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#0078D7']}
              tintColor="#0078D7"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={error ? renderErrorComponent() : renderEmptyComponent()}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#0078D7" style={styles.footerLoader} />
            ) : null
          }
          contentContainerStyle={messages.length === 0 ? { flex: 1 } : null}
        />
      )}
      
      <TouchableOpacity 
        style={styles.composeButton}
        onPress={() => navigation.navigate('Chat', { compose: true })}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },
  messageItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadItem: {
    backgroundColor: '#f8f9ff',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
    marginRight: 10,
    position: 'relative',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageSender: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#222',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0078D7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: '#0078D7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorButton: {
    backgroundColor: '#E74C3C',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footerLoader: {
    padding: 20,
  },
  composeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default MessagesScreen;