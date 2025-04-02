import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Search,
  UserPlus,
  Users,
  ShoppingBag,
  Repeat,
  Download,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../state/Store";
import { getTransactionsBySellerId } from "../../../state/seller/transaction/TransactionSlice";
import { getSellerReport } from "../../../state/seller/report/SellerReportSlice";

const CustomerStatistics = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.transactionSlice);
  const { reports, loading } = useAppSelector((state) => state.sellerReportSlice);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    dispatch(getTransactionsBySellerId());
    dispatch(getSellerReport());
  }, [dispatch]);

  // Lấy danh sách khách hàng duy nhất từ giao dịch
  const getUniqueCustomers = () => {
    const customerMap = new Map();
    transactions.forEach(transaction => {
      const customer = transaction.customer;
      if (!customerMap.has(customer.id)) {
        customerMap.set(customer.id, {
          id: customer.id,
          name: customer.fullName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName)}`,
          email: customer.email,
          totalSpent: 0,
          orders: 0,
          lastPurchase: null,
          segment: 'Mới'
        });
      }
      const customerData = customerMap.get(customer.id);
      customerData.totalSpent += transaction.order.totalSellingPrice || 0;
      customerData.orders += 1;
      const purchaseDate = new Date(transaction.date);
      if (!customerData.lastPurchase || purchaseDate > customerData.lastPurchase) {
        customerData.lastPurchase = purchaseDate;
      }
    });

    // Phân loại khách hàng dựa trên tổng chi tiêu
    return Array.from(customerMap.values()).map(customer => {
      if (customer.totalSpent > 20000000) return { ...customer, segment: 'VIP' };
      if (customer.totalSpent > 10000000) return { ...customer, segment: 'Trung thành' };
      if (customer.totalSpent > 5000000) return { ...customer, segment: 'Thường xuyên' };
      return { ...customer, segment: 'Mới' };
    });
  };

  const getFilteredCustomers = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const calculateCustomerGrowth = () => {
    const currentPeriodCustomers = new Set(
      getFilteredCustomers(30).map(t => t.customer.id)
    ).size;
    const previousPeriodCustomers = new Set(
      getFilteredCustomers(60).filter(t => {
        const date = new Date(t.date);
        return date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).map(t => t.customer.id)
    ).size;

    return {
      totalCustomers: currentPeriodCustomers,
      newCustomers: currentPeriodCustomers - previousPeriodCustomers,
      returningCustomers: previousPeriodCustomers,
      activeCustomers: new Set(
        getFilteredCustomers(7).map(t => t.customer.id)
      ).size
    };
  };

  const calculateCustomerSegments = () => {
    const customers = getUniqueCustomers();
    const segments = new Map();
    customers.forEach(customer => {
      const count = segments.get(customer.segment) || 0;
      segments.set(customer.segment, count + 1);
    });

    return Array.from(segments.entries()).map(([name, value]) => ({
      name,
      value: (value / customers.length) * 100
    }));
  };

  const customerSummary = calculateCustomerGrowth();
  const customerSegments = calculateCustomerSegments();
  const topCustomers = getUniqueCustomers()
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 7);

  const customerGrowth = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('vi-VN', { month: 'short' });
    if (!acc[month]) {
      acc[month] = {
        month,
        customers: new Set(),
        newCustomers: new Set()
      };
    }
    acc[month].customers.add(transaction.customer.id || 0);
    acc[month].newCustomers.add(transaction.customer.id || 0);
    return acc;
  }, {} as Record<string, { month: string; customers: Set<number>; newCustomers: Set<number> }>);

  const customerGrowthData = Object.values(customerGrowth).map(data => ({
    month: data.month,
    customers: data.customers.size,
    newCustomers: data.newCustomers.size
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTimeRangeChange = (event: { target: { value: string } }) => {
    setTimeRange(event.target.value);
  };

  const getSegmentColor = (
    segment: string,
  ): "success" | "primary" | "info" | "warning" | "default" => {
    switch (segment) {
      case "VIP":
        return "success";
      case "Trung thành":
        return "primary";
      case "Thường xuyên":
        return "info";
      case "Mới":
        return "warning";
      default:
        return "default";
    }
  };

  const filteredCustomers = topCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.segment.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Thống kê khách hàng
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => alert("Báo cáo sẽ được tải xuống!")}
        >
          Xuất báo cáo
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}>
          <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#1976d2", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <Users color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Tổng khách hàng
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {customerSummary.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}>
          <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#2e7d32", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <UserPlus color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Khách hàng mới
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {customerSummary.newCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}>
          <Card sx={{ bgcolor: "#fff3e0", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#ed6c02", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <Repeat color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Khách quay lại
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {customerSummary.returningCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}>
          <Card sx={{ bgcolor: "#f3e5f5", height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{ bgcolor: "#9c27b0", p: 1, borderRadius: "50%", mr: 2 }}
                >
                  <ShoppingBag color="white" size={24} />
                </Box>
                <Typography variant="h6" color="textSecondary">
                  Khách hàng đang hoạt động
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {customerSummary.activeCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 8" } }}>
          <TextField
            fullWidth
            label="Tìm kiếm khách hàng"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
          <FormControl fullWidth>
            <InputLabel id="time-range-label">Khoảng thời gian</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Khoảng thời gian"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="day">Hôm nay</MenuItem>
              <MenuItem value="week">Tuần này</MenuItem>
              <MenuItem value="month">Tháng này</MenuItem>
              <MenuItem value="year">Năm nay</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 3,
          mb: 4,
        }}
      >
        {/* Customer Growth Chart */}
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 8" } }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Tăng trưởng khách hàng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customers"
                  name="Tổng số khách hàng"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  name="Khách hàng mới"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Customer Segments */}
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Phân khúc khách hàng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
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
                  {customerSegments.map((_, index) => (
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

      {/* Average Spending by Segment */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Chi tiêu trung bình theo phân khúc
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={customerSegments.map(segment => ({
              segment: segment.name,
              spending: getUniqueCustomers()
                .filter(customer => customer.segment === segment.name)
                .reduce((acc, customer) => acc + customer.totalSpent, 0) /
                getUniqueCustomers().filter(customer => customer.segment === segment.name).length
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="spending" name="Chi tiêu trung bình" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Top Customers Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top khách hàng
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Tổng chi tiêu</TableCell>
                <TableCell align="right">Số đơn hàng</TableCell>
                <TableCell>Lần mua gần nhất</TableCell>
                <TableCell align="center">Phân khúc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={customer.avatar}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Typography variant="body1">{customer.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                  <TableCell align="right">{customer.orders}</TableCell>
                  <TableCell>
                    {customer.lastPurchase?.toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={customer.segment}
                      color={getSegmentColor(customer.segment)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CustomerStatistics;
