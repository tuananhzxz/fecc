import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Card,
  IconButton,
  Chip,
  LinearProgress,
  TextField,
  MenuItem,
  TablePagination,
  Grid,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { RootState, useAppDispatch } from '../../../state/Store';
import { getSellerReport } from '../../../state/seller/report/SellerReportSlice';
import { useSelector } from 'react-redux';
import { getPaymentOrders } from '../../../state/seller/report/PaymentOrderSlice';
import { PaymentOrderStatus } from '../../../types/PaymentOrder';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Payment = () => {
  const dispatch = useAppDispatch();
  const { reports } = useSelector((state: RootState) => state.sellerReportSlice);
  const { paymentOrders, loading: paymentLoading } = useSelector((state: RootState) => state.paymentOrderSlice);
  const navigate = useNavigate();

  // Phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Trạng thái hiển thị bộ lọc
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getSellerReport());
    dispatch(getPaymentOrders());
  }, [dispatch]);

  // Lấy giao dịch gần nhất
  const latestTransaction = paymentOrders && paymentOrders.length > 0 
    ? paymentOrders[0] 
    : null;

  // Tính tỷ lệ thành công
  const calculateSuccessRate = () => {
    if (!paymentOrders || paymentOrders.length === 0) return 0;
    
    const successfulOrders = paymentOrders.filter(
      order => order.status === "SUCCESS"
    ).length;
    
    return (successfulOrders / paymentOrders.length) * 100;
  };

  const successRate = calculateSuccessRate();

  const totalDt = (reports?.totalEarnings || 0) - (reports?.totalRefunds || 0); 

  // Xuất dữ liệu ra Excel
  const exportToExcel = () => {
    const dataToExport = filteredPaymentOrders.map(payment => ({
      'Ngày': new Date(payment.orders[0]?.orderDate || Date.now()).toLocaleDateString('vi-VN'),
      'Thời gian': new Date(payment.orders[0]?.orderDate || Date.now()).toLocaleTimeString('vi-VN'),
      'Tên khách hàng': payment.user?.fullName || 'Không có tên',
      'Email': payment.user?.email || 'Không có email',
      'Hình thức thanh toán': payment.paymentMethod || `#ORD${payment.id}`,
      'Trạng thái': payment.status === 'SUCCESS' ? 'Thành công' : 
                    payment.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại',
      'Số tiền': payment.amount.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử thanh toán');
    XLSX.writeFile(wb, 'lich-su-thanh-toan.xlsx');
  };

  // Lọc dữ liệu dựa trên các bộ lọc
  const filteredPaymentOrders = paymentOrders ? paymentOrders.filter(payment => {
    // Lọc theo tên hoặc email khách hàng
    const matchesSearch = !searchTerm || 
      (payment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Lọc theo trạng thái
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    
    
    // Lọc theo khoảng thời gian
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate) {
      const orderDate = new Date(payment.orders[0]?.orderDate || Date.now());
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc là cuối ngày
      
      matchesDateRange = orderDate >= startDate && orderDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  }) : [];

  // Danh sách các phương thức thanh toán
  const paymentMethods = paymentOrders ? 
    Array.from(new Set(paymentOrders.map(order => order.paymentMethod))).filter(Boolean) : 
    [];

  // Xử lý phân trang
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dữ liệu đã phân trang
  const paginatedData = filteredPaymentOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Xử lý reset bộ lọc
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateRange({ startDate: '', endDate: '' });
  };

  return (
    <Box className="p-8 min-h-screen bg-gray-100">
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-4 md:mb-0">
          Thống kê thanh toán
        </Typography>
        <Box className="flex gap-2">
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            className="bg-green-600 hover:bg-green-700"
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<HistoryIcon />}
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/seller/transaction")}
          >
            Xem lịch sử
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Box className="flex justify-between items-start mb-4">
            <Box className="p-2 bg-green-100 rounded-lg">
              <AttachMoneyIcon className="text-green-600" />
            </Box>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Typography className="text-gray-600 mb-2">Tổng doanh thu</Typography>
          <Typography variant="h4" className="font-bold mb-2">
            {totalDt.toLocaleString('vi-VN', {style : 'currency', currency : 'VND'})}
          </Typography>
          <Box className="flex items-center text-green-600">
            <ArrowUpwardIcon fontSize="small" />
            <Typography variant="body2">+100% so với tháng trước</Typography>
          </Box>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Box className="flex justify-between items-start mb-4">
            <Box className="p-2 bg-blue-100 rounded-lg">
              <TrendingUpIcon className="text-blue-600" />
            </Box>
            <Chip 
              label="Gần nhất" 
              color="primary" 
              size="small"
              className="bg-blue-600"
            />
          </Box>
          <Typography className="text-gray-600 mb-2">Giao dịch gần nhất</Typography>
          <Box className="space-y-2">
            <Typography variant="h5" className="font-bold">
              {latestTransaction 
                ? latestTransaction.amount.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})
                : 'Chưa có giao dịch'}
            </Typography>
            <Typography className="text-gray-500">
              {latestTransaction 
                ? new Date(latestTransaction.orders[0]?.orderDate || Date.now()).toLocaleString('vi-VN')
                : ''}
            </Typography>
          </Box>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Typography className="text-gray-600 mb-4">Tỷ lệ thành công</Typography>
          <Box className="flex justify-between items-end mb-2">
            <Typography variant="h4" className="font-bold">{successRate.toFixed(1)}%</Typography>
            <Box className="flex items-center text-green-600">
              <ArrowUpwardIcon fontSize="small" />
              <Typography variant="body2">+{successRate.toFixed(1)}%</Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={successRate} 
            className="h-2 rounded-full"
          />
        </Card>
      </Box>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <Box className="p-6 border-b">
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Typography variant="h6" className="font-bold">
              Lịch sử giao dịch gần đây
            </Typography>
            
            <Box className="flex items-center gap-2 w-full md:w-auto">
              {/* Tìm kiếm */}
              <TextField
                placeholder="Tìm theo tên, email..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                className="w-full md:w-64"
              />
              
              {/* Nút hiển thị/ẩn bộ lọc */}
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
              </Button>
            </Box>
          </Box>
          
          {/* Khu vực bộ lọc mở rộng */}
          {showFilters && (
            <Box className="mt-4 p-4 bg-gray-50 rounded-md">
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Trạng thái"
                    >
                      <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                      <MenuItem value="SUCCESS">Thành công</MenuItem>
                      <MenuItem value="PENDING">Đang xử lý</MenuItem>
                      <MenuItem value="FAILED">Thất bại</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  />
                </Grid>
              </Grid>
              
              <Box className="flex justify-end mt-4">
                <Button
                  variant="text"
                  onClick={handleResetFilters}
                  size="small"
                  className="mr-2"
                >
                  Đặt lại
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">Ngày</TableCell>
                <TableCell className="font-semibold">Thông tin khách hàng</TableCell>
                <TableCell className="font-semibold">Hình thức</TableCell>
                <TableCell className="font-semibold">Trạng thái</TableCell>
                <TableCell className="font-semibold">Số tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((payment) => {
                  const statusMap = {
                    "PENDING": { label: 'Đang xử lý', color: 'warning' },
                    "SUCCESS": { label: 'Thành công', color: 'success' },
                    "FAILED": { label: 'Thất bại', color: 'error' },
                  };
                  
                  const status = statusMap[payment.status as keyof typeof statusMap] || { label: 'Không xác định', color: 'default' };
                  const createdDate = payment.orders[0]?.orderDate 
                    ? new Date(payment.orders[0].orderDate) 
                    : new Date();
                  
                  return (
                    <TableRow 
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <Box>
                          <Typography className="font-medium">{createdDate.toLocaleDateString('vi-VN')}</Typography>
                          <Typography className="text-sm text-gray-500">{createdDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Avatar alt={payment.user?.fullName || 'User'} />
                          <Box>
                            <Typography className="font-medium">
                              {payment.user?.fullName || 'Không có tên'}
                            </Typography>
                            <Typography className="text-sm text-gray-500">
                              {payment.user?.email || 'Không có email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{payment.paymentMethod || `#ORD${payment.id}`}</TableCell>
                      <TableCell>
                        <Chip 
                          label={status.label} 
                          color={status.color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography className={`font-medium ${payment.status === "SUCCESS" ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.status === "SUCCESS" ? '+' : ''}{payment.amount.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Không có dữ liệu giao dịch</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Phân trang */}
        <TablePagination
          component="div"
          count={filteredPaymentOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Số dòng trên trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Card>
    </Box>
  );
}

export default Payment;