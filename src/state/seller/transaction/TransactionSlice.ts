import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Transaction } from "../../../types/TransactionType";
import { api } from "../../../config/Api";

interface TransactionState {
    transactions : Transaction[];
    loading : boolean;
    error : string | null;
}

const initialState : TransactionState = {
    transactions : [],
    loading : false,
    error : null
}

export const getTransactionsBySellerId = createAsyncThunk(
    'transaction/getTransactionsBySellerId',
    async (_, {rejectWithValue}) => {
        try {
            const jwt = localStorage.getItem('sellerToken');
            const response = await api.get(`/api/transaction/seller`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Error fetching transactions');
        }
    }
)

export const getAllTransactions = createAsyncThunk(
    'transaction/getAllTransactions',
    async (_, {rejectWithValue}) => {
        try {
            const response = await api.get(`/api/transaction`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Error fetching transactions');
        }
    }
)

const transactionSlice = createSlice({
    name : 'transaction',
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder.addCase(getTransactionsBySellerId.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getTransactionsBySellerId.fulfilled, (state, action) => {
            state.transactions = action.payload;
            state.loading = false;
        })
        builder.addCase(getTransactionsBySellerId.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    }
})

export default transactionSlice.reducer;