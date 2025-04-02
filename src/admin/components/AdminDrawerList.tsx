import React from "react";
import DrawerList from "../../component/DrawerList";

import {
  Dashboard,
  Receipt,
  AccountBox,
  Logout,
  Category,
  LocalOffer,
  GridView,
  Store,
  BarChart,
} from "@mui/icons-material";
import { HomeIcon } from "lucide-react";

const menu = [
  {
    name: "Tổng quan",
    path: "/admin",
    icon: Dashboard,
    activeIcon: Dashboard,
  },
  {
    name: "Danh mục chính",
    path: "/admin/category2",
    icon: HomeIcon,
    activeIcon: HomeIcon,
  },
  {
    name: "Danh mục",
    path: "/admin/category1",
    icon: Category,
    activeIcon: Category,
  },
  {
    name: "Danh mục shop",
    path: "/admin/shopbycategory",
    icon: Store,
    activeIcon: Store,
  },
  {
    name: "Bảng Grid",
    path: "/admin/home/grid",
    icon: GridView,
    activeIcon: GridView,
  },
  {
    name: "Mã giảm giá",
    path: "/admin/coupon",
    icon: LocalOffer,
    activeIcon: LocalOffer,
    subMenu: [
      {
        name: "Danh sách mã",
        path: "/admin/coupon",
      },
      {
        name: "Thêm mã mới",
        path: "/admin/add/coupon",
      },
    ],
  },
  {
    name: "Ưu đãi",
    path: "/admin/deals",
    icon: Receipt,
    activeIcon: Receipt,
  },
  {
    name: "Thống kê",
    path: "/admin/statistics",
    icon: BarChart,
    activeIcon: BarChart,
    subMenu: [
      {
        name: "Thống kê tổng quan",
        path: "/admin/statistics/overview",
      },
      {
        name: "Thống kê theo tháng",
        path: "/admin/statistics/monthly",
      },
      {
        name: "Thống kê theo ngày",
        path: "/admin/statistics/daily",
      },
      {
        name: "Thống kê theo sản phẩm",
        path: "/admin/statistics/product",
      },
      {
        name: "Thống kê theo khách hàng",
        path: "/admin/statistics/customer",
      },
    ],
  },
];

const menu2 = [
  {
    name: "Tài khoản",
    path: "/admin/account",
    icon: AccountBox,
    activeIcon: AccountBox,
  },
  {
    name: "Đăng xuất",
    path: "/logout",
    icon: Logout,
    activeIcon: Logout,
  },
];

interface AdminDrawerListProps {
  toggleDrawer: () => void;
}

const AdminDrawerList = ({ toggleDrawer }: AdminDrawerListProps) => {
  return (
    <div>
      <DrawerList menu={menu} menu2={menu2} toggleDrawer={toggleDrawer} />
    </div>
  );
};

export default AdminDrawerList;
