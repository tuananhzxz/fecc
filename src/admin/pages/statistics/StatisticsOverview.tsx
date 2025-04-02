import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingBag, Users, TrendingUp, DollarSign } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../state/Store";
import { getSellerReport } from "../../../state/seller/report/SellerReportSlice";
import { getTransactionsBySellerId } from "../../../state/seller/transaction/TransactionSlice";
import { getPaymentOrders } from "../../../state/seller/report/PaymentOrderSlice";

const StatisticsOverview = () => {
  const dispatch = useAppDispatch();
  const { reports, loading: reportLoading } = useAppSelector((state) => state.sellerReportSlice);
  const { transactions } = useAppSelector((state) => state.transactionSlice);
  const { paymentOrders } = useAppSelector((state) => state.paymentOrderSlice);

  useEffect(() => {
    dispatch(getSellerReport());
    dispatch(getTransactionsBySellerId());
    dispatch(getPaymentOrders());
  }, [dispatch]);

  const calculateMonthlySales = () => {
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(0, index).toLocaleString('vi-VN', { month: 'short' }),
      sales: 0
    }));

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      monthlyData[month].sales += transaction.order.totalSellingPrice || 0;
    });

    return monthlyData;
  };

  const calculateCategoryDistribution = () => {
    const categories = new Map();
    
    transactions.forEach(transaction => {
      const category = transaction.order.orderItems[0]?.product?.category?.name || 'Khác';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value: (value / transactions.length) * 100
    }));
  };

  const calculateSuccessRate = () => {
    if (!paymentOrders || paymentOrders.length === 0) return 0;
    const successfulOrders = paymentOrders.filter(order => order.status === "SUCCESS").length;
    return (successfulOrders / paymentOrders.length) * 100;
  };

  const stats = {
    totalSales: reports?.totalEarnings || 0,
    totalOrders: reports?.totalOrders || 0,
    totalCustomers: new Set(transactions.map(t => t.customer.id)).size,
    averageOrderValue: reports?.totalEarnings ? reports.totalEarnings / reports.totalOrders : 0,
    monthlySales: calculateMonthlySales(),
    categoryDistribution: calculateCategoryDistribution(),
    successRate: calculateSuccessRate()
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (reportLoading) {
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
        Thống kê tổng quan
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 0", minWidth: "200px" }}>
          <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#1976d2", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <DollarSign color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Doanh thu
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(stats.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 0", minWidth: "200px" }}>
          <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#2e7d32", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <ShoppingBag color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Đơn hàng
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 0", minWidth: "200px" }}>
          <Card sx={{ bgcolor: "#fff3e0", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#ed6c02", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <Users color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Khách hàng
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 0", minWidth: "200px" }}>
          <Card sx={{ bgcolor: "#f3e5f5", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#9c27b0", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <TrendingUp color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Giá trị TB/đơn
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(stats.averageOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ flex: "1 1 auto", minWidth: "60%" }}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Doanh thu theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="sales" name="Doanh thu" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Box sx={{ flex: "1 1 auto", minWidth: "30%" }}>
          <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Phân bố theo danh mục
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default StatisticsOverview;
