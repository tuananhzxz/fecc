import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  TextField,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../state/Store";
import {
  getSellerOrders,
  updateOrderStatus,
} from "../../../state/seller/SellerOrderSlice";
import { OrderStatus } from "../../../types/orderType";

type PaymentStatusMethod = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const statusColors: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<PaymentStatusMethod, string> = {
  PENDING: "bg-yellow-100 text-yellow-900",
  PROCESSING: "bg-blue-100 text-blue-900",
  COMPLETED: "bg-green-100 text-green-900",
  FAILED: "bg-red-100 text-red-900",
};

const paymentStatusText: Record<PaymentStatusMethod, string> = {
  PENDING: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
};

const statusText: Record<string, string> = {
  PENDING: "Đang xử lý",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const OrderTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error, updateStatus } = useSelector(
    (state: RootState) => state.sellerOrderSlice,
  );
  const jwt = localStorage.getItem("sellerToken");

  // Local state to manage orders
  const [localOrders, setLocalOrders] = useState(orders);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Update localOrders when orders from Redux change
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (jwt) {
      dispatch(getSellerOrders(jwt));
    }
  }, [dispatch, jwt]);

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    if (jwt) {
      try {
        await dispatch(
          updateOrderStatus({
            orderId: orderId,
            orderStatus: newStatus,
            jwt,
          }),
        ).unwrap();

        // Update local state immediately after successful update
        setLocalOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, orderStatus: newStatus } : order,
          ),
        );
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOrders = localOrders.filter((order) => {
    const searchString = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(searchString) ||
      order.orderItems.some((item) =>
        item.product.title.toLowerCase().includes(searchString),
      ) ||
      order.shippingAddress?.name.toLowerCase().includes(searchString) ||
      order.shippingAddress?.address.toLowerCase().includes(searchString) ||
      order.shippingAddress?.phone.includes(searchString) ||
      statusText[order.orderStatus].toLowerCase().includes(searchString)
    );
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const StatusChip = ({
    status,
    type = "order",
  }: {
    status: OrderStatus | PaymentStatusMethod;
    type?: "order" | "payment";
  }) => {
    const colorClasses =
      type === "order"
        ? statusColors[status as OrderStatus]
        : paymentStatusColors[status as PaymentStatusMethod];

    const text =
      type === "order"
        ? statusText[status as OrderStatus]
        : paymentStatusText[status as PaymentStatusMethod];

    return (
      <div
        className={`inline-flex px-3 py-1 rounded-full font-medium text-sm ${colorClasses}`}
      >
        {text}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Quản lý đơn hàng</h2>

      {updateStatus.isLoading && (
        <div className="mb-4 text-blue-500">Đang cập nhật trạng thái...</div>
      )}
      {updateStatus.error && (
        <div className="mb-4 text-red-500">{updateStatus.error}</div>
      )}

      {/* Search Field */}
      <div className="mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo mã đơn hàng, sản phẩm, địa chỉ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="w-5 h-5 text-gray-500" />
              </InputAdornment>
            ),
          }}
          className="bg-white"
        />
      </div>

      <TableContainer component={Paper} className="shadow-lg">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell className="font-semibold">Mã đơn hàng</TableCell>
              <TableCell className="font-semibold">Sản phẩm</TableCell>
              <TableCell className="font-semibold">Địa chỉ giao hàng</TableCell>
              <TableCell className="font-semibold">
                Trạng thái thanh toán
              </TableCell>
              <TableCell className="font-semibold">Trạng thái</TableCell>
              <TableCell className="font-semibold">
                Cập nhật trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 mb-2"
                    >
                      <Avatar
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-16 rounded-lg"
                        variant="square"
                      />
                      <div>
                        <h3 className="font-medium">{item.product.title}</h3>
                        <p className="text-gray-600">
                          {item.product.sellingPrice.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.shippingAddress?.name}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress?.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={order.paymentStatus as PaymentStatusMethod}
                    type="payment"
                  />
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={order.orderStatus as OrderStatus}
                    type="order"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus,
                      )
                    }
                    size="small"
                    className="min-w-[150px]"
                  >
                    {Object.entries(statusText).map(([status, text]) => (
                      <MenuItem key={status} value={status}>
                        {text}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong số ${count}`
          }
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </div>
  );
};

export default OrderTable;
