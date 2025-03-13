import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SellerReport } from "../../../types/ProfileSeller";
import { api } from "../../../config/Api";

export interface SellerReportState {
    reports : SellerReport | null;
    loading : boolean;
    error : string | null;
}

const initialState : SellerReportState = {
    reports : null,
    loading : false,
    error : null
}

export const getSellerReport = createAsyncThunk(
    'sellerReport/getSellerReport',
    async (_, {rejectWithValue}) => {
        try {
            const jwt = localStorage.getItem('sellerToken');
            const response = await api.get('/api/seller/report', {
                headers : {
                    'Authorization' : `Bearer ${jwt}`
                }
            });
            return response.data;
        } catch (error : any) {
            return rejectWithValue(error.response?.data || 'Error fetching seller report');
        }
    }
)

const sellerReportSlice = createSlice({
    name : 'sellerReport',
    initialState,
    reducers : {},
    extraReducers : (builder) => {
        builder.addCase(getSellerReport.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getSellerReport.fulfilled, (state, action) => {
            state.reports = action.payload;
            state.loading = false;
        })
        builder.addCase(getSellerReport.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })  
    }
})

export default sellerReportSlice.reducer;