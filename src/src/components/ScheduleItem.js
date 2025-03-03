import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ScheduleItem = ({ schedule, onPress }) => {
  const hasPdf = schedule.pdf_file && schedule.pdf_file !== '';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{schedule.title}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {schedule.description || 'No description available'}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            {new Date(schedule.created_at).toLocaleDateString()}
          </Text>
          
          <View style={styles.badgeContainer}>
            {schedule.is_global && (
              <View style={[styles.badge, styles.globalBadge]}>
                <Text style={styles.badgeText}>Global</Text>
              </View>
            )}
            {hasPdf && (
              <View style={[styles.badge, styles.pdfBadge]}>
                <Ionicons name="document-text" size={12} color="#fff" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>PDF</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 5,
  },
  globalBadge: {
    backgroundColor: '#0078D7',
  },
  pdfBadge: {
    backgroundColor: '#e74c3c',
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ScheduleItem;