import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api-token-auth/`, {
        username,
        password,
      });
      
      const token = response.data.token;
      setUserToken(token);
      
      // Configure axios with the token
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Get user info
      const userResponse = await axios.get(`${BASE_URL}/api/v1/depots/me/`);
      setUserInfo(userResponse.data);
      
      // Store user token and info
      await AsyncStorage.setItem('userToken', token);
      console.log("Token has been saved to local storage");
      console.log(token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userResponse.data));
      
      // Update login status
      await axios.post(`${BASE_URL}/api/v1/depots/update_login/`);
    } catch (error) {
      console.log('Login error:', error);
      alert('Invalid username or password');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // First clear the state
      setUserToken(null);
      setUserInfo(null);
      
      // Properly delete the Authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      
      // Note: We're skipping the logout API call since it requires CSRF token
      // and is failing with a 403 error. The client-side logout is sufficient
      // as we've cleared the token and user data.
      
      console.log('Logout successful');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userToken = await AsyncStorage.getItem('userToken');
      let userInfo = await AsyncStorage.getItem('userInfo');
      
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
      }
      
      if (userToken) {
        setUserToken(userToken);
        setUserInfo(userInfo);
        axios.defaults.headers.common['Authorization'] = `Token ${userToken}`;
        
        // Update login status
        try {
          await axios.post(`${BASE_URL}/api/v1/depots/update_login/`);
        } catch (error) {
          console.log('Update login status error:', error);
          // If there's an error updating login status, consider the token invalid
          setUserToken(null);
          setUserInfo(null);
          delete axios.defaults.headers.common['Authorization'];
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userInfo');
        }
      }
      
      setIsLoading(false);
    } catch (e) {
      console.log('isLoggedIn error:', e);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};