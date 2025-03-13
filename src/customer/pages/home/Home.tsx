import React, { useEffect, useState } from 'react';
import OneCategory from './categoryOne/OneCategory';
import CategoryGrid from './categoryGrid/CategoryGrid';
import Deal from './deal/Deal';
import ShopByCategory from './shopbycategory/ShopByCategory';
import { Button } from '@mui/material';
import { ShoppingBag, Store, ArrowForward, TrendingUp, Security, Support } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { getHomeCategories } from '../../../state/admin/HomeCategorySlice';
import SmartChatBot from './chatbot/SmartBot';
import { getProducts } from '../../../state/customer/ProductCustomerSlice';

const Home = () => {
  const navigate = useNavigate();
  const dispath = useAppDispatch();
  const products = useAppSelector((state) => state.product.products);

  const { homeCategorySlice } = useAppSelector((state) => state);

  useEffect(() => {
    dispath(getHomeCategories());
    dispath(getProducts());
  }, [dispath]);
  const features = [
    {
      icon: <Store className="text-blue-400" sx={{ fontSize: 32 }}/>,
      title: "Cửa hàng online",
      description: "Quản lý cửa hàng dễ dàng"
    },
    {
      icon: <TrendingUp className="text-green-400" sx={{ fontSize: 32 }}/>,
      title: "Tăng trưởng",
      description: "Tiếp cận hàng triệu khách hàng"
    },
    {
      icon: <Security className="text-purple-400" sx={{ fontSize: 32 }}/>,
      title: "An toàn & Bảo mật",
      description: "Giao dịch luôn được bảo vệ"
    },
    {
      icon: <Support className="text-orange-400" sx={{ fontSize: 32 }}/>,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ hỗ trợ chuyên nghiệp"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="py-6 lg:py-8">
          <OneCategory item={homeCategorySlice.categories} />
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="py-12 lg:py-16"
        >
          <CategoryGrid item={homeCategorySlice.categories}/>
        </motion.div>

        <div className="py-16 lg:py-20 bg-gradient-to-r from-blue-50 to-purple-50">
          <Deal />
        </div>

        <div className="py-12 lg:py-16 bg-white">
          <ShopByCategory item={homeCategorySlice.categories}/>
        </div>

        <section className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 z-0">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}/>
            </div>
          </div>

          <div className="relative z-2 container mx-auto px-4 py-20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:w-1/2 text-left"
              >
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <ShoppingBag className="text-blue-400" sx={{ fontSize: 24 }} />
                  <span className="text-xl font-bold text-white">ShopTanh</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Bắt đầu kinh doanh<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    cùng ShopTanh
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-xl">
                  Tham gia cùng hàng nghìn người bán thành công trên ShopTanh. Chúng tôi cung cấp công cụ và hỗ trợ để phát triển doanh nghiệp của bạn.
                </p>

                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => navigate(`/become/seller`)}
                    size="large" 
                    variant="contained"
                    className="bg-white text-blue-900 hover:bg-red-500 transition-all duration-300 px-8 py-3 rounded-full text-lg shadow-lg"
                    endIcon={<ArrowForward />}
                  >
                    <span className="font-medium">Đăng ký ngay</span>
                  </Button>

                  <Button
                    onClick={() => navigate(`/about-us`)}
                    size="large" 
                    variant="outlined"
                    className="border-white text-white hover:bg-white/10 transition-all duration-300 px-8 py-3 rounded-full text-lg"
                  >
                    <span className="font-medium">Tìm hiểu thêm</span>
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      </motion.div>
      <SmartChatBot products={products} />
    </div>
  );
};

export default Home;