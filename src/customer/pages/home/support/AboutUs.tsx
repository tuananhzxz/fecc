import React from 'react'
import { motion } from 'framer-motion'

const AboutUs = () => {

    const teamMembers = [
        {
          name: "Nguyễn Minh Anh",
          position: "CEO & Founder",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60"
        },
        {
          name: "Trần Đức Hải",
          position: "Creative Director",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60"
        },
        {
          name: "Lê Thu Hương",
          position: "Head of Design",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60"
        },
        {
          name: "Phạm Văn Minh",
          position: "Marketing Manager",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60"
        }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-16"
      >
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
          Chào mừng đến với <span className="text-purple-600">Shop Tanh</span>
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          Nơi phong cách gặp gỡ sự tiện lợi - Định hình phong cách thời trang của bạn
        </p>
      </motion.div>

      {/* Values Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Sứ mệnh</h3>
            <p className="text-gray-600">
              Mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý, giúp mọi người tự tin thể hiện phong cách riêng.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Tầm nhìn</h3>
            <p className="text-gray-600">
              Trở thành thương hiệu thời trang hàng đầu Việt Nam, định hình xu hướng và phong cách sống hiện đại.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Giá trị cốt lõi</h3>
            <p className="text-gray-600">
              Chất lượng - Sáng tạo - Trách nhiệm - Khách hàng là trọng tâm
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold mb-2">100K+</h4>
              <p>Khách hàng hài lòng</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">50+</h4>
              <p>Thương hiệu đối tác</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">1000+</h4>
              <p>Sản phẩm đa dạng</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">24/7</h4>
              <p>Hỗ trợ khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Đội ngũ của chúng tôi</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="text-center"
            >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
                <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                />
                </div>
                <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
                <p className="text-purple-600 font-medium">{member.position}</p>
            </motion.div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AboutUs
