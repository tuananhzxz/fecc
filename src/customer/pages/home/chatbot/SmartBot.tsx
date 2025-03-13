import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot } from 'lucide-react';
import { analyzeUserMessage, generateProductResponse } from './ChatBotUltil';
import { Product } from '../../../../state/customer/ProductCustomerSlice';
import './SmartChatBot.css';

interface Message {
  type: 'user' | 'bot';
  content: string;
  isProduct?: boolean;
  timestamp: number;
}

interface ConversationContext {
  recentTopics: string[];
  userPreferences: {
    preferredCategories: string[];
    preferredSizes: string[];
    preferredColors: string[];
    preferredBrands: string[];
    priceRange?: { min: number; max: number };
    preferredRating?: number;
    preferredDiscount?: number;
  };
  lastInteraction: number;
  previousQueries: any[];
  searchHistory: string[];
}

const SmartChatBot = ({ products }: { products: Product[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý ảo của ShopTanh. Tôi có thể giúp bạn tìm hiểu về sản phẩm, giá cả và đặt hàng. Bạn cần giúp đỡ gì không?',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasShownGreeting, setHasShownGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userIdleTime, setUserIdleTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const idleThreshold = 30000;
  const [hasInteracted, setHasInteracted] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    recentTopics: [],
    userPreferences: {
      preferredCategories: [],
      preferredSizes: [],
      preferredColors: [],
      preferredBrands: [],
    },
    lastInteraction: Date.now(),
    previousQueries: [],
    searchHistory: []
  });

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveConversation = () => {
    const conversationData = {
      messages: messages,
      context: context,
    };
    localStorage.setItem('chatHistory', JSON.stringify(conversationData));
  };

  const loadConversation = () => {
    const savedData = localStorage.getItem('chatHistory');
    if (savedData) {
      const { messages: savedMessages, context: savedContext } = JSON.parse(savedData);
      setMessages(savedMessages);
      setContext(savedContext);
    }
  };

  const analyzeMessageTopics = (message: string): string[] => {
    const topics = [];
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('giá')) topics.push('price');
    if (messageLower.includes('size')) topics.push('size');
    if (messageLower.includes('màu')) topics.push('color');
    
    return topics;
  };

  const extractPreferences = (message: string) => {
    const preferences: any = {
      categories: [],
      sizes: [],
      colors: [],
      brands: []
    };
    
    const messageLower = message.toLowerCase();
    
    // Phân tích categories
    if (messageLower.includes('áo')) preferences.categories.push('áo');
    if (messageLower.includes('quần')) preferences.categories.push('quần');
    if (messageLower.includes('váy')) preferences.categories.push('váy');
    
    // Phân tích sizes
    ['s', 'm', 'l', 'xl'].forEach(size => {
      if (messageLower.includes(size)) preferences.sizes.push(size);
    });
    
    // Phân tích màu sắc
    const colors = ['đen', 'trắng', 'đỏ', 'xanh', 'vàng', 'hồng', 'tím', 'xám', 'nâu', 'cam'];
    colors.forEach(color => {
      if (messageLower.includes(color)) preferences.colors.push(color);
    });
    
    // Phân tích thương hiệu
    const brands = ['adidas', 'nike', 'gucci', 'zara', 'h&m', 'uniqlo', 'puma', 'levi\'s', 'vans'];
    brands.forEach(brand => {
      if (messageLower.includes(brand)) preferences.brands.push(brand);
    });
    
    // Phân tích giá
    const priceMatch = messageLower.match(/(\d+)k?đ?\s*-\s*(\d+)k?đ?/);
    if (priceMatch) {
      preferences.priceRange = {
        min: parseInt(priceMatch[1]) * (messageLower.includes('k') ? 1000 : 1),
        max: parseInt(priceMatch[2]) * (messageLower.includes('k') ? 1000 : 1)
      };
    }
    
    if (messageLower.includes('đánh giá') || messageLower.includes('review')) {
      const ratingMatch = messageLower.match(/(\d+)\s*sao/);
      if (ratingMatch) {
        preferences.preferredRating = parseInt(ratingMatch[1]);
      }
    }
    
    if (messageLower.includes('giảm giá')) {
      const discountMatch = messageLower.match(/giảm\s*(\d+)%/);
      if (discountMatch) {
        preferences.preferredDiscount = parseInt(discountMatch[1]);
      }
    }
    
    return preferences;
  };

  const updateContext = (message: string) => {
    setContext(prevContext => {
      const newContext = { ...prevContext };
      const topics = analyzeMessageTopics(message);
      const preferences = extractPreferences(message);

      newContext.recentTopics = Array.from(new Set([...topics, ...prevContext.recentTopics])).slice(0, 5); 
      newContext.searchHistory = [...prevContext.searchHistory, message].slice(-10);

      if (preferences.categories) {
        newContext.userPreferences.preferredCategories = Array.from(
          new Set([...preferences.categories, ...prevContext.userPreferences.preferredCategories])
        );
      }
      if (preferences.sizes) {
        newContext.userPreferences.preferredSizes = Array.from(
          new Set([...preferences.sizes, ...prevContext.userPreferences.preferredSizes])
        );
      }
      if (preferences.colors) {
        newContext.userPreferences.preferredColors = Array.from(
          new Set([...preferences.colors, ...prevContext.userPreferences.preferredColors])
        );
      }
      if (preferences.brands) {
        newContext.userPreferences.preferredBrands = Array.from(
          new Set([...preferences.brands, ...prevContext.userPreferences.preferredBrands])
        );
      }
      if (preferences.priceRange) {
        newContext.userPreferences.priceRange = preferences.priceRange;
      }
      if (preferences.preferredRating) {
        newContext.userPreferences.preferredRating = preferences.preferredRating;
      }
      if (preferences.preferredDiscount) {
        newContext.userPreferences.preferredDiscount = preferences.preferredDiscount;
      }
      
      // Lưu truy vấn sản phẩm
      if (analyzeUserMessage(message)) {
        const query = {
          type: preferences.categories[0] || 'unknown',
          color: preferences.colors[0],
          size: preferences.sizes[0],
          brand: preferences.brands[0],
          minPrice: preferences.priceRange?.min,
          maxPrice: preferences.priceRange?.max,
          minRating: preferences.preferredRating,
          minDiscount: preferences.preferredDiscount
        };
        newContext.previousQueries = [...prevContext.previousQueries, query].slice(-5);
      }
      
      newContext.lastInteraction = Date.now();
      return newContext;
    });
  };

  const generateContextAwareResponse = (message: string, context: ConversationContext): string => {
    const messageLower = message.toLowerCase();
    const relatedToPrevious = context.recentTopics.some(topic => 
      messageLower.includes(topic)
    );

    if (relatedToPrevious) {
      return `Dựa trên cuộc trò chuyện trước đây của chúng ta về ${context.recentTopics.join(', ')}, `;
    }

    return "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về sản phẩm, giá cả hoặc cách đặt hàng không?";
  };

  const generateSmartResponse = (message: string, products: Product[], context: ConversationContext): string => {
    const baseResponse = generateProductResponse(message, products, context);
    
    if (context.userPreferences.preferredCategories.length > 0) {
      const recommendations = products.filter(product => 
        context.userPreferences.preferredCategories.some(category => 
          product.title.toLowerCase().includes(category)
        )
      ).slice(0, 3);

      if (recommendations.length > 0) {
        return `${baseResponse}\n\nDựa trên sở thích của bạn, bạn có thể quan tâm đến:\n${
          recommendations.map(product => `- ${product.title} (${product.sellingPrice}đ)`).join('\n')
        }`;
      }
    }

    return baseResponse;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    updateContext(inputMessage);
    setIsTyping(true);

    const newMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    const isProductQuery = analyzeUserMessage(inputMessage);
    const botResponse = isProductQuery 
      ? generateSmartResponse(inputMessage, products, context)
      : generateContextAwareResponse(inputMessage, context);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: botResponse,
        isProduct: isProductQuery,
        timestamp: Date.now()
      }]);
    }, 1000);
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
    setHasInteracted(true);
    setUserIdleTime(0);
  };

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    saveConversation();
  }, [messages, context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const idleTimer = setInterval(() => {
      if (!isOpen) return;
      setUserIdleTime(prev => prev + 1000);
    }, 1000);

    const resetTimer = () => setUserIdleTime(0);
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);

    return () => {
      clearInterval(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!hasShownGreeting && products.length > 0) {
      setTimeout(() => {
        setIsOpen(true);
        setMessages([
          {
            type: 'bot',
            content: 'Xin chào! Tôi là trợ lý ảo của ShopTanh. Tôi có thể giúp bạn tìm hiểu về sản phẩm, giá cả và đặt hàng. Bạn cần giúp đỡ gì không?',
            timestamp: Date.now()
          }
        ]);
        setHasShownGreeting(true);
      }, 3000);
    }
  }, [hasShownGreeting, products]);

  useEffect(() => {
    if (userIdleTime >= idleThreshold && isOpen) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Tôi thấy bạn đang xem các sản phẩm của chúng tôi. Bạn cần tôi tư vấn gì không?',
        timestamp: Date.now()
      }]);
      setUserIdleTime(0);
    }
  }, [userIdleTime, isOpen]);

  return (
    <div className="fixed bottom-20 mb-4 right-8 z-50">
      {isOpen && !isMinimized && (
        <div className="chat-window mb-4 w-96 bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="text-white" size={24} />
              <div className="flex flex-col">
                <span className="text-white font-medium">Trợ lý ShopTanh</span>
                <span className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ bạn</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <Minimize2 size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`message-content px-4 py-2 rounded-lg max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : message.isProduct
                      ? 'bg-white shadow-md'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Bot size={16} />
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isMinimized && (
        <div 
          className="mb-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-lg shadow-lg cursor-pointer flex items-center space-x-2 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
          onClick={() => setIsMinimized(false)}
        >
          <Bot size={20} />
          <span>Trợ lý ShopTanh</span>
          <Maximize2 size={18} />
        </div>
      )}

      {/* Toggle button */}
      {!isOpen && !isMinimized && (
        <button
          onClick={toggleChat}
          className={`bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 
            rounded-full shadow-lg hover:from-blue-700 hover:to-blue-600 
            transition-all duration-300 ${!hasInteracted ? 'animate-bounce-limited' : ''}`}
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default SmartChatBot;