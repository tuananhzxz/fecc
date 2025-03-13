import { Product } from "../../../../state/customer/ProductCustomerSlice";

interface ProductQuery {
  type: string;
  color?: string;
  size?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  minDiscount?: number;
  minQuantity?: number;
  brand?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
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
  previousQueries: ProductQuery[];
  searchHistory: string[];
}

export const analyzeUserMessage = (message: string): boolean => {
  const productKeywords = [
    'giá', 'sản phẩm', 'mua', 'đặt hàng', 'chi tiết', 'thông tin',
    'áo', 'quần', 'váy', 'size', 'đánh giá', 'giảm giá', 'còn hàng',
    'khuyến mãi', 'review', 'số lượng', 'tồn kho', 'bán chạy', 'thương hiệu',
    'hàng mới', 'xu hướng', 'phổ biến', 'chất lượng', 'so sánh', 'gợi ý'
  ];
  const message_lower = message.toLowerCase();
  return productKeywords.some(keyword => message_lower.includes(keyword));
};

const parseProductQuery = (message: string): ProductQuery => {
  const message_lower = message.toLowerCase();
  const query: ProductQuery = {
    type: 'unknown'
  };

  // Phân tích loại sản phẩm
  const productTypes = {
    'áo': ['áo', 'áo sơ mi', 'áo thun', 'áo khoác', 'áo len', 'áo phông'],
    'quần': ['quần', 'quần jean', 'quần kaki', 'quần short', 'quần tây', 'quần jogger'],
    'váy': ['váy', 'đầm', 'chân váy', 'váy dài', 'váy ngắn', 'váy xòe']
  };
  
  for (const [type, keywords] of Object.entries(productTypes)) {
    if (keywords.some(keyword => message_lower.includes(keyword))) {
      query.type = type;
      break;
    }
  }

  // Phân tích màu sắc
  const colors = ['đen', 'trắng', 'đỏ', 'xanh', 'vàng', 'hồng', 'tím', 'xám', 'nâu', 'cam', 'xanh dương', 'xanh lá'];
  colors.forEach(color => {
    if (message_lower.includes(color)) query.color = color;
  });

  // Phân tích size
  const sizes = ['s', 'm', 'l', 'xl', 'xxl', 'xxxl', '2xl', '3xl', 'free size', 'oversize'];
  sizes.forEach(size => {
    if (message_lower.includes(size)) query.size = size;
  });

  // Phân tích đánh giá
  if (message_lower.includes('đánh giá tốt') || message_lower.includes('review tốt')) {
    query.minRating = 4;
  } else if (message_lower.includes('đánh giá cao nhất') || message_lower.includes('tốt nhất')) {
    query.minRating = 4.5;
    query.sortBy = 'rating';
  } else if (message_lower.includes('đánh giá')) {
    const ratingMatch = message_lower.match(/(\d+)(?:\.\d+)?\s*sao/);
    if (ratingMatch) {
      query.minRating = parseFloat(ratingMatch[1]);
    }
  }

  // Phân tích giá
  const pricePatterns = [
    /(\d+)(?:k|nghìn|ngàn|\.000|\.0{3})?\s*(?:-|đến)\s*(\d+)(?:k|nghìn|ngàn|\.000|\.0{3})?/,
    /dưới\s*(\d+)(?:k|nghìn|ngàn|\.000|\.0{3})?/,
    /trên\s*(\d+)(?:k|nghìn|ngàn|\.000|\.0{3})?/,
    /khoảng\s*(\d+)(?:k|nghìn|ngàn|\.000|\.0{3})?/
  ];

  for (const pattern of pricePatterns) {
    const match = message_lower.match(pattern);
    if (match) {
      const isThousand = message_lower.includes('k') || 
                         message_lower.includes('nghìn') || 
                         message_lower.includes('ngàn') || 
                         message_lower.includes('.000');
      const multiplier = isThousand ? 1000 : 1;
      
      if (match[0].includes('dưới')) {
        query.maxPrice = parseInt(match[1]) * multiplier;
      } else if (match[0].includes('trên')) {
        query.minPrice = parseInt(match[1]) * multiplier;
      } else if (match[0].includes('khoảng')) {
        const basePrice = parseInt(match[1]) * multiplier;
        query.minPrice = basePrice * 0.9;
        query.maxPrice = basePrice * 1.1;
      } else if (match[2]) {
        query.minPrice = parseInt(match[1]) * multiplier;
        query.maxPrice = parseInt(match[2]) * multiplier;
      }
      break;
    }
  }

  // Phân tích giảm giá
  if (message_lower.includes('giảm giá') || message_lower.includes('khuyến mãi') || message_lower.includes('sale')) {
    const discountMatch = message_lower.match(/giảm\s*(\d+)%/);
    if (discountMatch) {
      query.minDiscount = parseInt(discountMatch[1]);
    } else if (message_lower.includes('giảm sâu') || message_lower.includes('giảm nhiều')) {
      query.minDiscount = 30; // Giảm sâu thường từ 30% trở lên
    } else if (message_lower.includes('giảm giá sốc')) {
      query.minDiscount = 50; // Giảm sốc thường từ 50% trở lên
    } else {
      query.minDiscount = 10; // Mặc định tìm sản phẩm giảm ít nhất 10%
    }
  }

  // Phân tích số lượng còn lại
  if (message_lower.includes('còn hàng') || message_lower.includes('tồn kho')) {
    query.minQuantity = 1;
  }

  // Phân tích thương hiệu
  const brands = ['adidas', 'nike', 'gucci', 'zara', 'h&m', 'uniqlo', 'puma', 'levi\'s', 'vans'];
  brands.forEach(brand => {
    if (message_lower.includes(brand)) query.brand = brand;
  });

  // Phân tích sắp xếp
  if (message_lower.includes('giá thấp nhất') || message_lower.includes('giá rẻ nhất') || message_lower.includes('rẻ nhất')) {
    query.sortBy = 'price_asc';
  } else if (message_lower.includes('giá cao nhất') || message_lower.includes('đắt nhất')) {
    query.sortBy = 'price_desc';
  } else if (message_lower.includes('mới nhất') || message_lower.includes('hàng mới')) {
    query.sortBy = 'newest';
  }

  return query;
};

