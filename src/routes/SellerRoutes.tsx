import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Products from '../seller/pages/products/Products'
import AddProduct from '../seller/pages/products/AddProduct'
import Orders from '../seller/pages/order/Orders'
import Transaction from '../seller/pages/payment/Transaction'
import Profile from '../seller/pages/account/Profile'
import DashBoard from '../seller/pages/sellerhome/DashBoard'
import Payment from '../seller/pages/payment/Payment'
import Messages from '../seller/pages/messages/Messages'

const SellerRoutes = () => {
  return (
    <div>
        <Routes>
            <Route path="/" element={<DashBoard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-product" element={<AddProduct />} />
            {/* <Route path="/seller/products/edit/:id" element={<EditProduct />} /> */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path='/account' element={<Profile/>} />
            <Route path='/messages' element={<Messages/>} />
        </Routes>
    </div>
  )
}

export default SellerRoutes