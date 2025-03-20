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
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { fetchSellerProfile } from '../../../state/seller/SellerSlice';

interface ChatMessage {
  id?: number;
  content: string;
  senderType: 'USER' | 'SELLER';
  senderId: number;
  chatRoomId: number;
  timestamp: Date;
  read: boolean;
}   

interface ChatRoom {
  id: number;
  userId: number;
  sellerId: number;
  lastMessagePreview?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  userFullName: string;
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
    if (reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
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
      const formattedMessages = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(formattedMessages);
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
    // Kiểm tra xem tin nhắn có thuộc về chat room hiện tại không
    if (selectedRoom && msg.chatRoomId === selectedRoom.id) {
      // Kiểm tra xem tin nhắn đã tồn tại chưa
      setMessages(prev => {
        if (msg.id && prev.some(m => m.id === msg.id)) {
          return prev;
        }

        const messageContainer = document.querySelector('.message-container');
        const isNearBottom = messageContainer && 
          (messageContainer.scrollHeight - messageContainer.scrollTop - messageContainer.clientHeight < 100);
        
        if (isNearBottom) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }

        return [...prev, msg];
      });
      
      // Đánh dấu tin nhắn đã đọc nếu đang xem phòng chat này
      markMessagesAsRead(selectedRoom.id);
    }

    // Cập nhật danh sách chat rooms
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

    // Thêm tin nhắn vào UI ngay lập tức
    const optimisticMessage: ChatMessage = {
      content: newMessage,
      senderType: 'SELLER',
      senderId: profile.id,
      chatRoomId: selectedRoom.id,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Cập nhật last message trong danh sách chat rooms
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

    // Gửi tin nhắn qua WebSocket hoặc REST API
    if (stompClient && stompClient.active) {
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageToSend)
      });
    } else {
      sendMessageViaRest(messageToSend);
    }

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

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: behavior as ScrollBehavior, 
        block: 'end' 
      });
    }
  };
  

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Scroll when I send messages or when at bottom already
      const messageContainer = document.querySelector('.message-container');
      const isNearBottom = messageContainer && 
        (messageContainer.scrollHeight - messageContainer.scrollTop - messageContainer.clientHeight < 100);
      
      if (lastMessage.senderType === 'SELLER' || isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

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
                          {room.userFullName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={room.unreadCount > 0 ? 'bold' : 'normal'}>
                          {room.userFullName}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          fontWeight={room.unreadCount > 0 ? 'medium' : 'normal'}
                        >
                          {room.lastMessagePreview || "Chưa có tin nhắn"}
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
      
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        {/* Message display area */}
        <Box
          className="message-container"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {selectedRoom ? (
            loadingMessages ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : messages.length > 0 ? (
              Object.entries(groupMessagesByDate()).map(([dateString, dateMessages]) => (
                <Box key={dateString} sx={{ width: '100%' }}>
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      my: 2,
                      color: 'text.secondary',
                      position: 'relative',
                      '&:before, &:after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        width: '35%',
                        height: '1px',
                        backgroundColor: 'divider',
                      },
                      '&:before': {
                        left: 0,
                      },
                      '&:after': {
                        right: 0,
                      },
                    }}
                  >
                    {dateString}
                  </Typography>
                  {dateMessages.map((msg, index) => (
                    <Box
                      key={msg.id || `${dateString}-${index}`}
                      sx={{
                        alignSelf: msg.senderType === 'SELLER' ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        ml: msg.senderType === 'SELLER' ? 'auto' : 0,
                        mr: msg.senderType === 'SELLER' ? 0 : 'auto',
                        mb: 1.5,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: msg.senderType === 'SELLER' ? 'primary.main' : 'grey.100',
                          color: msg.senderType === 'SELLER' ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.8,
                            textAlign: msg.senderType === 'SELLER' ? 'right' : 'left'
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
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
                <Typography>Bắt đầu cuộc trò chuyện</Typography>
              </Box>
            )
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.secondary' }}>
              <Typography>Chọn một cuộc trò chuyện để bắt đầu</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message input area */}
        {selectedRoom && (
          <Paper
            component="form"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              size="small"
              autoComplete="off"
              sx={{ flex: 1 }}
            />
            <IconButton 
              color="primary" 
              type="submit" 
              disabled={!newMessage.trim()}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Paper>
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