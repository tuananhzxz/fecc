import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TextField, Button, MenuItem } from '@mui/material'
import { QuestionAnswer, Assignment, CheckCircle } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Advise = () => {
  const [category, setCategory] = useState('');
  const navigate = useNavigate();
  const requestEl = useRef<HTMLDivElement | null>(null);

  const onButtonClick = () => {
    if (requestEl.current) {
      requestEl.current.scrollIntoView({ behavior: 'smooth' });
    }
  };   
  
  const categories = [
    { value: 'product', label: 'Sản phẩm' },
    { value: 'order', label: 'Đơn hàng' },
    { value: 'shipping', label: 'Vận chuyển' },
    { value: 'payment', label: 'Thanh toán' }
  ];

  const commonQuestions = [
    { q: "Làm thế nào để theo dõi đơn hàng?", a: "Bạn có thể theo dõi đơn hàng trong mục 'Đơn hàng của tôi'" },
    { q: "Chính sách đổi trả như thế nào?", a: "Chúng tôi chấp nhận đổi trả trong vòng 7 ngày" },
    { q: "Thời gian giao hàng mất bao lâu?", a: "Thông thường từ 2-3 ngày làm việc" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">
          Tư Vấn & Hỗ Trợ
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy cho chúng tôi biết bạn cần giúp đỡ gì?
        </p>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <QuestionAnswer className="text-blue-500 mb-4" sx={{ fontSize: 48 }} />
            <h3 className="text-xl font-bold mb-3">Câu Hỏi Thường Gặp</h3>
            <p className="text-gray-600 mb-4">Tìm câu trả lời nhanh cho các câu hỏi phổ biến</p>
            <Button onClick={() => navigate("/faqs")} variant="outlined" color="primary">Xem FAQ</Button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <Assignment className="text-blue-500 mb-4" sx={{ fontSize: 48 }} />
            <h3 className="text-xl font-bold mb-3">Gửi Yêu Cầu</h3>
            <p className="text-gray-600 mb-4">Gửi yêu cầu hỗ trợ chi tiết cho chúng tôi</p>
            <Button onClick={onButtonClick} variant="outlined" color="primary">Tạo yêu cầu</Button>
          </motion.div>
        </div>

        {/* Support Form */}
        <div ref={requestEl} className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Gửi Yêu Cầu Tư Vấn</h2>
            <form className="space-y-4">
              <TextField
                select
                fullWidth
                label="Chọn danh mục"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Tiêu đề"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Nội dung"
                multiline
                rows={4}
                variant="outlined"
              />
              <Button 
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700 w-full py-3"
                startIcon={<CheckCircle />}
                onClick={() => {
                  toast.success('Yêu cầu đã được gửi!')
                }}
              >
                Gửi Yêu Cầu
              </Button>
            </form>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Câu Hỏi Thường Gặp</h2>
            <div className="space-y-4">
              {commonQuestions.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-blue-600 mb-2">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Advise
