/*
// screens/ScheduleDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { BASE_URL } from '../config';

const ScheduleDetailScreen = ({ route, navigation }) => {
  const { schedule } = route.params;
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    navigation.setOptions({ title: schedule.title });
  }, [schedule]);

  const downloadPDF = async () => {
    if (!schedule.pdf_file) {
      Alert.alert('Error', 'No PDF file available for this schedule');
      return;
    }
    
    try {
      setDownloading(true);
      
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Storage permission is needed to download the file');
          setDownloading(false);
          return;
        }
      }
      
      // Get filename from URL
      const fileUrl = schedule.pdf_file;
      const fileName = fileUrl.split('/').pop();
      
      // Local path to save the file
      const localUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Download the file
      const { uri } = await FileSystem.downloadAsync(
        fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`,
        localUri
      );
      
      // On iOS, just share the PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } 
      // On Android, save to device
      else {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('KRSTC Schedules', asset, false);
        Alert.alert('Success', 'PDF has been saved to your device');
      }
    } catch (error) {
      console.log('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download the PDF');
    } finally {
      setDownloading(false);
    }
  };

  const sharePDF = async () => {
    if (!schedule.pdf_file) {
      Alert.alert('Error', 'No PDF file available to share');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get filename from URL
      const fileUrl = schedule.pdf_file;
      const fileName = fileUrl.split('/').pop();
      
      // Local path for temporary storage
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Download the file
      await FileSystem.downloadAsync(
        fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`,
        localUri
      );
      
      // Share the file
      await Share.share({
        url: localUri,
        title: schedule.title,
      });
    } catch (error) {
      console.log('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{schedule.title}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>Created by: {schedule.created_by_name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>
            Date: {new Date(schedule.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {schedule.depot_name && (
          <View style={styles.infoRow}>
            <Ionicons name="business" size={16} color="#666" />
            <Text style={styles.infoText}>Depot: {schedule.depot_name}</Text>
          </View>
        )}
        
        {schedule.is_global && (
          <View style={styles.globalBadge}>
            <Text style={styles.globalText}>Global Schedule</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>
          {schedule.description || 'No description provided.'}
        </Text>
        
        {schedule.pdf_file && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={downloadPDF}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={sharePDF}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="share" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  globalBadge: {
    backgroundColor: '#0078D7',
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  globalText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
},
});

export default ScheduleDetailScreen;
*/

// screens/ScheduleDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  Share,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../config';

const ScheduleDetailScreen = ({ route, navigation }) => {
  const { schedule } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    navigation.setOptions({ 
      title: '', // Empty title, we'll use our custom header
      headerTransparent: true,
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={() => Alert.alert('More Options', 'Additional options coming soon')}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [schedule, navigation]);

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

  const downloadPDF = async () => {
    if (!schedule.pdf_file) {
      Alert.alert('Error', 'No PDF file available for this schedule');
      return;
    }
    
    try {
      setDownloading(true);
      
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Storage permission is needed to download the file');
          setDownloading(false);
          return;
        }
      }
      
      // Get filename from URL
      const fileUrl = schedule.pdf_file;
      const fileName = fileUrl.split('/').pop();
      
      // Local path to save the file
      const localUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Download the file
      const { uri } = await FileSystem.downloadAsync(
        fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`,
        localUri
      );
      
      // On iOS, just share the PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } 
      // On Android, save to device
      else {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('KRSTC Schedules', asset, false);
        Alert.alert('Success', 'PDF has been saved to your device');
      }
    } catch (error) {
      console.log('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download the PDF');
    } finally {
      setDownloading(false);
    }
  };

  const sharePDF = async () => {
    if (!schedule.pdf_file) {
      Alert.alert('Error', 'No PDF file available to share');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get filename from URL
      const fileUrl = schedule.pdf_file;
      const fileName = fileUrl.split('/').pop();
      
      // Local path for temporary storage
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Download the file
      await FileSystem.downloadAsync(
        fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`,
        localUri
      );
      
      // Share the file
      await Share.share({
        url: localUri,
        title: schedule.title,
      });
    } catch (error) {
      console.log('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Background */}
      <View style={styles.headerBackground}>
        <View style={styles.headerContent}>
          {schedule.is_global && (
            <View style={styles.globalBadge}>
              <MaterialIcons name="public" size={12} color="#fff" />
              <Text style={styles.globalText}>Global Schedule</Text>
            </View>
          )}
          <Text style={styles.headerTitle}>{schedule.title}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          {/* Creator info section */}
          <View style={styles.creatorSection}>
            <View 
              style={[
                styles.avatarCircle, 
                { backgroundColor: getAvatarColor(schedule.created_by_name) }
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(schedule.created_by_name)}
              </Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{schedule.created_by_name}</Text>
              <Text style={styles.creationDate}>
                Created {getRelativeTime(schedule.created_at)}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Info tiles */}
          <View style={styles.infoTiles}>
            {schedule.depot_name && (
              <View style={styles.infoTile}>
                <MaterialIcons name="location-city" size={20} color="#0078D7" />
                <Text style={styles.infoTileLabel}>Depot</Text>
                <Text style={styles.infoTileValue}>{schedule.depot_name}</Text>
              </View>
            )}
            
            <View style={styles.infoTile}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#0078D7" />
              <Text style={styles.infoTileLabel}>Tasks</Text>
              <Text style={styles.infoTileValue}>{schedule.tasks_count || 0}</Text>
            </View>
            
            <View style={styles.infoTile}>
              <MaterialIcons name="people-outline" size={20} color="#0078D7" />
              <Text style={styles.infoTileLabel}>Assignees</Text>
              <Text style={styles.infoTileValue}>{schedule.assignees_count || 0}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Description section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {schedule.description || 'No description provided for this schedule.'}
            </Text>
          </View>
          
          {/* PDF section */}
          {schedule.pdf_file && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.pdfSection}>
                <View style={styles.pdfHeader}>
                  <View style={styles.pdfIcon}>
                    <MaterialCommunityIcons name="file-pdf-box" size={32} color="#e74c3c" />
                  </View>
                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfTitle}>Schedule Document</Text>
                    <Text style={styles.pdfSubtitle}>PDF Document</Text>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={downloadPDF}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Download</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={sharePDF}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Share</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
        
        {/* Bottom section with buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.viewTasksButton}
            onPress={() => navigation.navigate('ScheduleTasks', { scheduleId: schedule.id })}
          >
            <Text style={styles.viewTasksButtonText}>View Tasks</Text>
            <Ionicons name="chevron-forward" size={18} color="#0078D7" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBackground: {
    height: 180,
    backgroundColor: '#0078D7',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  headerContent: {
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  globalBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  creatorInfo: {
    marginLeft: 15,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  creationDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  infoTiles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  infoTile: {
    alignItems: 'center',
    paddingHorizontal: 5,
    flex: 1,
  },
  infoTileLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  infoTileValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 3,
  },
  descriptionSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  pdfSection: {
    paddingHorizontal: 20,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pdfIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfInfo: {
    marginLeft: 15,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pdfSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0078D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: '#3498db',
    marginRight: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  bottomSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  viewTasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0078D7',
  },
  viewTasksButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0078D7',
    marginRight: 5,
  },
});

export default ScheduleDetailScreen;