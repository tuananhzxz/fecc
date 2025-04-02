import React from "react";
import { Route, Routes } from "react-router-dom";
import SellerTableAdmin from "../admin/pages/seller/SellerTableAdmin";
import CouponAdmin from "../admin/pages/coupon/CouponAdmin";
import AddNewCoupon from "../admin/pages/coupon/AddNewCoupon";
import GridTable from "../admin/pages/homepages/GridTable";
import CategoryOneAdmin from "../admin/pages/homepages/CategoryOneAdmin";
import ShopByCategoryTable from "../admin/pages/homepages/ShopByCategoryTable";
import DealAdmin from "../admin/pages/homepages/DealAdmin";
import HomeCategory from "../admin/pages/homepages/HomeCategory";
import { HomeCategorySection } from "../types/HomeCategoryType";
import StatisticsRouter from "../admin/pages/statistics/routes";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SellerTableAdmin />} />
      <Route path="/coupon" element={<CouponAdmin />} />
      <Route
        path="/category2"
        element={<HomeCategory section={HomeCategorySection.DEALS} />}
      />
      <Route path="/add/coupon" element={<AddNewCoupon />} />
      <Route path="/home/grid" element={<GridTable />} />
      <Route path="/category1" element={<CategoryOneAdmin />} />
      <Route path="/shopbycategory" element={<ShopByCategoryTable />} />
      <Route path="/deals" element={<DealAdmin />} />
      <Route path="/statistics/*" element={<StatisticsRouter />} />
    </Routes>
  );
};

export default AdminRoutes;
