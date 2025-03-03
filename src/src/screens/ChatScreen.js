import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  
  const messageId = route.params?.messageId;
  const compose = route.params?.compose;

  // Update header only when receiver is available
  useEffect(() => {
    if (receiver) {
      updateHeaderWithReceiverInfo();
    } else {
      // Basic header styling without receiver info
      navigation.setOptions({
        headerStyle: {
          backgroundColor: '#0078D7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      });
    }
  }, [receiver]);

  // Initial setup
  useEffect(() => {
    if (compose) {
      navigation.setOptions({ title: 'New Message to Officer' });
      findOfficer();
      setLoading(false);
    } else if (messageId) {
      loadMessage();
    }

    // Simulate typing indicators
    const fakeSocketConnection = setInterval(() => {
      if (Math.random() > 0.9 && receiver) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    }, 10000);

    return () => clearInterval(fakeSocketConnection);
  }, [messageId, compose]);

  const updateHeaderWithReceiverInfo = () => {
    if (!receiver || !receiver.name) return;
    
    navigation.setOptions({
      title: receiver.name,
      headerStyle: {
        backgroundColor: '#0078D7',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
      },
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerAvatarContainer}>
            <Text style={styles.avatarText}>{receiver.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{receiver.name}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('OfficerProfile', { officerId: receiver.id })}
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  };

  const findOfficer = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/officers/available/`);
      if (response.data) {
        // Store the receiver data first
        setReceiver(response.data);
        // Basic title until the receiver state is updated and triggers the header update
        navigation.setOptions({ title: response.data.name });
      } else {
        Alert.alert('Error', 'No officer available to chat with');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error finding officer:', error);
      Alert.alert('Error', 'Could not find an officer to chat with');
      navigation.goBack();
    }
  };

  const loadMessage = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/messages/${messageId}/`);
      const messageData = response.data;
      
      const receiverId = messageData.sender === userInfo.user.id ? messageData.receiver : messageData.sender;
      const receiverName = messageData.sender === userInfo.user.id ? messageData.receiver_name : messageData.sender_name;
      
      // Store receiver data first with a basic title
      setReceiver({
        id: receiverId,
        name: receiverName,
      });
      
      navigation.setOptions({ title: receiverName });
      
      // Now load the conversation
      loadConversation(receiverId);
    } catch (error) {
      console.log('Error loading message:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not load the message');
    }
  };

  const loadConversation = async (receiverId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/messages/conversation/${receiverId}/`);
      
      // Group messages by date
      const groupedMessages = groupMessagesByDate(response.data);
      setMessages(groupedMessages);
    } catch (error) {
      console.log('Error loading conversation:', error);
      Alert.alert('Error', 'Could not load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const groupMessagesByDate = (messagesList) => {
    // Add a flag to separate messages by date
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    // Create a new array with date separators
    let result = [];
    let currentDate = '';
    
    messagesList.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        let dateLabel = '';
        
        if (messageDate === today) {
          dateLabel = 'Today';
        } else if (messageDate === yesterdayString) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = new Date(message.timestamp).toLocaleDateString();
        }
        
        result.push({ id: `date-${messageDate}`, type: 'date', content: dateLabel });
      }
      
      result.push({ ...message, type: 'message' });
    });
    
    return result;
  };

  const sendMessage = async () => {
    if (!text.trim() || !receiver) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      type: 'message',
      content: text,
      sender: userInfo.user.id,
      receiver: receiver.id,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    setText('');
    
    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
    setSending(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/messages/send_to_officer/`, {
        content: text,
        receiver_id: receiver.id
      });
      
      // Update the temp message with the real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...response.data, type: 'message', status: 'sent' } : msg
      ));
    } catch (error) {
      console.log('Error sending message:', error);
      
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
      
      // Show retry option
      Alert.alert('Error', 'Failed to send message', [
        { text: 'Retry', onPress: () => resendMessage(tempId, text) },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } finally {
      setSending(false);
    }
  };

  const resendMessage = async (tempId, content) => {
    // Update UI to show sending again
    setMessages(prev => prev.map(msg => 
      msg.id === tempId ? { ...msg, status: 'sending' } : msg
    ));
    
    setSending(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/messages/send_to_officer/`, {
        content,
        receiver_id: receiver.id
      });
      
      // Update the message status
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...response.data, type: 'message', status: 'sent' } : msg
      ));
    } catch (error) {
      // Mark as failed again
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
      
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.content}</Text>
        </View>
      );
    }
    
    const isMe = item.sender === userInfo.user.id;
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && receiver && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {receiver.name ? receiver.name.charAt(0) : '?'}
            </Text>
          </View>
        )}
        
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            {isMe && (
              <View style={styles.messageStatus}>
                {item.status === 'sending' && (
                  <ActivityIndicator size="small" color="#999" />
                )}
                {item.status === 'sent' && (
                  <Ionicons name="checkmark" size={16} color="#999" />
                )}
                {item.status === 'delivered' && (
                  <Ionicons name="checkmark-done" size={16} color="#999" />
                )}
                {item.status === 'read' && (
                  <Ionicons name="checkmark-done" size={16} color="#0078D7" />
                )}
                {item.status === 'failed' && (
                  <Ionicons name="alert-circle" size={16} color="#f44336" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078D7" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0078D7" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#666" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            
            {text.trim() ? (
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton}>
                <Ionicons name="mic" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  headerButton: {
    marginRight: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#005cb2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 18,
    maxWidth: '75%',
    padding: 12,
    marginBottom: 2,
  },
  myBubble: {
    backgroundColor: '#0078D7',
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: '#999',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 18,
    padding: 12,
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
  typingIndicator: {
    flexDirection: 'row',
    width: 32,
    height: 8,
    alignItems: 'center',
  },
  typingDot: {
    backgroundColor: '#999',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  micButton: {
    padding: 8,
  },
});

export default ChatScreen;

/*// screens/ChatScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [receiver, setReceiver] = useState(null);
  const flatListRef = useRef(null);
  
  const messageId = route.params?.messageId;
  const compose = route.params?.compose;

  useEffect(() => {
    if (compose) {
      // This is a new chat, find an officer to send to
      navigation.setOptions({ title: 'New Message to Officer' });
      findOfficer();
      setLoading(false);
    } else if (messageId) {
      // Load conversation based on the message ID
      loadMessage();
    }
  }, [messageId, compose]);

  const findOfficer = async () => {
    try {
      // For simplicity, assuming there's an API endpoint to get an officer
      // In a real app, you might want to list officers and let the user choose
      const response = await axios.get(`${BASE_URL}/api/v1/officers/available/`);
      if (response.data) {
        setReceiver(response.data);
        navigation.setOptions({ title: `Chat with ${response.data.name}` });
      } else {
        Alert.alert('Error', 'No officer available to chat with');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error finding officer:', error);
      Alert.alert('Error', 'Could not find an officer to chat with');
      navigation.goBack();
    }
  };

  const loadMessage = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/messages/${messageId}/`);
      const messageData = response.data;
      
      // Set the sender as the receiver for this conversation
      const receiverId = messageData.sender === userInfo.user.id ? messageData.receiver : messageData.sender;
      const receiverName = messageData.sender === userInfo.user.id ? messageData.receiver_name : messageData.sender_name;
      
      setReceiver({
        id: receiverId,
        name: receiverName,
      });
      
      navigation.setOptions({ title: `Chat with ${receiverName}` });
      
      // Now load the conversation
      loadConversation(receiverId);
    } catch (error) {
      console.log('Error loading message:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not load the message');
    }
  };

  const loadConversation = async (receiverId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/messages/conversation/${receiverId}/`);
      setMessages(response.data);
    } catch (error) {
      console.log('Error loading conversation:', error);
      Alert.alert('Error', 'Could not load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !receiver) return;
    
    setSending(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/messages/send_to_officer/`, {
        content: text,
      });
      
      // Add message to the list
      setMessages(prev => [...prev, response.data]);
      setText('');
      
      // Scroll to bottom
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.log('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === userInfo.user.id;
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078D7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !text.trim() && styles.disabledButton]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 15,
  },
  messageContainer: {
    marginVertical: 5,
    paddingHorizontal: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    maxWidth: '80%',
    padding: 12,
  },
  myBubble: {
    backgroundColor: '#0078D7',
  },
  theirBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  myBubble: {
    backgroundColor: '#0078D7',
  },
  theirBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
  },
  myBubble: {
    backgroundColor: '#0078D7',
  },
  theirBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: props => props.style.backgroundColor === '#0078D7' ? '#fff' : '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
    color: props => props.style.backgroundColor === '#0078D7' ? '#e0e0e0' : '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0078D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ChatScreen;
*/