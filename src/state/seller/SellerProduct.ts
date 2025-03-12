import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../config/Api';
import { ProductSeller } from '../../types/ProductType';


export const fetchSellerProducts = createAsyncThunk<ProductSeller[], any> (
    "seller/fetchProducts",
    async(jwt, {rejectWithValue}) => {
        try {
            const response = await api.get('/api/seller/product', {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            })
            const data = response.data;
            console.log(data);
            return data;
        } catch (error: any) {
            return rejectWithValue({
                success: false,
                message: error.message || 'Failed to fetch products'
            });
        }
    }
)

interface CreateProductRequest {
    title: string;
    description: string;
    mrpPrice: number;
    sellingPrice: number;
    quantity: number;
    color: string;
    images: string[];
    category?: string;
    category2?: string | null;
    category3?: string | null;
    sizes: string;
  }
  
  interface CreateProductArg {
    request: CreateProductRequest;
    jwt: string;
  }
  
  export const createProduct = createAsyncThunk<ProductSeller, CreateProductArg>(
    "seller/createProduct",
    async ({ request, jwt }, { rejectWithValue }) => {
      try {
        const response = await api.post('/api/seller/product', request, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        });
        
        return response.data;
      } catch (error: any) {
        // Handle API error
        const errorMessage = error.response?.data?.message || 'Không thể tạo sản phẩm';
        return rejectWithValue({
          success: false,
          message: errorMessage
        });
      }
    }
  );

  export const deleteProduct = createAsyncThunk<void, {id: number}>(
    "seller/deleteProduct",
    async ({id}, {rejectWithValue}) => {
      try {
        await api.delete(`/api/seller/product/${id}`);
      } catch (error: any) {
        return rejectWithValue({
          success: false,
          message: error.response?.data?.message || 'Failed to delete product'
        });
      }
    }
  )

  export const updateProduct = createAsyncThunk<ProductSeller, {id: number, request: CreateProductRequest}>(
    "seller/updateProduct",
    async ({id, request}, {rejectWithValue}) => {
      try {
        const response = await api.put(`/api/seller/product/${id}`, request,);
        return response.data;
      } catch (error: any) {
        return rejectWithValue({
          success: false,
          message: error.response?.data?.message || 'Failed to update product'
        });
      }
    }
  )

interface SellerProductState {
    products : ProductSeller[];
    loading : boolean;
    error : string | null | undefined;
}

const initialState : SellerProductState = {
    products: [],
    loading: false,
    error: null,
}

const sellerProductSlice = createSlice({
    name: "sellerProducts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
           .addCase(fetchSellerProducts.pending, (state) => {
                state.loading = true;
            })
           .addCase(fetchSellerProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
           .addCase(fetchSellerProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createProduct.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter((product) => product.id !== action.meta.arg.id);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex((product) => product.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export default sellerProductSlice.reducer;