/*
// screens/AnnouncementsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config';

const AnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const loadAnnouncements = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      const response = await axios.get(`${BASE_URL}/api/v1/announcements/?page=${pageNum}`);
      
      const newAnnouncements = response.data.results;
      
      if (shouldRefresh || pageNum === 1) {
        setAnnouncements(newAnnouncements);
      } else {
        setAnnouncements(prev => [...prev, ...newAnnouncements]);
      }
      
      // Check if there are more pages
      setHasMore(response.data.next !== null);
      setPage(pageNum);
    } catch (error) {
      console.log('Error loading announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnnouncements(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadAnnouncements(page + 1);
    }
  };

  const toggleExpand = (id) => {
    if (expandedAnnouncement === id) {
      setExpandedAnnouncement(null);
    } else {
      setExpandedAnnouncement(id);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const renderItem = ({ item }) => {
    const isExpanded = expandedAnnouncement === item.id;
    
    return (
      <TouchableOpacity 
        style={styles.announcementItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.announcementHeader}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
          <View style={styles.titleContainer}>
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#999" />
        </View>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.announcementContent}>{item.content}</Text>
            <View style={styles.announcementFooter}>
              <Text style={styles.announcementInfo}>
                By: {item.created_by_name}
              </Text>
              <Text style={styles.announcementDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#0078D7" style={styles.loader} />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No announcements found</Text>
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#0078D7" style={styles.footerLoader} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: props => props.style.backgroundColor === '#0078D7' ? '#fff' : '#333',
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  announcementContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  announcementInfo: {
    fontSize: 12,
    color: '#666',
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 30,
  },
  footerLoader: {
    padding: 15,
  },
});

export default AnnouncementsScreen;
*/

// screens/AnnouncementsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config';

const AnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const loadAnnouncements = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      const response = await axios.get(`${BASE_URL}/api/v1/announcements/?page=${pageNum}`);
      
      const newAnnouncements = response.data.results;
      
      if (shouldRefresh || pageNum === 1) {
        setAnnouncements(newAnnouncements);
      } else {
        setAnnouncements(prev => [...prev, ...newAnnouncements]);
      }
      
      // Check if there are more pages
      setHasMore(response.data.next !== null);
      setPage(pageNum);
    } catch (error) {
      console.log('Error loading announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnnouncements(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadAnnouncements(page + 1);
    }
  };

  const toggleExpand = (id) => {
    if (expandedAnnouncement === id) {
      setExpandedAnnouncement(null);
    } else {
      setExpandedAnnouncement(id);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Helper function to get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
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

  // Get priority background with lower opacity
  const getPriorityBackgroundColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'rgba(52, 152, 219, 0.1)';
      case 'medium':
        return 'rgba(243, 156, 18, 0.1)';
      case 'high':
        return 'rgba(231, 76, 60, 0.1)';
      case 'urgent':
        return 'rgba(192, 57, 43, 0.1)';
      default:
        return 'rgba(52, 152, 219, 0.1)';
    }
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Announcements</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const isExpanded = expandedAnnouncement === item.id;
    const priorityColor = getPriorityColor(item.priority);
    const priorityBackgroundColor = getPriorityBackgroundColor(item.priority);
    
    return (
      <Animated.View style={styles.itemContainer}>
        <TouchableOpacity 
          style={[
            styles.announcementItem,
            isExpanded && styles.expandedItem
          ]}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.announcementHeader}>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
            <View style={styles.titleContainer}>
              <Text style={styles.announcementTitle} numberOfLines={isExpanded ? undefined : 1}>
                {item.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityBackgroundColor }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.expandIconContainer}>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={22} 
                color="#777" 
              />
            </View>
          </View>
          
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.announcementContent}>{item.content}</Text>
              <View style={styles.announcementFooter}>
                <View style={styles.authorContainer}>
                  <Ionicons name="person-circle-outline" size={16} color="#555" />
                  <Text style={styles.announcementInfo}>
                    {item.created_by_name}
                  </Text>
                </View>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#777" />
                  <Text style={styles.announcementDate}>
                    {getFormattedDate(item.created_at)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No announcements found</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRefresh}
      >
        <Text style={styles.retryText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0078D7" />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={styles.listContainer}
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
          ListEmptyComponent={<EmptyListComponent />}
          ListFooterComponent={
            loading && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#0078D7" />
                <Text style={styles.footerLoaderText}>Loading more...</Text>
              </View>
            ) : hasMore ? (
              <View style={styles.footer} />
            ) : (
              <Text style={styles.endOfListText}>
                {announcements.length > 0 ? "You've reached the end" : ""}
              </Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#777',
    fontSize: 16,
  },
  itemContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  expandedItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  announcementTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  expandIconContainer: {
    padding: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  announcementContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementInfo: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  announcementDate: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#0078D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginLeft: 8,
    color: '#777',
  },
  footer: {
    height: 20,
  },
  endOfListText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  },
});

export default AnnouncementsScreen;