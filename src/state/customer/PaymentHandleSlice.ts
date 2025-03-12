import {PaymentOrder} from "../../types/PaymentOrder";
import {api} from "../../config/Api";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

export interface PaymentHandleState {
    payment : PaymentOrder | null;
    loading : boolean;
    error : string | null;
}

const initialState: PaymentHandleState = {
    payment : null,
    loading : false,
    error : null
};


export const handlePaymentSuccess = createAsyncThunk(
    'order/handlePaymentSuccess',
    async ({ paymentId, paymentLinkId }: { paymentId: string, paymentLinkId: string }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/payment/${paymentId}`, {
                params: { paymentLinkId },
                headers: {  'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error : any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const paymentHandleSlice = createSlice({
    name: 'paymentHandle',
    initialState,
    reducers: {
        resetPaymentState: (state) => {
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers : (builder) => {
        builder.addCase(handlePaymentSuccess.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(handlePaymentSuccess.fulfilled, (state, action) => {
            state.loading = false;
            state.payment = action.payload;
        });
        builder.addCase(handlePaymentSuccess.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

export const { resetPaymentState } = paymentHandleSlice.actions;
export default paymentHandleSlice.reducer;