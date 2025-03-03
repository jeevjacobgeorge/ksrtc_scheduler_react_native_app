import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AnnouncementItem = ({ announcement, onPress }) => {
  // Get color based on priority
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
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(announcement)}
    >
      <View 
        style={[
          styles.priorityIndicator, 
          { backgroundColor: getPriorityColor(announcement.priority) }
        ]} 
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {announcement.title}
          </Text>
          
          <View style={[
            styles.priorityBadge, 
            { backgroundColor: getPriorityColor(announcement.priority) }
          ]}>
            <Text style={styles.priorityText}>
              {announcement.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.content} numberOfLines={2}>
          {announcement.content}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            {new Date(announcement.created_at).toLocaleDateString()}
          </Text>
          
          <Text style={styles.author}>
            By: {announcement.created_by_name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  priorityIndicator: {
    width: 6,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  author: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AnnouncementItem;