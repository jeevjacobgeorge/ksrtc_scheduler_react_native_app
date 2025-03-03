import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { BASE_URL } from '../config';

/**
 * Download a PDF file from a URL and save it to device
 * @param {string} fileUrl - The URL of the file to download
 * @param {string} fileName - The name to save the file as
 * @returns {Promise<string>} - The URI of the downloaded file
 */
export const downloadPDF = async (fileUrl, fileName) => {
  try {
    // Request storage permission on Android
    if (Platform.OS === 'android') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Storage permission is needed to download the file');
        return null;
      }
    }
    
    // Make sure the file URL is absolute
    const absoluteFileUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
    
    // Create a local path to save the file
    const localUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Download the file
    const { uri } = await FileSystem.downloadAsync(absoluteFileUrl, localUri);
    
    // For Android, save the file to media library
    if (Platform.OS === 'android') {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('KRSTC Schedules', asset, false);
      Alert.alert('Success', 'PDF has been saved to your device');
    } 
    // For iOS, we'll just return the URI and let the caller handle sharing
    
    return uri;
  } catch (error) {
    console.error('Error downloading file:', error);
    Alert.alert('Error', 'Failed to download the file');
    return null;
  }
};

/**
 * Share a PDF file with other apps
 * @param {string} fileUrl - The URL of the file to share
 * @param {string} fileName - The name of the file
 * @returns {Promise<void>}
 */
export const sharePDF = async (fileUrl, fileName) => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }
    
    // Make sure the file URL is absolute
    const absoluteFileUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
    
    // Create a local path for temporary storage
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;
    
    // Download the file
    await FileSystem.downloadAsync(absoluteFileUrl, localUri);
    
    // Share the file
    await Sharing.shareAsync(localUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share ${fileName}`,
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    Alert.alert('Error', 'Failed to share the file');
  }
};

/**
 * Get file name from URL
 * @param {string} url - The URL of the file
 * @returns {string} - The extracted file name
 */
export const getFileNameFromUrl = (url) => {
  if (!url) return 'file.pdf';
  
  // Try to extract file name from URL
  const parts = url.split('/');
  let fileName = parts[parts.length - 1];
  
  // Remove query parameters if any
  if (fileName.includes('?')) {
    fileName = fileName.split('?')[0];
  }
  
  // If filename is empty or not a valid name, return a default
  if (!fileName || fileName.trim() === '') {
    return 'file.pdf';
  }
  
  return fileName;
};

/**
 * Check if a file exists in the local filesystem
 * @param {string} uri - The URI of the file to check
 * @returns {Promise<boolean>} - Whether the file exists
 */
export const fileExists = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};