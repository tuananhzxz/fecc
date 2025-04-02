import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingBag, Users, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../state/Store";
import { getTransactionsBySellerId } from "../../../state/seller/transaction/TransactionSlice";
import { getPaymentOrders } from "../../../state/seller/report/PaymentOrderSlice";
import { vi } from "date-fns/locale";

const DailyStatistics = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.transactionSlice);
  const { paymentOrders, loading: paymentLoading } = useAppSelector((state) => state.paymentOrderSlice);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    dispatch(getTransactionsBySellerId());
    dispatch(getPaymentOrders());
  }, [dispatch]);

  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getHourlyData = (date: Date) => {
    const hourlyData = new Array(24).fill(0).map((_, index) => ({
      hour: `${index.toString().padStart(2, '0')}:00`,
      sales: 0,
      orders: 0
    }));

    const dayTransactions = getTransactionsForDate(date);
    
    dayTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const hour = transactionDate.getHours();
      hourlyData[hour].sales += transaction.order.totalSellingPrice || 0;
      hourlyData[hour].orders += 1;
    });

    return hourlyData.filter(data => data.sales > 0 || data.orders > 0);
  };

  const getTopProducts = (date: Date) => {
    const productMap = new Map();
    const dayTransactions = getTransactionsForDate(date);

    dayTransactions.forEach(transaction => {
      transaction.order.orderItems.forEach(item => {
        const productName = item.product.title;
        const currentCount = productMap.get(productName) || 0;
        productMap.set(productName, currentCount + (item.quantity || 1));
      });
    });

    const sortedProducts = Array.from(productMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, sales]) => ({
        name,
        sales,
        percentage: (sales / Array.from(productMap.values()).reduce((a, b) => a + b, 0)) * 100
      }));

    if (sortedProducts.length === 0) {
      return [{ name: 'Không có dữ liệu', sales: 0, percentage: 100 }];
    }

    return sortedProducts;
  };

  const dailyData = {
    sales: getTransactionsForDate(selectedDate).reduce((sum, t) => sum + (t.order.totalSellingPrice || 0), 0),
    orders: getTransactionsForDate(selectedDate).length,
    customers: new Set(getTransactionsForDate(selectedDate).map(t => t.customer.id)).size,
    avgOrderValue: getTransactionsForDate(selectedDate).length > 0 
      ? getTransactionsForDate(selectedDate).reduce((sum, t) => sum + (t.order.totalSellingPrice || 0), 0) / getTransactionsForDate(selectedDate).length 
      : 0,
    hourlyData: getHourlyData(selectedDate),
    topProducts: getTopProducts(selectedDate),
    peakHour: getHourlyData(selectedDate).reduce((max, current) => 
      current.sales > (max?.sales || 0) ? current : max, 
      { hour: '', sales: 0 }
    ).hour
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (paymentLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Thống kê theo ngày
      </Typography>

      {/* Date selector */}
      <Box mb={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <DatePicker
            label="Chọn ngày"
            value={selectedDate}
            onChange={(newValue: any) => {
              setSelectedDate(newValue);
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ShoppingBag size={20} color="#1976d2" />
                <Typography variant="h6" ml={1} color="textSecondary">
                  Doanh thu
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(dailyData.sales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ShoppingBag size={20} color="#2e7d32" />
                <Typography variant="h6" ml={1} color="textSecondary">
                  Đơn hàng
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {dailyData.orders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Users size={20} color="#ed6c02" />
                <Typography variant="h6" ml={1} color="textSecondary">
                  Khách hàng
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {dailyData.customers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp size={20} color="#9c27b0" />
                <Typography variant="h6" ml={1} color="textSecondary">
                  Giá trị TB/đơn
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(dailyData.avgOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hourly Sales Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Doanh thu theo giờ
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="sales" name="Doanh thu" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Hourly Orders Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Đơn hàng theo giờ
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              name="Đơn hàng"
              stroke="#82ca9d"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Top Products */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sản phẩm bán chạy trong ngày
        </Typography>
        <Box
          height={300}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dailyData.topProducts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {dailyData.topProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
          <Typography variant="subtitle1" textAlign="center">
            Giờ cao điểm: {dailyData.peakHour}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DailyStatistics;
