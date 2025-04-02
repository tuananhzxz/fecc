import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
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
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../state/Store";
import { getTransactionsBySellerId } from "../../../state/seller/transaction/TransactionSlice";
import { fetchSellerProducts } from "../../../state/seller/SellerProduct";

const ProductStatistics = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.transactionSlice);
  const { products, loading: productsLoading } = useAppSelector((state) => state.sellerProduct);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("month");
  const [sortBy, setSortBy] = useState("sales");

  useEffect(() => {
    const jwt = localStorage.getItem("sellerToken");
    dispatch(getTransactionsBySellerId());
    dispatch(fetchSellerProducts(jwt));
  }, [dispatch]);

  const getFilteredTransactions = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const calculateProductPerformance = (filteredTransactions: typeof transactions) => {
    const productMap = new Map();

    // Khởi tạo dữ liệu cơ bản từ danh sách sản phẩm
    products.forEach(product => {
      productMap.set(product.id, {
        id: product.id,
        name: product.title,
        image: product.images?.[0] || '',
        category: product.category?.name || '',
        sales: 0,
        quantity: 0,
        growth: 0,
        stockStatus: product.quantity && product.quantity > 10 ? "in-stock" : product.quantity && product.quantity > 0 ? "low-stock" : "out-of-stock",
        stock: product.quantity || 0
      });
    });

    // Tính toán doanh số và số lượng bán từ giao dịch
    filteredTransactions.forEach(transaction => {
      transaction.order.orderItems.forEach(item => {
        if (productMap.has(item.product.id)) {
          const productData = productMap.get(item.product.id);
          productData.sales += (item.sellingPrice || 0) * (item.quantity || 0);
          productData.quantity += item.quantity || 0;
        }
      });
    });

    // Tính toán tăng trưởng
    const currentPeriod = new Date();
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);

    const currentSales = new Map();
    const previousSales = new Map();

    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      transaction.order.orderItems.forEach(item => {
        if (transactionDate >= previousPeriod && transactionDate < currentPeriod) {
          const prevSales = previousSales.get(item.product.id) || 0;
          previousSales.set(item.product.id, prevSales + (item.sellingPrice || 0) * (item.quantity || 0));
        } else if (transactionDate >= currentPeriod) {
          const currSales = currentSales.get(item.product.id) || 0;
          currentSales.set(item.product.id, currSales + (item.sellingPrice || 0) * (item.quantity || 0));
        }
      });
    });

    // Cập nhật tăng trưởng cho từng sản phẩm
    productMap.forEach((product, id) => {
      const currentSale = currentSales.get(id) || 0;
      const previousSale = previousSales.get(id) || 0;
      product.growth = previousSale > 0 
        ? ((currentSale - previousSale) / previousSale) * 100 
        : currentSale > 0 ? 100 : 0;
    });

    return Array.from(productMap.values());
  };

  // Lọc giao dịch theo khoảng thời gian
  const getTimeRangeTransactions = () => {
    switch (timeRange) {
      case 'day':
        return getFilteredTransactions(1);
      case 'week':
        return getFilteredTransactions(7);
      case 'month':
        return getFilteredTransactions(30);
      case 'year':
        return getFilteredTransactions(365);
      default:
        return transactions;
    }
  };

  // Tính toán hiệu suất sản phẩm với các giao dịch đã lọc
  const filteredTransactions = getTimeRangeTransactions();
  const productPerformance = calculateProductPerformance(filteredTransactions);

  // Lọc và sắp xếp sản phẩm
  const getFilteredAndSortedProducts = () => {
    let filtered = [...productPerformance];

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'sales':
          return b.sales - a.sales;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'growth':
          return b.growth - a.growth;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  
  // Lấy top 5 sản phẩm bán chạy nhất từ danh sách đã lọc
  const topProducts = filteredProducts.slice(0, 5);

  // Tính toán phân bố danh mục từ danh sách đã lọc
  const calculateCategoryDistribution = () => {
    const categories = new Map();
    filteredProducts.forEach(product => {
      const currentValue = categories.get(product.category) || 0;
      categories.set(product.category, currentValue + product.sales);
    });

    const totalSales = Array.from(categories.values()).reduce((a, b) => a + b, 0);
    return Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value: totalSales > 0 ? (value / totalSales) * 100 : 0
    }));
  };

  const categoryData = calculateCategoryDistribution();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value as string);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value as string);
  };

  const getStockStatusColor = (
    status: string,
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "in-stock":
        return "success";
      case "low-stock":
        return "warning";
      case "out-of-stock":
        return "error";
      default:
        return "default";
    }
  };

  const getStockStatusText = (status: string): string => {
    switch (status) {
      case "in-stock":
        return "Còn hàng";
      case "low-stock":
        return "Sắp hết";
      case "out-of-stock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (productsLoading) {
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
        Thống kê theo sản phẩm
      </Typography>

      {/* Filters and Search */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 400px" }}>
          <TextField
            fullWidth
            label="Tìm kiếm sản phẩm"
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
        <Box sx={{ flex: "1 1 200px" }}>
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
        <Box sx={{ flex: "1 1 200px" }}>
          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sắp xếp theo</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sắp xếp theo"
              onChange={handleSortChange}
            >
              <MenuItem value="sales">Doanh số</MenuItem>
              <MenuItem value="quantity">Số lượng bán</MenuItem>
              <MenuItem value="growth">Tăng trưởng</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Top Products Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Top 5 sản phẩm bán chạy nhất
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => `${value / 1000000}tr`}
            />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="sales" name="Doanh thu" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {/* Category Distribution */}
        <Box sx={{ flex: "1 1 400px" }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Phân bố doanh thu theo danh mục
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
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
                  {categoryData.map((_, index) => (
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

        {/* Sales Growth */}
        <Box sx={{ flex: "1 1 400px" }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Tăng trưởng doanh số theo sản phẩm
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="growth" name="Tăng trưởng" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      </Box>

      {/* Product Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hiệu suất chi tiết sản phẩm
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell align="right">Doanh thu</TableCell>
                <TableCell align="right">Số lượng</TableCell>
                <TableCell align="center">Tăng trưởng</TableCell>
                <TableCell align="center">Trạng thái kho</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={product.image}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Typography variant="body1">{product.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(product.sales)}
                  </TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {product.growth > 0 ? (
                        <ArrowUp size={16} color="green" />
                      ) : (
                        <ArrowDown size={16} color="red" />
                      )}
                      <Typography
                        variant="body2"
                        color={product.growth > 0 ? "green" : "red"}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(product.growth).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStockStatusText(product.stockStatus)}
                      color={getStockStatusColor(product.stockStatus)}
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

export default ProductStatistics;
