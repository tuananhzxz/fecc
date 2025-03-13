import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { QuestionAnswer, ContactSupport, Gavel, Info } from '@mui/icons-material'

const Support = () => {
  const supportOptions = [
    {
      icon: <QuestionAnswer sx={{ fontSize: 56 }} />,
      title: "Câu Hỏi Thường Gặp",
      description: "Tìm câu trả lời nhanh cho các thắc mắc phổ biến",
      link: "/faqs",
      color: "bg-blue-500"
    },
    {
      icon: <ContactSupport sx={{ fontSize: 56 }} />,
      title: "Tư Vấn & Hỗ Trợ",
      description: "Được tư vấn trực tiếp bởi đội ngũ chuyên nghiệp",
      link: "/advise",
      color: "bg-purple-500"
    },
    {
      icon: <Gavel sx={{ fontSize: 56 }} />,
      title: "Chính Sách Bảo Hành",
      description: "Thông tin về quyền lợi và chính sách bảo hành",
      link: "/guarantee",
      color: "bg-green-500"
    },
    {
      icon: <Info sx={{ fontSize: 56 }} />,
      title: "Về Chúng Tôi",
      description: "Tìm hiểu thêm về ShopTanh",
      link: "/about-us",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-16 text-center"
      >
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Chúng Tôi Luôn Sẵn Sàng Hỗ Trợ Bạn
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
          Khám phá các kênh hỗ trợ đa dạng của chúng tôi để được giải đáp mọi thắc mắc
        </p>

        {/* Support Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Link to={option.link}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all h-full">
                  <div className={`w-20 h-20 ${option.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white`}>
                    {option.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{option.title}</h3>
                  <p className="text-gray-600">{option.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8">Liên Hệ Nhanh</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-bold mb-2">Hotline</h3>
              <p className="text-blue-600 font-semibold">0123.456.789</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-blue-600 font-semibold">contact@company.com</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Giờ làm việc</h3>
              <p className="text-blue-600 font-semibold">24/7</p>
            </div>
          </div>
        </motion.div>
{/* 
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <QuestionAnswer />
          Chat với chúng tôi
        </motion.button> */}
      </motion.div>
    </div>
  )
}

export default Support