const findMatchingProducts = (query: ProductQuery, products: Product[]): Product[] => {
  let filteredProducts = products.filter(product => {
    const productLower = product.title.toLowerCase();
    const descriptionLower = product.description.toLowerCase();
    
    const typeMatch = query.type === 'unknown' || productLower.includes(query.type) || descriptionLower.includes(query.type);
    const colorMatch = !query.color || descriptionLower.includes(query.color);
    const sizeMatch = !query.size || descriptionLower.includes(query.size);
    const brandMatch = !query.brand || productLower.includes(query.brand) || descriptionLower.includes(query.brand);
    
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;
    
    const ratingMatch = !query.minRating || avgRating >= query.minRating;
    
    const priceMatch = (!query.minPrice || product.sellingPrice >= query.minPrice) &&
                      (!query.maxPrice || product.sellingPrice <= query.maxPrice);
    
    const discountMatch = !query.minDiscount || product.discountPercent >= query.minDiscount;
    
    const quantityMatch = !query.minQuantity || product.quantity > 0;

    return typeMatch && colorMatch && sizeMatch && ratingMatch && priceMatch && discountMatch && quantityMatch && brandMatch;
  });

  // Sắp xếp sản phẩm nếu có yêu cầu
  if (query.sortBy) {
    switch (query.sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => {
          const avgRatingA = a.reviews.length > 0 
            ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
            : 0;
          const avgRatingB = b.reviews.length > 0 
            ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
            : 0;
          return avgRatingB - avgRatingA;
        });
        break;
      case 'newest':
        // Giả sử có trường createdAt hoặc id lớn hơn nghĩa là mới hơn
        filteredProducts.sort((a, b) => b.id - a.id);
        break;
    }
  }

  // Giới hạn số lượng sản phẩm trả về để tránh quá nhiều
  return filteredProducts.slice(0, 6);
};

const generateProductCards = (products: Product[]): string => {
  if (products.length === 0) return '';

  return products.map(product => {
    const formattedTitle = product.title.toLowerCase().replace(/ /g, '-');
    const avgRating = product.reviews.length > 0 
      ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
      : 'Chưa có đánh giá';
    
    const originalPrice = product.discountPercent > 0 
      ? Math.round(product.sellingPrice / (1 - product.discountPercent/100))
      : null;
    
    return `
      <div class="product-card" onclick="window.location.href='/product-details/${formattedTitle}/${product.description}/${product.id}'">
        <div class="product-image-container">
          <img src="${product.images[0]}" alt="${product.title}" />
          ${product.discountPercent > 0 ? `<span class="discount-badge">-${product.discountPercent}%</span>` : ''}
          ${product.quantity < 5 && product.quantity > 0 ? `<span class="low-stock-badge">Sắp hết hàng</span>` : ''}
        </div>
        <h3>${product.title}</h3>
        <div class="price-container">
          <p class="current-price">${product.sellingPrice.toLocaleString()}đ</p>
          ${originalPrice ? `<p class="original-price">${originalPrice.toLocaleString()}đ</p>` : ''}
        </div>
        <p class="product-description">${product.description.length > 100 ? product.description.substring(0, 97) + '...' : product.description}</p>
        <div class="product-meta">
          <p class="rating"><span class="stars">⭐</span> ${avgRating} (${product.numRatings} lượt)</p>
          <p class="stock-info">Còn lại: ${product.quantity} sản phẩm</p>
        </div>
        <button class="view-details-btn">Xem chi tiết</button>
      </div>
    `;
  }).join('');
};

