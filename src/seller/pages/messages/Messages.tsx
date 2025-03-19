import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, Typography, List, ListItemAvatar, 
  ListItemText, Avatar, TextField, IconButton, Paper,
  Badge, ListItemButton, Divider, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api, API_URL } from '../../../config/Api';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { fetchSellerProfile } from '../../../state/seller/SellerSlice';

interface ChatMessage {
  id?: number;
  content: string;
  sender: 'user' | 'seller';
  senderId: number;
  chatRoomId: number;
  timestamp: Date;
  read: boolean;
}   

interface ChatRoom {
  id: number;
  userId: number;
  sellerId: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const { profile } = useAppSelector((state) => state.seller);
  const dispatch = useAppDispatch();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const jwt = localStorage.getItem('sellerToken');
    if (jwt) {
      dispatch(fetchSellerProfile(jwt));
    }

    return () => {
      // Clear any pending timeouts when component unmounts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (profile?.id) {
      fetchChatRooms();
      connectWebSocket();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      // Mark messages as read when room is selected
      markMessagesAsRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    if (!profile?.id || connectionStatus === 'connecting') return;

    // Clean up any existing connection
    disconnectWebSocket();

    setConnectionStatus('connecting');
    setError(null);
    
    const token = localStorage.getItem('sellerToken');
    if (!token) {
      setError('No authentication token found');
      setConnectionStatus('disconnected');
      return;
    }

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        },
        debug: function (str) {
          // Limiting debug logs to reduce console spam
          if (str.includes('error') || str.includes('connected') || str.includes('disconnected')) {
            console.log('WebSocket:', str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected successfully');
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          setError(null);

          // Subscribe to seller's private queue
          client.subscribe(`/user/${profile.id}/queue/messages`, (message) => {
            const receivedMsg = JSON.parse(message.body);
            handleReceivedMessage(receivedMsg);
          });

          // Also subscribe to general updates about chat rooms
          client.subscribe(`/topic/chatRooms/seller/${profile.id}`, () => {
            fetchChatRooms(); // Refresh chat rooms when there's an update
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setError(`Connection error: ${frame.headers.message}`);
          setConnectionStatus('disconnected');
          handleReconnect();
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          if (connectionStatus === 'connected') {
            setConnectionStatus('disconnected');
            handleReconnect();
          }
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setError('Failed to connect to chat server');
          setConnectionStatus('disconnected');
          handleReconnect();
        }
      });

      client.activate();
      setStompClient(client);
      
    } catch (error) {
      console.error('Error creating WebSocket client:', error);
      setError('Failed to initialize chat connection');
      setConnectionStatus('disconnected');
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    // Only try to reconnect if we haven't exceeded max attempts
    if (reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1);
      
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Set a timeout to reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
        connectWebSocket();
      }, 5000);
    } else {
      setError('Unable to connect to chat server after multiple attempts. Please try again later.');
    }
  };

  const disconnectWebSocket = () => {
    if (stompClient) {
      if (stompClient.active) {
        stompClient.deactivate();
      }
      setStompClient(null);
    }
  };

  const fetchChatRooms = async () => {
    if (!profile?.id) return;
    
    setLoadingRooms(true);
    try {
      const response = await api.get(`/api/chat/rooms/seller/${profile.id}`);
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Không thể tải danh sách chat');
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: number) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/api/chat/messages/${roomId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async (roomId: number) => {
    try {
      await api.post(`/api/chat/rooms/${roomId}/read`);
      setChatRooms(prev => prev.map(r => 
        r.id === roomId ? { ...r, unreadCount: 0 } : r
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleReceivedMessage = (msg: ChatMessage) => {
    // Update messages if this is for the currently selected room
    if (selectedRoom && msg.chatRoomId === selectedRoom.id) {
      setMessages(prev => [...prev, msg]);
      // Mark as read since we're viewing this room
      markMessagesAsRead(selectedRoom.id);
    } else {
      // Otherwise increment unread count for the room
      setChatRooms(prev => prev.map(room => {
        if (room.id === msg.chatRoomId) {
          return {
            ...room,
            lastMessage: msg.content,
            lastMessageTime: new Date(msg.timestamp),
            unreadCount: room.unreadCount + 1
          };
        }
        return room;
      }));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom || !profile?.id) return;

    const messageToSend = {
      content: newMessage,
      messageType: 'TEXT',
      senderId: profile.id,
      senderType: 'SELLER',
      chatRoomId: selectedRoom.id
    };

    // Optimistically add message to UI
    const optimisticMessage: ChatMessage = {
      content: newMessage,
      sender: 'seller',
      senderId: profile.id,
      chatRoomId: selectedRoom.id,
      timestamp: new Date(),
      read: false
    };
    setMessages(prev => [...prev, optimisticMessage]);

    // Try to send via WebSocket first, fall back to REST
    if (stompClient && stompClient.active && connectionStatus === 'connected') {
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageToSend)
      });
    } else {
      sendMessageViaRest(messageToSend);
    }

    // Update the chat room's last message in the list
    setChatRooms(prev => prev.map(room => {
      if (room.id === selectedRoom.id) {
        return {
          ...room,
          lastMessage: newMessage,
          lastMessageTime: new Date()
        };
      }
      return room;
    }));

    setNewMessage('');
  };

  const sendMessageViaRest = async (messageData: any) => {
    try {
      await api.post('/api/chat/message', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Không thể gửi tin nhắn');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine the date string for grouping messages
  const getMessageDateString = (timestamp: Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groupedMessages: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const dateString = getMessageDateString(new Date(message.timestamp));
      if (!groupedMessages[dateString]) {
        groupedMessages[dateString] = [];
      }
      groupedMessages[dateString].push(message);
    });
    
    return groupedMessages;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 64px)',
        bgcolor: 'background.default'
      }}
    >
      {/* Chat Rooms List */}
      <Paper 
        elevation={3}
        sx={{ 
          width: 300, 
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="h6">Tin nhắn</Typography>
          <IconButton 
            size="small" 
            color="inherit" 
            onClick={fetchChatRooms}
            disabled={loadingRooms}
          >
            {loadingRooms ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          </IconButton>
        </Box>
        
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : chatRooms.length > 0 ? (
            <List disablePadding>
              {chatRooms.map((room) => (
                <React.Fragment key={room.id}>
                  <ListItemButton
                    selected={selectedRoom?.id === room.id}
                    onClick={() => handleRoomSelect(room)}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="error"
                        badgeContent={room.unreadCount}
                        invisible={room.unreadCount === 0}
                      >
                        <Avatar sx={{ bgcolor: room.unreadCount > 0 ? 'secondary.main' : 'primary.main' }}>
                          {room.userId.toString().charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={room.unreadCount > 0 ? 'bold' : 'normal'}>
                          Người dùng {room.userId}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          fontWeight={room.unreadCount > 0 ? 'medium' : 'normal'}
                        >
                          {room.lastMessage || "Chưa có tin nhắn"}
                        </Typography>
                      }
                    />
                    {room.lastMessageTime && (
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                        {formatMessageTime(room.lastMessageTime)}
                      </Typography>
                    )}
                  </ListItemButton>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>Không có cuộc trò chuyện nào</Typography>
            </Box>
          )}
        </Box>
        
        {/* Connection status indicator */}
        <Box 
          sx={{ 
            p: 1, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            bgcolor: connectionStatus === 'connected' ? 'success.light' : 
                    connectionStatus === 'connecting' ? 'warning.light' : 'error.light',
            gap: 1
          }}
        >
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: connectionStatus === 'connected' ? 'success.main' : 
                      connectionStatus === 'connecting' ? 'warning.main' : 'error.main'
            }}
          />
          <Typography variant="caption" fontWeight="medium">
            {connectionStatus === 'connected' ? 'Đã kết nối' : 
             connectionStatus === 'connecting' ? 'Đang kết nối...' : 'Mất kết nối'}
          </Typography>
          {connectionStatus !== 'connected' && (
            <IconButton 
              size="small" 
              onClick={connectWebSocket}
              disabled={connectionStatus === 'connecting'}
              sx={{ ml: 'auto' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {selectedRoom ? (
          <>
            <Paper
              elevation={2} 
              sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                borderRadius: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedRoom.userId.toString().charAt(0)}
                </Avatar>
                <Typography variant="h6">
                  Người dùng {selectedRoom.userId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {connectionStatus === 'connected' ? 'Trực tuyến' : 'Ngoại tuyến'}
                </Typography>
              </Box>
            </Paper>
            
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#f5f5f5'
              }}
            >
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : messages.length > 0 ? (
                // Display messages grouped by date
                Object.entries(groupMessagesByDate()).map(([dateString, dateMessages]) => (
                  <Box key={dateString} sx={{ mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2 
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.1)', 
                          px: 2, 
                          py: 0.5, 
                          borderRadius: 10 
                        }}
                      >
                        {dateString}
                      </Typography>
                    </Box>
                    
                    {dateMessages.map((msg, index) => (
                      <Box
                        key={msg.id || `${msg.timestamp}-${index}`}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.sender === 'seller' ? 'flex-end' : 'flex-start',
                          mb: 1.5
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            borderRadius: 2,
                            bgcolor: msg.sender === 'seller' ? 'primary.main' : 'white',
                            color: msg.sender === 'seller' ? 'white' : 'text.primary',
                            position: 'relative',
                            '&::after': msg.sender === 'seller' ? {
                              content: '""',
                              position: 'absolute',
                              bottom: 12,
                              right: -8,
                              width: 0,
                              height: 0,
                              border: '8px solid transparent',
                              borderLeftColor: 'primary.main',
                              borderRight: 0
                            } : {
                              content: '""',
                              position: 'absolute',
                              bottom: 12,
                              left: -8,
                              width: 0,
                              height: 0,
                              border: '8px solid transparent',
                              borderRightColor: 'white',
                              borderLeft: 0
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {msg.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.8,
                              textAlign: 'right'
                            }}
                          >
                            {formatMessageTime(msg.timestamp)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                ))
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: 'text.secondary' 
                }}>
                  <Typography>Hãy bắt đầu cuộc trò chuyện</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
            
            <Paper 
              elevation={3}
              sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                borderRadius: 0
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={connectionStatus === 'connecting'}
                  variant="outlined"
                  size="small"
                  autoComplete="off"
                  InputProps={{
                    sx: { borderRadius: 3, bgcolor: 'background.paper' }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || connectionStatus === 'connecting'}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
              gap: 2
            }}
          >
            <Typography variant="h5">Chào mừng đến với tin nhắn</Typography>
            <Typography align="center" color="text.secondary">
              Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Error notification */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Messages;