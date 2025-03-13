import React from 'react'
import { motion } from 'framer-motion'
import { Shield, LocalShipping, Cached, VerifiedUser, Timer, ThumbUp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Guarantee = () => {
  const navigate = useNavigate();
  const guaranteeFeatures = [
    {
      icon: <Shield sx={{ fontSize: 48 }} />,
      title: "Bảo Hành Chính Hãng",
      description: "100% sản phẩm được bảo hành chính hãng với thời gian từ 12-24 tháng"
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48 }} />,
      title: "Miễn Phí Vận Chuyển",
      description: "Giao hàng miễn phí toàn quốc cho đơn hàng từ 500,000đ"
    },
    {
      icon: <Cached sx={{ fontSize: 48 }} />,
      title: "Đổi Trả Dễ Dàng",
      description: "Đổi trả sản phẩm trong vòng 30 ngày nếu không hài lòng"
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 48 }} />,
      title: "Cam Kết Chất Lượng",
      description: "Kiểm tra kỹ lưỡng và đảm bảo chất lượng trước khi giao hàng"
    },
    {
      icon: <Timer sx={{ fontSize: 48 }} />,
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ mọi lúc"
    },
    {
      icon: <ThumbUp sx={{ fontSize: 48 }} />,
      title: "Thanh Toán An Toàn",
      description: "Đa dạng phương thức thanh toán, bảo mật thông tin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-16"
      >
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-6">
          Chính Sách Bảo Hành
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-16">
          Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với các chính sách bảo hành ưu việt
        </p>

        {/* Guarantee Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {guaranteeFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-green-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Quy Trình Bảo Hành</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Đăng ký yêu cầu bảo hành",
              "Kiểm tra và xác nhận thông tin",
              "Thực hiện bảo hành",
              "Bàn giao sản phẩm"
            ].map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">{index + 1}</span>
                </div>
                <p className="font-semibold">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-green-600 text-white rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Cần hỗ trợ thêm?</h2>
          <p className="mb-8">Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          <button onClick={() => {navigate("/contact")}} className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition-colors">
            Liên hệ ngay
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Guarantee
