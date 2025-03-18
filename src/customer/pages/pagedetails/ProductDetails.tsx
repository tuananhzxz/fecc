import { useEffect, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, CircularProgress, Divider, Modal, Rating } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SimilarProduct from "./SimilarProduct";
import ReviewCard from "../review/ReviewCard";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { getProductById } from '../../../state/customer/ProductCustomerSlice';
import { ShareIcon } from 'lucide-react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CachedIcon from '@mui/icons-material/Cached';
import SecurityIcon from '@mui/icons-material/Security';
import { createReview, fetchReviewsByProductId, updateReview } from '../../../state/review/ReviewSlice';
import { Review } from '../../../types/ReviewType';
import { addItemToCart } from '../../../state/customer/CartSlice';
import { toast } from 'react-toastify';
import { addToWishlist } from '../../../state/wishlist/WishListSlice';
import { fetchSellerByProductId } from '../../../state/seller/SellerSlice';

const ProductDetails = () => {
  const { productId } = useParams<{ 
    categoryId: string;
    title: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct: product, loading } = useAppSelector(state => state.product);
  const { reviews } = useAppSelector(state => state.reviewSlice);
  const { profile } = useAppSelector(state => state.seller);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

  useEffect(() => {
    if (productId) {
      dispatch(fetchSellerByProductId(Number(productId)));
      dispatch(getProductById(Number(productId)));
      dispatch(fetchReviewsByProductId(Number(productId)));
    }
  }, [dispatch, productId]);

  // Set default selections when product data is loaded
  useEffect(() => {
    if (product) {
      const colors = product.color.split(',').map(c => c.trim());
      const sizes = product.sizes.split(',').map(s => s.trim());
      
      if (colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }
      
      if (sizes.length > 0 && !selectedSize) {
        setSelectedSize(sizes[0]);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({
        productId: product?.id || 0,
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
      setQuantity(quantity);

    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleBuynow = async () => {
    try {
      handleAddToCart();
      navigate('/cart');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  }

  const handleAddToWishlist = async () => {
    try {
      await dispatch(addToWishlist(product?.id || 0)).unwrap();
      toast.success('Đã thêm vào danh sách yêu thích!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Không thể thêm vào danh sách yêu thích!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };
  

  const handleCreateReview = () => {
    if (productId) {
      if (editingReview) {
        dispatch(updateReview({
          reviewId: editingReview.id,
          reviewData: {
            reviewText,
            reviewRating,
            productImages: []
          }
        })).then(() => {
          resetReviewModal();
        });
      } else {
        // Create new review
        dispatch(createReview({
          productId: Number(productId),
          reviewData: {
            reviewText,
            reviewRating,
            productImages: []
          }
        })).then(() => {
          resetReviewModal();
        });
      }
    }
  };

  const resetReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewText('');
    setReviewRating(5);
    setEditingReview(null);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewText(review.reviewText);
    setReviewRating(review.rating);
    setIsReviewModalOpen(true);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const ReviewModal = () => (
    <Modal 
      open={isReviewModalOpen} 
      onClose={resetReviewModal}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <h2 className="text-xl font-bold mb-4">
          {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h2>
        <div className="flex justify-center mb-4">
          {[1,2,3,4,5].map((star) => (
            <StarIcon
              key={star}
              className={`cursor-pointer ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'}`}
              onClick={() => setReviewRating(star)}
            />
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá
          </label>
          <div className="w-full border rounded-md overflow-hidden">
          <textarea
            className="w-full p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
            placeholder="Nhập đánh giá của bạn"
            value={reviewText}
            onChange={(e) => {
              e.preventDefault();
              setReviewText(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.currentTarget.focus();
            }}
          />
          </div>
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={handleCreateReview}
          disabled={!reviewText.trim()}
        >
          {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </Button>
      </Box>
    </Modal>
  );

  const discountPercent = Math.round(
    ((product.mrpPrice - product.sellingPrice) / product.mrpPrice) * 100
  );

  const colorsArray = product.color.split(',').map(c => c.trim());
  const sizesArray = product.sizes.split(',').map(s => s.trim());

  // Check if selections are valid
  const isValidSelection = selectedColor && selectedSize;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section với breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-red-500">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to={`/products/${product.category?.categoryId}`} className="hover:text-red-500">
              {product.category?.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section - Left Side */}
            <div className="p-8 border-r border-gray-100">
              <div className="sticky top-8">
                {/* Main Image with Zoom Effect */}
                <div className="relative group">
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={product.images[selectedImg]}
                      alt={product.title}
                      className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors" onClick={handleAddToWishlist}>
                      <FavoriteIcon className="text-red-500 w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                      <ShareIcon className="text-blue-500 w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="mt-8">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        className={`
                          flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                          ${selectedImg === index ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-200'}
                          hover:ring-2 hover:ring-red-400 transition-all
                        `}
                        onClick={() => setSelectedImg(index)}
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div className="p-8 space-y-6">
              {/* Title & Price Section */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-red-600">
                      {product.sellingPrice.toLocaleString()}đ
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.mrpPrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      -{discountPercent}% Giảm
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2 mt-2'>
                  <span className="text-sm text-gray-500">
                    Được bán bởi
                  </span>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg w-fit">
                    <img src={profile?.businessDetails?.banner || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png'} alt="Banner" className="w-10 h-10 rounded-full" />
                    <span className="text-sm text-gray-500">
                      {profile?.sellerName}
                    </span>
                    </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <Link 
                      to={`/seller/profile-shop/${profile?.id}`} 
                      className='flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 bg-blue-50 rounded-full font-medium'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Xem cửa hàng
                    </Link>
                  </div>
                </div>
              </div>

              {/* Rating & Stock */}
              <div className="flex items-center justify-between py-4 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <Rating value={averageRating} readOnly precision={0.5} />
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews.length || 0} đánh giá)
                  </span>
                </div>
                <div className="text-sm font-medium">
                  <span className="text-green-500">✓</span> Còn {product.quantity} sản phẩm
                </div>
              </div>

              {/* Selected Options Summary */}
              {(selectedColor || selectedSize) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Đã chọn:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor && (
                      <span className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                        Màu: {selectedColor}
                      </span>
                    )}
                    {selectedSize && (
                      <span className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                        Size: {selectedSize}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Variants Selection */}
              <div className="space-y-6">
                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Màu sắc
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorsArray.map((color, index) => (
                      <button
                        key={index}
                        className={`
                          px-4 py-2 rounded-full text-sm
                          ${selectedColor === color 
                            ? 'bg-red-500 text-white border-2 border-red-500' 
                            : 'bg-white border-2 border-gray-200 hover:border-red-300'}
                          focus:outline-none transition-colors
                        `}
                        onClick={() => handleColorSelect(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kích thước
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {sizesArray.map((size, index) => (
                      <button
                        key={index}
                        className={`
                          w-12 h-12 rounded-lg flex items-center justify-center
                          ${selectedSize === size 
                            ? 'bg-red-500 text-white border-2 border-red-500' 
                            : 'bg-white border-2 border-gray-200 hover:border-red-300'}
                          focus:outline-none transition-colors text-sm font-medium
                        `}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        className="p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <RemoveIcon className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        className="p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                        disabled={quantity >= product.quantity}
                      >
                        <AddIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                <button 
                  className={`
                    w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-colors
                    ${isValidSelection 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                  `}
                  disabled={!isValidSelection}
                  title={!isValidSelection ? "Vui lòng chọn màu sắc và kích thước" : ""}
                  onClick={handleAddToCart}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button 
                  className={`
                    w-full py-4 rounded-xl transition-colors
                    ${isValidSelection 
                      ? 'border-2 border-red-600 text-red-600 hover:bg-red-50' 
                      : 'border-2 border-gray-300 text-gray-400 cursor-not-allowed'}
                  `}
                  disabled={!isValidSelection}
                  title={!isValidSelection ? "Vui lòng chọn màu sắc và kích thước" : ""}
                  onClick={handleBuynow}
                >
                  Mua ngay
                </button>
              </div>

              {/* Selection Error Message */}
              {!isValidSelection && (
                <div className="text-sm text-red-500 text-center">
                  Vui lòng chọn cả màu sắc và kích thước trước khi đặt hàng
                </div>
              )}

              {/* Product Features */}
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: LocalShippingIcon, text: "Giao hàng miễn phí" },
                    { icon: VerifiedUserIcon, text: "Bảo hành chính hãng" },
                    { icon: CachedIcon, text: "30 ngày đổi trả" },
                    { icon: SecurityIcon, text: "Thanh toán an toàn" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <feature.icon className="text-red-500 w-5 h-5" />
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Reviews section */}
      <div className={`pt-20`}>
        <ReviewCard 
          reviews={reviews} 
          onWriteReview={() => setIsReviewModalOpen(true)}
          onEditReview={handleEditReview}
        />
      </div>

      {/* Review Modal */}
      <ReviewModal />

      <div className={`mt-5 py-20`}>
      <h1 className={`text-lg font-bold mb-5`}>
        Sản phẩm tương tự
      </h1>
      <div className={`pt-5`}>
        {product.category?.id ? (
          <SimilarProduct
            categoryId={product.category.id}
            currentProductId={product.id}
          />
        ) : (
        <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="bg-gray-100 w-full h-48 rounded"/>
              <div className="mt-4 h-4 bg-gray-100 rounded"/>
              <div className="mt-2 h-4 bg-gray-100 rounded w-3/4"/>
              <div className="mt-4 h-10 bg-gray-100 rounded"/>
              </div>
        ))}
            </div>
          )}
        </div>
      </div>
      <Divider/>
    </div>
    </div>
  );
}

export default ProductDetails;