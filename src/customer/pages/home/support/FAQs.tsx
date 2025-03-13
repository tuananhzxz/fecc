import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment } from '@mui/material'
import { ExpandMore, Search, ShoppingCart, LocalShipping, Payment, Assignment, Loop, Security } from '@mui/icons-material'

const FAQs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tất cả', icon: <Assignment /> },
    { id: 'order', label: 'Đặt hàng', icon: <ShoppingCart /> },
    { id: 'shipping', label: 'Vận chuyển', icon: <LocalShipping /> },
    { id: 'payment', label: 'Thanh toán', icon: <Payment /> },
    { id: 'return', label: 'Đổi trả', icon: <Loop /> },
    { id: 'security', label: 'Bảo mật', icon: <Security /> },
  ];

  const faqData = [
    {
      category: 'order',
      questions: [
        { q: "Làm thế nào để đặt hàng?", a: "Chọn sản phẩm > Thêm vào giỏ hàng > Thanh toán > Xác nhận đơn hàng" },
        { q: "Tôi có thể hủy đơn hàng không?", a: "Có thể hủy đơn hàng trong vòng 24h sau khi đặt hàng" }
      ]
    },
    {
      category: 'shipping',
      questions: [
        { q: "Thời gian giao hàng?", a: "2-3 ngày trong nội thành, 3-5 ngày cho các tỉnh thành khác" },
        { q: "Phí vận chuyển?", a: "Miễn phí cho đơn hàng trên 500,000đ" }
      ]
    },
    {
      category: 'payment',
      questions: [
        { q: "Các hình thức thanh toán?", a: "COD, Thẻ tín dụng, Chuyển khoản ngân hàng, Ví điện tử" },
        { q: "Thanh toán online có an toàn không?", a: "Hệ thống thanh toán được mã hóa và bảo mật theo tiêu chuẩn quốc tế" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-12"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Câu Hỏi Thường Gặp
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc của bạn
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="bg-white rounded-lg"
          />
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full ${
                activeCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-indigo-50'
              } transition-all duration-300`}
            >
              {category.icon}
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <motion.div 
          layout
          className="max-w-3xl mx-auto"
        >
          <AnimatePresence>
            {faqData
              .filter(category => 
                activeCategory === 'all' || category.category === activeCategory
              )
              .map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {category.questions
                    .filter(q => 
                      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.a.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((faq, faqIndex) => (
                      <Accordion
                        key={faqIndex}
                        className="mb-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          className="hover:bg-indigo-50"
                        >
                          <h3 className="font-semibold text-gray-800">{faq.q}</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                          <p className="text-gray-600">{faq.a}</p>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FAQs
