import React from 'react';
import { 
  Dashboard,
  Inventory,
  Add,
  AccountBalanceWallet,
  AccountBox,
  Chat
} from '@mui/icons-material';
import { 
  ShoppingBag,
  Receipt,
  LogOut
} from 'lucide-react';
import DrawerList from '../../../component/DrawerList';

const menu = [
  {
    name: "Tổng quan",
    path: "/seller",
    icon: Dashboard,
    activeIcon: Dashboard
  },
  {
    name: "Đơn hàng",
    path: "/seller/orders",
    icon: ShoppingBag,
    activeIcon: ShoppingBag
  },
  {
    name: "Tất cả sản phẩm",
    path: "/seller/products",
    icon: Inventory,
    activeIcon: Inventory
  },
  {
    name: "Thêm sản phẩm",
    path: "/seller/add-product",
    icon: Add,
    activeIcon: Add
  },
  {
    name: "Thanh toán",
    path: "/seller/payment",
    icon: AccountBalanceWallet,
    activeIcon: AccountBalanceWallet
  },
  {
    name: "Lịch sử giao dịch",
    path: "/seller/transaction",
    icon: Receipt,
    activeIcon: Receipt
  },
  {
    name: "Tin nhắn",
    path: "/seller/messages",
    icon: Chat,
    activeIcon: Chat
  }
];

const menu2 = [
  {
    name: "Tài khoản",
    path: "/seller/account",
    icon: AccountBox,
    activeIcon: AccountBox
  },
  {
    name: "Đăng xuất",
    path: "/",
    icon: LogOut,
    activeIcon: LogOut
  }
];

interface SellerDrawerListProps {
  toggleDrawer: () => void;
}

const SellerDrawerList = ({ toggleDrawer }: SellerDrawerListProps) => {
  return <DrawerList menu={menu} menu2={menu2} toggleDrawer={toggleDrawer} />;
};

export default SellerDrawerList;