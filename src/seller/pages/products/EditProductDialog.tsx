import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { useAppDispatch } from '../../../state/Store';
import { updateProduct } from '../../../state/seller/SellerProduct';
import { ProductSeller } from '../../../types/ProductType';

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: ProductSeller | null;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({ 
  open, 
  onClose, 
  product 
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mrpPrice: '',
    sellingPrice: '',
    quantity: '',
    color: '',
    sizes: '',
    images: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        mrpPrice: product.mrpPrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || '',
        quantity: product.quantity?.toString() || '',
        color: product.color || '',
        sizes: product.sizes || '',
        images: product.images || []
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const updateRequest = {
        id: product.id,
        request: {
          ...formData,
          title: formData.title,
          description: formData.description,
          mrpPrice: parseFloat(formData.mrpPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          quantity: parseInt(formData.quantity)
        }
      };

      await dispatch(updateProduct(updateRequest)).unwrap();
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Tên sản phẩm"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Mô tả"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  name="mrpPrice"
                  label="Giá gốc"
                  type="number"
                  value={formData.mrpPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  name="sellingPrice"
                  label="Giá bán"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  name="quantity"
                  label="Số lượng"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  name="color"
                  label="Màu sắc"
                  value={formData.color}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  name="sizes"
                  label="Kích thước"
                  value={formData.sizes}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                />
              </Grid>
            </Grid>

            {error && (
              <Box sx={{ mt: 2, color: 'error.main' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProductDialog;