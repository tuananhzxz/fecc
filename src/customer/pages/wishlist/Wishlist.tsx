// Wishlist.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader, Search } from 'lucide-react';
import WishlistCard from './WishlistCard';
import { useAppDispatch } from '../../../state/Store';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/Store';
import { fetchWishlist } from '../../../state/wishlist/WishListSlice';
import { useAuth } from '../../../customhook/useAuth';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { wishlist, loading, error } = useSelector((state: RootState) => state.wishlist);
  const [searchTerm, setSearchTerm] = useState('');

  const {isAuthenticated} = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const products = wishlist?.products || [];
  const filteredProducts = products.filter(product => 
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm yêu thích..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            {searchTerm ? (
              <>
                <h2 className="text-xl font-medium text-gray-600">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mt-2">Vui lòng thử tìm kiếm khác</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium text-gray-600">Sản phẩm yêu thích đang trống</h2>
                <p className="text-gray-500 mt-2">Hãy nhanh tay lưu sản phẩm vào yêu thích nhé!</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <WishlistCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;