import React, { useEffect, useState } from 'react';
import "./ProductCard.css";
import { Button, Rating } from '@mui/material';
import { 
  FavoriteBorderOutlined, 
  ModeCommentOutlined, 
  ShoppingCart, 
  Close 
} from '@mui/icons-material';
import { Product } from '../../../state/customer/ProductCustomerSlice';
import { useNavigate } from 'react-router-dom';
import { addItemToCart } from '../../../state/customer/CartSlice';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { toast } from 'react-toastify';
import { addToWishlist } from '../../../state/wishlist/WishListSlice';
import { fetchReviewsByProductId } from '../../../state/review/ReviewSlice';
import { Review } from '../../../types/ReviewType';

interface ProductCardProps {  
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.cart);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');


  useEffect(() => {
    let interval: any;
    if (isHovered) {
      interval = setInterval(() => {
        setCurrentImage((prevIndex) => (prevIndex + 1) % product.images.length);
      }, 1000);
    } else {
      clearInterval(interval);
      interval = null;
    }
    return () => clearInterval(interval);
  }, [isHovered, product.images.length]);

  const getReviews = async () => {
    const result = await dispatch(fetchReviewsByProductId(Number(product.id)));
    return result.payload;
  }

  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const calculateRating = async () => {
      const reviews = await getReviews();
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length;
        setAverageRating(avg);
      }
    };
    calculateRating();
  }, [product.id]);

  const handleAddtoWishlist = async () => {
    try {
      await dispatch(addToWishlist(product.id)).unwrap();
  
      toast.success('Đã thêm vào yêu thích!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Không thể thêm vào yêu thích!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({
        productId: product.id,
        size: selectedSize,
        quantity: quantity
      })).unwrap();

      toast.success('Đã thêm vào giỏ hàng!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setSelectedSize('');
      setQuantity(1);
      setShowSizeSelector(false);

    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const discountPercent = Math.round(
    ((product.mrpPrice - product.sellingPrice) / product.mrpPrice) * 100
  );

  return (
    <>
      <div className="group w-[250px]">
        <div className="card relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {product.images.map((item, index) => (
            <img
              onClick={() => navigate(`/product-details/${product.category?.categoryId}/${product.title}/${product.id}`)}
              key={index}
              style={{
                transform: `translateX(${(index - currentImage) * 100}%)`
              }}
              className="card-media object-cover h-[300px] w-full"
              src={item}
              alt={product.title}
            />
          ))}

          {discountPercent > 0 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold transform rotate-[-3deg] shadow-md">
              -{discountPercent}%
            </div>
          )}

          {product.numRatings > 100 && (
            <div className="absolute top-4 right-4 bg-[#3f51b5] text-white px-3 py-1 rounded-lg text-sm font-bold transform rotate-[3deg] shadow-md">
              HOT
            </div>
          )}

          {isHovered && (
            <div className="indicator flex flex-col items-center space-y-2">
              <div className="flex gap-3 animate-fadeIn">
                <Button 
                  variant="contained" 
                  sx={{
                    backgroundColor: '#3f51b5',
                    '&:hover': {
                      backgroundColor: 'red',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <FavoriteBorderOutlined onClick={handleAddtoWishlist} />
                </Button>
                <Button 
                  variant="contained"
                  sx={{
                    backgroundColor: '#3f51b5',
                    '&:hover': {
                      backgroundColor: 'red',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <ModeCommentOutlined />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="details w-full pt-3 space-y-2 group-hover-effect rounded-md bg-white p-4">
          <div className="flex items-center gap-1">
            <Rating value={averageRating} readOnly precision={0.5} />
            <span className="text-sm text-gray-500 ml-1">
              {product.reviews.length || 0} đánh giá
            </span>
          </div>

          <div className="name">
            <h1 className="text-lg font-semibold text-gray-800 hover:text-[#3f51b5] transition-colors">
              {product.title}
            </h1>
            <p className="text-gray-600 line-clamp-2">{product.description}</p>
          </div>

          <div className="price flex items-center gap-3">
            <span className="font-sans text-xl font-bold text-red-600">
              {product.sellingPrice.toLocaleString()}đ
            </span>
            {discountPercent > 0 && (
              <>
                <span className="line-through text-gray-400">
                  {product.mrpPrice.toLocaleString()}đ
                </span>
                <span className="text-[#3f51b5] font-semibold">
                  {discountPercent}%
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowSizeSelector(true)}
            disabled={loading || product.quantity === 0}
            className="w-full mt-2 py-2 bg-[#3f51b5] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors group disabled:bg-gray-300"
          >
            <ShoppingCart className="group-hover:animate-bounce" />
            <span>
              {loading ? 'Đang thêm...' : 
               product.quantity === 0 ? 'Hết hàng' : 
               'Thêm vào giỏ'}
            </span>
          </button>
        </div>
      </div>

      {/* Size Selector Modal */}
      {showSizeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chọn kích thước</h3>
              <button onClick={() => setShowSizeSelector(false)}>
                <Close />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {product.sizes.split(',').map((size) => (
                <button
                  key={size}
                  className={`
                    p-2 border rounded-md text-sm transition-all
                    ${selectedSize === size.trim() 
                      ? 'border-red-500 text-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedSize(size.trim())}
                >
                  {size.trim()}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Số lượng:</span>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 border rounded-md hover:bg-gray-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  className="p-1 border rounded-md hover:bg-gray-50"
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowSizeSelector(false)}
              >
                Hủy
              </button>
              <button
                className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
                onClick={handleAddToCart}
                disabled={!selectedSize || loading}
              >
                {loading ? 'Đang thêm...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;