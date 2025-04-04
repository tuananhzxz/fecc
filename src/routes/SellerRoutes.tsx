import React from 'react'
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import Products from '../seller/pages/products/Products'
import AddProduct from '../seller/pages/products/AddProduct'
import Orders from '../seller/pages/order/Orders'
import Transaction from '../seller/pages/payment/Transaction'
import Profile from '../seller/pages/account/Profile'
import DashBoard from '../seller/pages/sellerhome/DashBoard'
import Payment from '../seller/pages/payment/Payment'
import Messages from '../seller/pages/messages/Messages'

const SellerRoutes = () => {
  const isAdminLoggedIn = () => {
    // Kiểm tra token hoặc thông tin đăng nhập của admin từ localStorage hoặc state
    const adminToken = localStorage.getItem('sellerToken');
    return !!adminToken;
  };

  // Component bảo vệ route
  const ProtectedRoute = () => {
    if (!isAdminLoggedIn()) {
      return <Navigate to="/404" replace />;
    }
    return <Outlet />;
  };

  return (
    <div>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashBoard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProduct />} />
          {/* <Route path="/seller/products/edit/:id" element={<EditProduct />} /> */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/transaction" element={<Transaction />} />
            <Route path='/messages' element={<Messages/>} />
            <Route path='/account' element={<Profile/>} />
        </Route>
      </Routes>
    </div>
  )
}

export default SellerRoutes