import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ status, text, style }) => {
  // If text is not provided, use status with capitalized first letter
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);
  
  // Get color based on status
  const getBackgroundColor = () => {
    switch (status) {
      case 'active':
        return '#28a745';
      case 'inactive':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      case 'pending':
        return '#fd7e14';
      case 'success':
        return '#28a745';
      case 'danger':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };
  
  // Get text color based on status
  const getTextColor = () => {
    switch (status) {
      case 'warning':
        return '#212529';
      default:
        return '#ffffff';
    }
  };
  
  return (
    <View style={[
      styles.badge,
      { backgroundColor: getBackgroundColor() },
      style
    ]}>
      <Text style={[
        styles.text,
        { color: getTextColor() }
      ]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StatusBadge;