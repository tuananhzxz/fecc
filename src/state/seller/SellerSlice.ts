import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../config/Api";
import { ProfileSeller } from "../../types/ProfileSeller";

interface SellerState {
  profile: ProfileSeller | null;
  loading: boolean;
  error: string | null;
}

// Create thunk
export const fetchSellerProfile = createAsyncThunk(
  "seller/fetchProfile",
  async (jwt: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/seller/profile', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data || 'Error fetching profile');
    }
  }
);

export const updateSellerBanner = createAsyncThunk(
  "seller/updateBanner",
  async (banner: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('sellerToken');
      const response = await api.post('/api/seller/update/banner', 
        { banner }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data || 'Error updating banner');
    }
  }
);

export const fetchSellerByProductId = createAsyncThunk(
  "seller/fetchSellerByProductId",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/seller/seller-by-product/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data || 'Error fetching seller by product ID');
    }
  }
);

export const getSellerById = createAsyncThunk(
  "seller/getSellerById",
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/seller/${sellerId}`);
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data || 'Error fetching seller by ID');
    }
  }
);

const initialState: SellerState = {
  profile: null,
  loading: false,
  error: null
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchSellerProfile.rejected, (state, action) => {
        console.log("Rejected error:", action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateSellerBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateSellerBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update banner';
      })
      .addCase(fetchSellerByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerByProductId.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchSellerByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch seller by product ID';
      }) 
      .addCase(getSellerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellerById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getSellerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch seller by ID';
      });
  }
});

export const { clearProfile } = sellerSlice.actions;
export default sellerSlice.reducer;