// Các mẫu câu trả lời cho các tình huống khác nhau
const RESPONSE_TEMPLATES = {
  NO_PRODUCTS: [
    "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn không?",
    "Hiện tại chúng tôi chưa có sản phẩm nào phù hợp với yêu cầu của bạn. Bạn có muốn xem các sản phẩm tương tự không?",
    "Rất tiếc, tôi không tìm thấy sản phẩm như bạn mong muốn. Bạn có thể thử tìm với tiêu chí khác không?"
  ],
  PRICE_INFO: [
    "Đây là thông tin giá của các sản phẩm phù hợp:",
    "Tôi đã tìm thấy một số sản phẩm với mức giá phù hợp:",
    "Dưới đây là các sản phẩm trong tầm giá bạn quan tâm:"
  ],
  DISCOUNT_INFO: [
    "Các sản phẩm đang có chương trình giảm giá:",
    "Tôi đã tìm được những sản phẩm đang khuyến mãi:",
    "Đây là danh sách các sản phẩm đang được giảm giá:"
  ],
  RATING_INFO: [
    "Các sản phẩm có đánh giá tốt từ khách hàng:",
    "Những sản phẩm được đánh giá cao nhất:",
    "Dưới đây là các sản phẩm được nhiều khách hàng yêu thích:"
  ],
  GREETING: [
    "Xin chào! Tôi có thể giúp bạn tìm kiếm sản phẩm thời trang. Bạn đang quan tâm đến sản phẩm nào?",
    "Chào bạn! Tôi là trợ lý mua sắm ảo. Bạn muốn tìm kiếm sản phẩm gì?",
    "Xin chào! Tôi có thể giúp bạn tìm kiếm quần áo, giày dép và phụ kiện. Bạn cần tôi tư vấn gì không?"
  ],
  SUGGESTION: [
    "Bạn có thể thử tìm kiếm với các từ khóa như: 'áo sơ mi trắng size L', 'quần jean dưới 500k', 'váy đầm đỏ giảm giá'...",
    "Bạn có thể mô tả chi tiết hơn về sản phẩm bạn cần, ví dụ: màu sắc, kích thước, giá cả, thương hiệu...",
    "Hãy cho tôi biết thêm về sở thích của bạn để tôi có thể gợi ý sản phẩm phù hợp hơn."
  ],
  FOLLOW_UP: [
    "Bạn có muốn xem thêm sản phẩm tương tự không?",
    "Tôi có thể giúp bạn tìm kiếm thêm sản phẩm khác không?",
    "Bạn có cần tôi lọc kết quả theo tiêu chí nào khác không?"
  ]
};

// Helper function để chọn ngẫu nhiên một mẫu câu
const getRandomResponse = (type: keyof typeof RESPONSE_TEMPLATES): string => {
  const templates = RESPONSE_TEMPLATES[type];
  return templates[Math.floor(Math.random() * templates.length)];
};

export const generateProductResponse = (
  message: string, 
  products: Product[], 
  context: ConversationContext
): string => {
  // Kiểm tra xem có phải là lời chào không
  if (/^(xin chào|chào|hi|hello|hey|hola)/i.test(message.toLowerCase())) {
    return getRandomResponse('GREETING') + "\n\n" + getRandomResponse('SUGGESTION');
  }

  const query = parseProductQuery(message);
  
  // Áp dụng các tùy chọn từ ngữ cảnh cuộc trò chuyện
  if (context.userPreferences.priceRange) {
    query.minPrice = query.minPrice || context.userPreferences.priceRange.min;
    query.maxPrice = query.maxPrice || context.userPreferences.priceRange.max;
  }
  
  if (context.userPreferences.preferredRating) {
    query.minRating = query.minRating || context.userPreferences.preferredRating;
  }

  if (context.userPreferences.preferredDiscount) {
    query.minDiscount = query.minDiscount || context.userPreferences.preferredDiscount;
  }

  // Lưu truy vấn vào lịch sử
  if (context.previousQueries) {
    context.previousQueries.push(query);
  }

  const matchedProducts = findMatchingProducts(query, products);

  if (matchedProducts.length === 0) {
    return getRandomResponse('NO_PRODUCTS') + "\n\n" + getRandomResponse('SUGGESTION');
  }

  let response = '';
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('giảm giá') || messageLower.includes('khuyến mãi') || messageLower.includes('sale')) {
    response = getRandomResponse('DISCOUNT_INFO');
  } else if (messageLower.includes('đánh giá') || messageLower.includes('review') || messageLower.includes('tốt nhất')) {
    response = getRandomResponse('RATING_INFO');
  } else if (messageLower.includes('giá') || messageLower.includes('tiền') || messageLower.includes('bao nhiêu')) {
    response = getRandomResponse('PRICE_INFO');
  } else {
    response = "Tôi đã tìm thấy một số sản phẩm phù hợp với yêu cầu của bạn:\n\n";
  }

  response += generateProductCards(matchedProducts);
  
  // Thêm gợi ý tiếp theo
  response += "\n\n" + getRandomResponse('FOLLOW_UP');

  return response;
};