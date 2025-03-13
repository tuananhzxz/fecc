import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { getTransactionsBySellerId } from '../../../state/seller/transaction/TransactionSlice';
import { getSellerOrders } from '../../../state/seller/SellerOrderSlice';
import { fetchSellerProducts } from '../../../state/seller/SellerProduct';
import { OrderStatus } from '../../../types/orderType';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const {transactions} = useAppSelector(state => state.transactionSlice);
  const {orders } = useAppSelector(state => state.sellerOrderSlice);
  const {products} = useAppSelector(state => state.sellerProduct);
  const token = localStorage.getItem('sellerToken');
  useEffect(() => {
    dispatch(getTransactionsBySellerId());
    dispatch(getSellerOrders(token || ''));
    dispatch(fetchSellerProducts(token || ''));

  }, [dispatch]);
  const navigate = useNavigate();
  
  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  const nameSeller = products.map(product => {
    return product.seller?.sellerName;
  }).slice(0, 1).join(' ');

  const revenueData = transactions.reduce<Array<{ name: string; revenue: number }>>((acc, transaction) => {
    const dayOfWeek = new Date(transaction.date).toLocaleDateString('vi-VN', { weekday: 'short' });
    const existingEntry = acc.find(entry => entry.name === dayOfWeek);
    if (existingEntry) {
      existingEntry.revenue += (transaction.order.totalSellingPrice || 0);
    } else {
      acc.push({ name: dayOfWeek, revenue: transaction.order.totalSellingPrice || 0 });
    }
    return acc;
  }, []);

  const productData = products.reduce<Array<{ name: string, value: number }>>((acc, product) => {
    const category = product.category?.name || 'Không xác định';
    const existingEntry = acc.find((entry) => entry.name === category);
    if (existingEntry) {
      existingEntry.value += product.quantity || 0;
    } else {
      acc.push({ name: category, value: product.quantity || 0 });
    }
    return acc;
  }, []);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const formatCurrency = (value : number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const recentOrders = [...orders]
  .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  .map(order => ({
    id: order.id,
    customer: order.user?.fullName || 'Khách hàng chưa xác định',
    date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
    total: order.totalSellingPrice || 0,
    status: order.orderStatus,
  }))
  .slice(0, 5);

  const calculatePerformanceSummary = () => {
    const totalRevenue = transactions.reduce((sum, transaction) => sum + (transaction.order.totalSellingPrice || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = Array.from(new Set(orders.map(order => order.user.id))).length;
    const totalProducts = products.length;
  
    return [
      { name: 'Doanh thu', value: formatCurrency(totalRevenue), icon: <AttachMoneyIcon />, color: '#4F46E5' },
      { name: 'Đơn hàng', value: totalOrders.toString(), icon: <ShoppingCartIcon />, color: '#10B981' },
      { name: 'Khách hàng', value: totalCustomers.toString(), icon: <GroupIcon />, color: '#F59E0B' },
      { name: 'Sản phẩm', value: totalProducts.toString(), icon: <InventoryIcon />, color: '#3B82F6' },
    ];
  };

  const topProducts = products
  .map(product => ({
    name: product.title || 'Sản phẩm không tên'
  }))
  .slice(0, 4); 

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Box className="flex justify-between items-center mb-8">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Trang quản trị
          </Typography>
          <Typography className="text-gray-500">
            {greeting} {nameSeller}, Đây là tổng quan về cửa hàng của bạn.
          </Typography>
        </Box>
      </Box>

      {/* Performance Cards */}
      <Grid container spacing={3} className="mb-8">
        {calculatePerformanceSummary().map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="p-4 hover:shadow-lg transition-all">
              <Box className="flex items-center gap-4">
                <Box className="p-3 rounded-full" style={{ backgroundColor: `${item.color}20` }}>
                  <Box style={{ color: item.color }}>{item.icon}</Box>
                </Box>
                <Box>
                  <Typography className="text-gray-500 text-sm">{item.name}</Typography>
                  <Typography variant="h6" className="font-bold">{item.value}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} md={8}>
          <Card className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-bold">
                Doanh thu theo ngày
              </Typography>
              <Button onClick={() => navigate("/seller/transaction")} size="small" variant="outlined" startIcon={<TrendingUpIcon />}>
                Xem chi tiết
              </Button>
            </Box>
            <Box className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#4F46E5" barSize={40} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="p-6 h-full">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-bold">
                Phân loại sản phẩm
              </Typography>
              <Button onClick={() => navigate("/seller/products")} size="small" variant="text" className="text-indigo-600">
                Chi tiết
              </Button>
            </Box>
            <Box className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders and Top Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-bold">
                Đơn hàng gần đây
              </Typography>
              <Button onClick={() => navigate("/seller/orders")} size="small" variant="text" className="text-indigo-600">
                Xem tất cả
              </Button>
            </Box>
            <Box className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Mã đơn</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ngày đặt</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiền</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3">{order.date}</td>
                      <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <Box 
                          component="span" 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          sx={{
                            backgroundColor: 
                              order.status === 'PENDING' ? '#D1FAE5' :
                              order.status === 'PLACED' ? '#DBEAFE' :
                              order.status === 'CONFIRMED' ? '#FEF3C7' : '#F3F4F6',
                            color: 
                              order.status === 'SHIPPED' ? '#065F46' :
                              order.status === 'DELIVERED' ? '#1E40AF' :
                              order.status === 'CANCELLED' ? '#92400E' : '#374151',
                          }}
                        >
                          {statusTranslations[order.status]}
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-bold">
                Sản phẩm bán chạy
              </Typography>
            </Box>
            <List>
              {topProducts.map((product, index) => (
                <React.Fragment key={index}>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <Avatar className="bg-indigo-100 text-indigo-600">
                        <FavoriteIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={product.name}
                    />
                  </ListItem>
                  {index < topProducts.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const statusTranslations: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PLACED]: 'Đã đặt hàng',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPED]: 'Đang giao hàng',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CANCELLED]: 'Đã hủy'
};

export default Dashboard;