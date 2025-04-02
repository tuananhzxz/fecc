import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  AreaChart,
  Area,
  Bar,
  BarChart,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../../state/Store";
import { getTransactionsBySellerId } from "../../../state/seller/transaction/TransactionSlice";
import { getSellerReport } from "../../../state/seller/report/SellerReportSlice";

const MonthlyStatistics = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.transactionSlice);
  const { reports, loading } = useAppSelector((state) => state.sellerReportSlice);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getTransactionsBySellerId());
    dispatch(getSellerReport());
  }, [dispatch]);

  const getTransactionsForYear = (year: number) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === year;
    });
  };

  const calculateMonthlyData = (year: number) => {
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(year, index).toLocaleString('vi-VN', { month: 'long' }),
      sales: 0,
      orders: 0,
      customers: new Set<number>(),
      aov: 0
    }));

    const yearTransactions = getTransactionsForYear(year);
    
    yearTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      monthlyData[month].sales += transaction.order.totalSellingPrice || 0;
      monthlyData[month].orders += 1;
      if (transaction.customer.id) {
        monthlyData[month].customers.add(transaction.customer.id);
      }
    });

    // Tính giá trị trung bình đơn hàng và chuyển đổi Set thành số lượng
    return monthlyData.map(data => ({
      ...data,
      aov: data.orders > 0 ? data.sales / data.orders : 0,
      customers: data.customers.size
    }));
  };

  const getYearlyData = () => {
    const years = [selectedYear - 2, selectedYear - 1, selectedYear];
    return years.map(year => ({
      year,
      sales: getTransactionsForYear(year).reduce((sum, t) => sum + (t.order.totalSellingPrice || 0), 0),
      orders: getTransactionsForYear(year).length,
      forecasted: false
    }));
  };

  const monthlyData = calculateMonthlyData(selectedYear);
  const yearlyData = getYearlyData();

  const formatCurrency = (value: number) => {
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Thống kê theo tháng
      </Typography>

      {/* Year selector */}
      <Box mb={4}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="year-select-label">Năm</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            label="Năm"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[selectedYear - 2, selectedYear - 1, selectedYear].map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Monthly Sales Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Doanh thu theo tháng (năm {selectedYear})
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "sales")
                  return [formatCurrency(value as number), "Doanh thu"];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              name="Doanh thu"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Monthly Orders & Customers Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Đơn hàng và khách hàng theo tháng (năm {selectedYear})
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              name="Đơn hàng"
              stroke="#82ca9d"
            />
            <Line
              type="monotone"
              dataKey="customers"
              name="Khách hàng"
              stroke="#ffc658"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Average Order Value Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Giá trị trung bình mỗi đơn hàng theo tháng (năm {selectedYear})
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="aov"
              name="Giá trị TB/đơn"
              stroke="#ff7300"
              fill="#ff7300"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      {/* Yearly Comparison */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          So sánh doanh thu qua các năm
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${value / 1000000}tr`} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="sales" name="Doanh thu" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default MonthlyStatistics;
