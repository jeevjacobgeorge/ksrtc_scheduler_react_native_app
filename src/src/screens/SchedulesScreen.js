/*
// screens/SchedulesScreen.js
import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';

const SchedulesScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSchedules = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      const response = await axios.get(`${BASE_URL}/api/v1/schedules/?page=${pageNum}`);
      
      const newSchedules = response.data.results;
      
      if (shouldRefresh || pageNum === 1) {
        setSchedules(newSchedules);
      } else {
        setSchedules(prev => [...prev, ...newSchedules]);
      }
      
      // Check if there are more pages
      setHasMore(response.data.next !== null);
      setPage(pageNum);
    } catch (error) {
      console.log('Error loading schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedules(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadSchedules(page + 1);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.scheduleItem}
      onPress={() => navigation.navigate('ScheduleDetail', { schedule: item })}
    >
      <View style={styles.scheduleHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          {item.is_global && (
            <View style={styles.globalBadge}>
              <Text style={styles.globalText}>Global</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
      <Text numberOfLines={2} style={styles.scheduleDescription}>
        {item.description || 'No description provided.'}
      </Text>
      <View style={styles.scheduleFooter}>
        <Text style={styles.scheduleInfo}>
          By: {item.created_by_name}
        </Text>
        <Text style={styles.scheduleDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#0078D7" style={styles.loader} />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No schedules found</Text>
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
  scheduleItem: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  globalBadge: {
    backgroundColor: '#0078D7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  globalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  scheduleInfo: {
    fontSize: 12,
    color: '#666',
  },
  scheduleDate: {
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

export default SchedulesScreen;

*/



// screens/SchedulesScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SchedulesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userInfo } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSchedules = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      const response = await axios.get(`${BASE_URL}/api/v1/schedules/?page=${pageNum}`);
      
      const newSchedules = response.data.results;
      
      if (shouldRefresh || pageNum === 1) {
        setSchedules(newSchedules);
      } else {
        setSchedules(prev => [...prev, ...newSchedules]);
      }
      
      // Check if there are more pages
      setHasMore(response.data.next !== null);
      setPage(pageNum);
    } catch (error) {
      console.log('Error loading schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedules(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadSchedules(page + 1);
    }
  };

  useEffect(() => {
    loadSchedules();
    
    // Set up navigation options
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Schedules',
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }} 
          onPress={() => navigation.navigate('CreateSchedule')}
        >
          <Ionicons name="add-circle" size={24} color="#0078D7" />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#ccc';
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#d35400', '#c0392b'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.scheduleItem}
      onPress={() => navigation.navigate('ScheduleDetail', { schedule: item })}
      activeOpacity={0.7}
    >
      <View style={styles.scheduleContent}>
        <View style={styles.scheduleHeader}>
          <View style={styles.creatorInfo}>
            <View 
              style={[
                styles.avatarCircle, 
                { backgroundColor: getAvatarColor(item.created_by_name) }
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(item.created_by_name)}
              </Text>
            </View>
            <View style={styles.creatorTextContainer}>
              <Text style={styles.scheduleTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.creatorName} numberOfLines={1}>
                {item.created_by_name} • {getRelativeTime(item.created_at)}
              </Text>
            </View>
          </View>

          {item.is_global && (
            <View style={styles.globalBadge}>
              <MaterialIcons name="public" size={12} color="#fff" />
              <Text style={styles.globalText}>Global</Text>
            </View>
          )}
        </View>

        <Text numberOfLines={2} style={styles.scheduleDescription}>
          {item.description || 'No description provided.'}
        </Text>
        
        <View style={styles.scheduleFooter}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.statText}>
                {item.tasks_count || 0} tasks
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.statText}>
                {item.assignees_count || 0} assignees
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Schedules Found</Text>
      <Text style={styles.emptySubtitle}>
        Create a schedule to start organizing your tasks
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSchedule')}
      >
        <Text style={styles.createButtonText}>Create Schedule</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0078D7" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      ) : (
        <FlatList
          data={schedules}
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
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#0078D7" style={styles.footerLoader} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  scheduleContent: {
    padding: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  creatorTextContainer: {
    flex: 1,
  },
  scheduleTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#212529',
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 12,
    color: '#6c757d',
  },
  globalBadge: {
    backgroundColor: '#0078D7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 16,
    lineHeight: 20,
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: '#0078D7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerLoader: {
    padding: 16,
  },
});

export default SchedulesScreen;