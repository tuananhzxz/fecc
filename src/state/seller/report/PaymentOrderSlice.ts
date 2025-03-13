import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../../config/Api";
import { PaymentOrder } from "../../../types/PaymentOrder";

export interface PaymentOrderState {
    paymentOrders : PaymentOrder[];
    loading : boolean;
    error : string | null;
}

const initialState : PaymentOrderState = {
    paymentOrders : [],
    loading : false,
    error : null
}


export const getPaymentOrders = createAsyncThunk(
    'paymentOrder/getPaymentOrders',
    async ( _, { rejectWithValue }) => {
        try {
            const jwt = localStorage.getItem('sellerToken');
            const response = await api.get(`/api/payment-order`, {
                headers : {
                    'Authorization' : `Bearer ${jwt}`
                }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Error fetching payment orders');
        }
    }
);

const paymentOrderSlice = createSlice({
    name : 'paymentOrder',
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder.addCase(getPaymentOrders.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getPaymentOrders.fulfilled, (state, action) => {
            state.paymentOrders = action.payload;
            state.loading = false;
        })
        builder.addCase(getPaymentOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    }
})

export default paymentOrderSlice.reducer;