// screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const navigation = useNavigation();
  
  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const notificationsPref = await AsyncStorage.getItem('notificationsEnabled');
        const darkModePref = await AsyncStorage.getItem('darkModeEnabled');
        
        if (notificationsPref !== null) {
          setNotificationsEnabled(notificationsPref === 'true');
        }
        
        if (darkModePref !== null) {
          setDarkModeEnabled(darkModePref === 'true');
        }
      } catch (error) {
        console.log('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Ensure navigation happens after logout is complete
              // Reset the navigation stack to prevent going back to profile after logout
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Error during logout:', error);
              Alert.alert('Logout Failed', 'Please try again.');
            }
          },
        },
      ]
    );
  };
  
  // Toggle notifications
  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
    } catch (error) {
      console.log('Error saving notification preference:', error);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = async (value) => {
    setDarkModeEnabled(value);
    try {
      await AsyncStorage.setItem('darkModeEnabled', value.toString());
      // Here you would implement the actual dark mode switch
      Alert.alert('Feature Coming Soon', 'Dark mode will be available in a future update.');
    } catch (error) {
      console.log('Error saving dark mode preference:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userInfo?.name?.charAt(0) || userInfo?.user?.username?.charAt(0) || 'D'}
          </Text>
        </View>
        <Text style={styles.profileName}>{userInfo?.name || userInfo?.user?.username || 'Depot User'}</Text>
        <Text style={styles.profileDetails}>
          {userInfo?.user?.email || 'No email provided'}
        </Text>
        <Text style={styles.profileLocation}>
          {userInfo?.location || 'Location not specified'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="person" size={20} color="#0078D7" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{userInfo?.user?.username || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="business" size={20} color="#0078D7" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Depot</Text>
            <Text style={styles.infoValue}>{userInfo?.name || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color="#0078D7" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{userInfo?.address || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color="#0078D7" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.infoValue}>{userInfo?.contact_person || 'Not available'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={20} color="#0078D7" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#ccc', true: '#0078D7' }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={20} color="#0078D7" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#ccc', true: '#0078D7' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>KRSTC Depot App v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 KRSTC</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  profileLocation: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    margin: 15,
    padding: 15,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});

export default ProfileScreen;