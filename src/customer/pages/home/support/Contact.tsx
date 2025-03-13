import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TextField, Button, Snackbar, Alert } from '@mui/material'
import { LocationOn, Phone, Email, AccessTime } from '@mui/icons-material'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenSnackbar(true);
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
          Liên Hệ Với Chúng Tôi
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ ngay để được giải đáp mọi thắc mắc.
        </p>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <LocationOn className="text-purple-600 mb-3" sx={{ fontSize: 40 }} />
            <h3 className="font-semibold mb-2">Địa Chỉ</h3>
            <p className="text-gray-600">123 Đường ABC, HANOI ,HANOI</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <Phone className="text-purple-600 mb-3" sx={{ fontSize: 40 }} />
            <h3 className="font-semibold mb-2">Điện Thoại</h3>
            <p className="text-gray-600">0123.456.789</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <Email className="text-purple-600 mb-3" sx={{ fontSize: 40 }} />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600">contact@company.com</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <AccessTime className="text-purple-600 mb-3" sx={{ fontSize: 40 }} />
            <h3 className="font-semibold mb-2">Giờ Làm Việc</h3>
            <p className="text-gray-600">8:00 - 22:00, Thứ 2 - CN</p>
          </motion.div>
        </div>

        {/* Contact Form & Map */}
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Gửi Tin Nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Họ và tên"
                variant="outlined"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <TextField
                fullWidth
                label="Tiêu đề"
                variant="outlined"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
              <TextField
                fullWidth
                label="Nội dung"
                multiline
                rows={4}
                variant="outlined"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
              <Button 
                type="submit"
                variant="contained"
                className="bg-purple-600 hover:bg-purple-700 w-full py-3"
              >
                Gửi Tin Nhắn
              </Button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl overflow-hidden shadow-lg h-[500px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8168145559957!2d105.73938337602!3d21.040014487390444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135096b31fa7abb%3A0xff645782804911af!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgxJDDtG5nIMOB!5e0!3m2!1svi!2s!4v1741854632226!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Tin nhắn của bạn đã được gửi thành công!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Contact
