import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { OrderState } from '../../types/orderType';
import { Address } from '../../types/UserType';
import { api } from '../../config/Api';

const initialState: OrderState = {
  orders: [],
  orderItem: null,
  currentOrder: null,
  paymentOrder: null,
  loading: false,
  error: null,
  orderCanceled: false,
  paymentSuccess: false
};
const token = localStorage.getItem('token');
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ shippingAddress, paymentMethod }: { shippingAddress: Address, paymentMethod: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/order/create', shippingAddress, {
        params: { paymentMethod },
        headers: {  'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error : any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/order/user', {
        headers: {  'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error : any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/order/details/${orderId}`, {
        headers: {  'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error : any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOrderItemById = createAsyncThunk(
  'order/getOrderItemById',
  async (orderItemId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/order/item/${orderItemId}`, {
        headers: {  'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error : any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/order/${orderId}/cancel`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error : any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.error = null;
      state.loading = false;
      state.orderCanceled = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get User Orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Order By Id
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Order Item By Id
      .addCase(getOrderItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItem = action.payload;
      })
      .addCase(getOrderItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderCanceled = true;
        state.currentOrder = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;