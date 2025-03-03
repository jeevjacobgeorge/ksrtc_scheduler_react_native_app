import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessageItem = ({ message, onPress, isUnread }) => {
  const isAnnouncement = message.is_announcement;
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isAnnouncement ? "megaphone" : "mail"} 
          size={24} 
          color={isUnread ? "#0078D7" : "#999"} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.sender, isUnread && styles.unread]}>
            {message.sender_name}
          </Text>
          <Text style={styles.time}>
            {new Date(message.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Text 
          numberOfLines={2} 
          style={[styles.content, isUnread && styles.unread]}
        >
          {message.content}
        </Text>
      </View>
      {isUnread && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sender: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    fontSize: 14,
    color: '#666',
  },
  unread: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0078D7',
    marginLeft: 10,
  },
});

export default MessageItem;