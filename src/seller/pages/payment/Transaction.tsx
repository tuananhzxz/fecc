import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  CompareArrows as TransferIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { getTransactionsBySellerId } from '../../../state/seller/transaction/TransactionSlice';
import { OrderStatus } from '../../../types/orderType';
import * as XLSX from 'xlsx';

const Transaction = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [timeRange, setTimeRange] = useState('7days');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector(state => state.transactionSlice);

  useEffect(() => {
    dispatch(getTransactionsBySellerId());
  }, [dispatch]);

  const statusTranslations: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.PLACED]: 'Đã đặt hàng',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPED]: 'Đang giao hàng',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CANCELLED]: 'Đã hủy'
};

  // Current period calculations
  const getFilteredTransactions = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= today;
    });
  };

  // Previous period calculations for comparisons
  const getPreviousFilteredTransactions = (days: number) => {
    const today = new Date();
    const startCurrentPeriod = new Date(today);
    startCurrentPeriod.setDate(today.getDate() - days);
    
    const endPreviousPeriod = new Date(startCurrentPeriod);
    endPreviousPeriod.setDate(endPreviousPeriod.getDate() - 1);
    
    const startPreviousPeriod = new Date(endPreviousPeriod);
    startPreviousPeriod.setDate(startPreviousPeriod.getDate() - days);
    
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startPreviousPeriod && transactionDate <= endPreviousPeriod;
    });
  };

  // Get transactions for current periods 
  const transaction7day = getFilteredTransactions(7);
  const transaction24h = getFilteredTransactions(1);
  const transaction30day = getFilteredTransactions(30);

  // Get transactions for previous periods (for comparison)
  const previousTransaction7day = getPreviousFilteredTransactions(7);
  const previousTransaction24h = getPreviousFilteredTransactions(1);
  const previousTransaction30day = getPreviousFilteredTransactions(30);

  // Calculate total money
  const calculateTotalMoney = (transactionList: any[]) => {
    return transactionList.reduce((total, transaction) => total + transaction.order.totalSellingPrice, 0);
  };

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 100; // If previous was 0, consider it 100% increase
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Total transaction amounts
  const totalMoney7Day = calculateTotalMoney(transaction7day);
  const previousTotalMoney7Day = calculateTotalMoney(previousTransaction7day);
  const percentChange7Day : any = calculatePercentageChange(totalMoney7Day, previousTotalMoney7Day);

  // Transaction counts
  const quantityTransaction24h = transaction24h.length;
  const previousQuantityTransaction24h = previousTransaction24h.length;
  const percentChange24h : any = calculatePercentageChange(quantityTransaction24h, previousQuantityTransaction24h);

  // Average transaction value
  const calculateAverage = (transactionList: any[]) => {
    const total = calculateTotalMoney(transactionList);
    return transactionList.length > 0 ? total / transactionList.length : 0;
  };

  const averageTransaction30Day = calculateAverage(transaction30day);
  const previousAverageTransaction30Day = calculateAverage(previousTransaction30day);
  const percentChangeAverage : any = calculatePercentageChange(averageTransaction30Day, previousAverageTransaction30Day);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Format date from timestamp
  const getTimeFromDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateFromDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generate chart data based on time range
  const generateChartData = () => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getDate() === date.getDate() && 
               transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const amount = calculateTotalMoney(dayTransactions);
      
      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        amount: amount
      });
    }
    
    return data;
  };

  // Status distribution for pie chart
  const generateStatusData = () => {
    const statusCounts: {[key: string]: number} = {};
    
    // Initialize all statuses with 0
    Object.values(OrderStatus).forEach(status => {
      const translatedStatus = statusTranslations[status];
      statusCounts[translatedStatus] = 0;
    });
    
    // Count transactions by status
    transactions.forEach(transaction => {
      const translatedStatus = statusTranslations[transaction.order.orderStatus];
      statusCounts[translatedStatus] = (statusCounts[translatedStatus] || 0) + 1;
    });
    
    // Convert to array format for chart
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };

  // Colors for pie chart
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  // Filter transactions based on selected tab
  const getFilteredTransactionsByStatus = () => {
    if (tabValue === 0) return transactions; // All transactions
    if (tabValue === 1) return transactions.filter(t => 
      [OrderStatus.DELIVERED, OrderStatus.CONFIRMED].includes(t.order.orderStatus as OrderStatus)); // Successful
    if (tabValue === 2) return transactions.filter(t => 
      [OrderStatus.PENDING, OrderStatus.PLACED, OrderStatus.SHIPPED].includes(t.order.orderStatus as OrderStatus)); // Processing
    if (tabValue === 3) return transactions.filter(t => 
      t.order.orderStatus === OrderStatus.CANCELLED); // Failed
    
    return transactions;
  };

  const displayedTransactions = getFilteredTransactionsByStatus();
  const chartData = generateChartData();
  const statusData = generateStatusData();

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = displayedTransactions.map(transaction => ({
      'Mã giao dịch': `#${transaction.id.toString().padStart(6, '0')}`,
      'Khách hàng': transaction.customer.fullName,
      'Email': transaction.customer.email,
      'Trạng thái': statusTranslations[transaction.order.orderStatus],
      'Ngày': getDateFromDate(transaction.date),
      'Thời gian': getTimeFromDate(transaction.date),
      'Số tiền': formatCurrency(transaction.order.totalSellingPrice || 0)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Giao dịch');
    XLSX.writeFile(wb, 'danh-sach-giao-dich.xlsx');
  };

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <Box className="mb-8">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="font-bold text-gray-800">
            Giao dịch
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700"
          >
            Xuất Excel
          </Button>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} md={4}>
            <Card className="p-6 hover:shadow-lg transition-all">
              <Box className="flex items-center justify-between mb-4">
                <Box className="p-2 bg-blue-100 rounded-full">
                  <WalletIcon className="text-blue-600" />
                </Box>
                <Chip label="Tuần này" size="small" className="bg-blue-50 text-blue-600" />
              </Box>
              <Typography className="text-gray-600 mb-2">
                Tổng giao dịch
              </Typography>
              <Typography variant="h4" className="font-bold mb-1">
                {formatCurrency(totalMoney7Day)}
              </Typography>
              <Typography className={percentChange7Day >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                {percentChange7Day >= 0 ? `+${percentChange7Day}%` : `${percentChange7Day}%`} so với tuần trước
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="p-6 hover:shadow-lg transition-all">
              <Box className="flex items-center justify-between mb-4">
                <Box className="p-2 bg-green-100 rounded-full">
                  <TransferIcon className="text-green-600" />
                </Box>
                <Typography className="text-gray-500">24h qua</Typography>
              </Box>
              <Typography className="text-gray-600 mb-2">
                Số lượng giao dịch
              </Typography>
              <Typography variant="h4" className="font-bold mb-1">
                {quantityTransaction24h}
              </Typography>
              <Typography className={percentChange24h >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                {percentChange24h >= 0 ? `+${percentChange24h}%` : `${percentChange24h}%`} so với hôm qua
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="p-6 hover:shadow-lg transition-all">
              <Box className="flex items-center justify-between mb-4">
                <Box className="p-2 bg-purple-100 rounded-full">
                  <PaymentsIcon className="text-purple-600" />
                </Box>
                <Typography className="text-gray-500">Tháng này</Typography>
              </Box>
              <Typography className="text-gray-600 mb-2">
                Trung bình/giao dịch
              </Typography>
              <Typography variant="h4" className="font-bold mb-1">
                {formatCurrency(averageTransaction30Day)}
              </Typography>
              <Typography className={percentChangeAverage >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                {percentChangeAverage >= 0 ? `+${percentChangeAverage}%` : `${percentChangeAverage}%`} so với tháng trước
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Chart Sections */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} md={8}>
            <Card className="p-6">
              <Box className="flex justify-between items-center mb-6">
                <Typography variant="h6" className="font-bold">
                  Biểu đồ giao dịch
                </Typography>
                <TextField
                  select
                  size="small"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-40"
                >
                  <MenuItem value="7days">7 ngày qua</MenuItem>
                  <MenuItem value="30days">30 ngày qua</MenuItem>
                  <MenuItem value="90days">90 ngày qua</MenuItem>
                </TextField>
              </Box>
              <Box className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="p-6">
              <Box className="mb-6">
                <Typography variant="h6" className="font-bold mb-2">
                  Phân bố trạng thái
                </Typography>
                <Typography className="text-gray-500 text-sm">
                  Số lượng giao dịch theo trạng thái
                </Typography>
              </Box>
              <Box className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                    <Legend />
                  </PieChart>
                  </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card className="mb-6">
          <Box className="p-4 border-b">
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm giao dịch..."
                  InputProps={{
                    startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box className="flex gap-3">
                  <TextField
                    fullWidth
                    size="small"
                    label="Từ ngày"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Đến ngày"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Trạng thái"
                  defaultValue=""
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  {Object.values(OrderStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusTranslations[status]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Tabs 
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            className="px-4"
          >
            <Tab label="Tất cả giao dịch" />
            <Tab label="Giao dịch thành công" />
            <Tab label="Giao dịch đang xử lý" />
            <Tab label="Giao dịch thất bại" />
          </Tabs>
        </Card>

        {/* Transactions Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell>Thông tin</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      #{transaction.id.toString().padStart(6, '0')}
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-3">
                        <Avatar alt={transaction.customer?.fullName} />
                        <Box>
                          <Typography className="font-medium">
                            {transaction.customer.fullName}
                          </Typography>
                          <Typography className="text-sm text-gray-500">
                            {transaction.customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusTranslations[transaction.order.orderStatus]}
                        size="small"
                        className={
                          transaction.order.orderStatus === OrderStatus.DELIVERED
                            ? 'bg-green-100 text-green-800'
                            : transaction.order.orderStatus === OrderStatus.CONFIRMED
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.order.orderStatus === OrderStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : transaction.order.orderStatus === OrderStatus.PLACED
                            ? 'bg-indigo-100 text-indigo-800'
                            : transaction.order.orderStatus === OrderStatus.SHIPPED
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography className="font-medium">
                          {getDateFromDate(transaction.date)}
                        </Typography>
                        <Typography className="text-sm text-gray-500">
                          {getTimeFromDate(transaction.date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography className="text-green-600 font-medium">
                        {formatCurrency(transaction.order.totalSellingPrice || 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={displayedTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} của ${count}`
            }
          />
        </Card>
      </Box>
    </Box>
  );
}

export default Transaction;