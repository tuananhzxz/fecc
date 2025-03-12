import React, { useState, useEffect } from 'react';
import { useFormik } from "formik";
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Stack,
  Container,
  FormHelperText,
  Chip,
  Checkbox,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete,
  Save,
  Cancel
} from '@mui/icons-material';
import { createProduct } from '../../../state/seller/SellerProduct';
import { useAppDispatch } from '../../../state/Store';
import { uploadToCloud } from '../../../utils/uploadToCloud';

// Constants
const categoryTwo: {[key: string]: string[]} = {
  Áo: ['Áo sơ mi', 'Áo thun', 'Áo khoác'],
  Đầm: ['Đầm dự tiệc', 'Đầm công sở', 'Đầm cocktail'],
  Váy: ['Váy dài', 'Váy ngắn', 'Váy cạp cao'],
  'Set đồ': ['Set đồ thể thao', 'Set đồ mùa hè', 'Set đồ mùa đông'],
};

const categoryThree: {[key: string]: string[]} = {
  Áo: ['Áo sơ mi nam', 'Áo sơ mi nữ', 'Áo sơ mi trắng', 'Áo sơ mi xanh'],
  Đầm: ['Đầm dự tiệc dài', 'Đầm dự tiệc ngắn', 'Đầm dự tiệc ôm', 'Đầm công sở ngắn', 'Đầm công sở dài', 'Đầm công sở suông', 'Đầm cocktail dài', 'Đầm cocktail ngắn', 'Đầm cocktail ôm'],
  Váy: ['Váy dài xòe', 'Váy dài ôm', 'Váy ngắn xòe', 'Váy ngắn ôm', 'Váy cạp cao xòe', 'Váy cạp cao ôm'],
  'Set đồ': ['Set đồ thể thao nam', 'Set đồ thể thao nữ', 'Set đồ mùa hè nhẹ', 'Set đồ mùa hè thoáng', 'Set đồ mùa đông ấm', 'Set đồ mùa đông dày'],
};

const colors = [
  'Đỏ', 'Xanh', 'Vàng', 'Đen', 'Trắng', 'Hồng', 'Tím', 'Xám', 'Nâu'
];

const sizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39', '40', '41', '42'
];

const mainCategories = ['Áo', 'Đầm', 'Váy', 'Set đồ'];

const validationSchema = Yup.object({
  title: Yup.string().required('Vui lòng nhập tên sản phẩm'),
  description: Yup.string().required('Vui lòng nhập mô tả sản phẩm'),
  mrpPrice: Yup.number().required('Vui lòng nhập giá niêm yết').positive('Giá phải lớn hơn 0'),
  sellingPrice: Yup.number().required('Vui lòng nhập giá bán')
    .positive('Giá phải lớn hơn 0')
    .max(Yup.ref('mrpPrice'), 'Giá bán không được cao hơn giá niêm yết'),
  quantity: Yup.number().required('Vui lòng nhập số lượng').integer('Số lượng phải là số nguyên').min(0, 'Số lượng không được âm'),
  category: Yup.string().required('Vui lòng chọn thể loại chính'),
  selectedColors: Yup.array().min(1, 'Vui lòng chọn ít nhất 1 màu sắc'),
  selectedSizes: Yup.array().min(1, 'Vui lòng chọn ít nhất 1 kích cỡ'),
  images: Yup.array().min(1, 'Vui lòng thêm ít nhất 1 ảnh')
});

interface FormValues {
  title: string;
  description: string;
  mrpPrice: string;
  sellingPrice: string;
  quantity: string;
  color: string;
  selectedColors: string[];
  images: string[];
  category: string;
  category2: string;
  category3: string;
  sizes: string;
  selectedSizes: string[];
}
const AddProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const [uploadImage, setUploadImage] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [selectedCategory2Options, setSelectedCategory2Options] = useState<string[]>([]);
  const [selectedCategory3Options, setSelectedCategory3Options] = useState<string[]>([]);

  const initialValues: FormValues = {
    title: "",
    description: "",
    mrpPrice: "",
    sellingPrice: "",
    quantity: "",
    color: "",
    selectedColors: [],
    images: [],
    category: "",
    category2: "",
    category3: "",
    sizes: "",
    selectedSizes: []
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const jwt = localStorage.getItem('sellerToken'); // Đổi từ 'jwt' thành 'sellerToken'
        if (!jwt) {
          throw new Error('Không tìm thấy token xác thực');
        }

        // Format dữ liệu theo CreateProductRequest
        const productData = {
          title: values.title,
          description: values.description,
          mrpPrice: parseInt(values.mrpPrice),
          sellingPrice: parseInt(values.sellingPrice),
          quantity: parseInt(values.quantity),
          color: values.selectedColors.join(','),
          images: values.images,
          category: values.category,
          category2: values.category2,
          category3: values.category3,
          sizes: values.selectedSizes.join(',')
        };

        // Dispatch action createProduct
        const result = await dispatch(createProduct({ 
          request: productData, 
          jwt 
        })).unwrap(); // Sử dụng unwrap() để xử lý lỗi tốt hơn

        // Xử lý kết quả thành công
        setSnackbarMessage('Sản phẩm đã được tạo thành công!');
        setSnackbarSeverity('success');
        formik.resetForm();
        
      } catch (error: any) {
        // Xử lý lỗi
        console.error('Error creating product:', error);
        setSnackbarMessage(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        setSnackbarSeverity('error');
      } finally {
        setSnackbarOpen(true);
      }
    },
});

  useEffect(() => {
    if (formik.values.category) {
      setSelectedCategory2Options(categoryTwo[formik.values.category] || []);
      setSelectedCategory3Options([]);
      formik.setFieldValue('category2', '');
      formik.setFieldValue('category3', '');
    }
  }, [formik.values.category]);

  useEffect(() => {
    if (formik.values.category && formik.values.category2) {
      setSelectedCategory3Options(categoryThree[formik.values.category] || []);
    }
  }, [formik.values.category2]);

  const handleColorChange = (event: SelectChangeEvent<string[]>) => {
    const values = event.target.value as string[];
    formik.setFieldValue('selectedColors', values);
    formik.setFieldValue('color', values.join(','));
  };

  const handleSizeChange = (event: SelectChangeEvent<string[]>) => {
    const values = event.target.value as string[];
    formik.setFieldValue('selectedSizes', values);
    formik.setFieldValue('sizes', values.join(','));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      
      // Kiểm tra kích thước file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbarMessage('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        setSnackbarMessage('Vui lòng chọn file ảnh');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      setUploadImage(true);
      
      try {
        const uploadedUrl = await uploadToCloud(file);
        
        if (!uploadedUrl || typeof uploadedUrl !== 'string') {
          throw new Error('Invalid upload response');
        }

        formik.setFieldValue('images', [...formik.values.images, uploadedUrl]);
        
        setSnackbarMessage('Tải ảnh lên thành công!');
        setSnackbarSeverity('success');
      } catch (error) {
        console.error('Upload error:', error);
        setSnackbarMessage('Lỗi khi tải ảnh lên!');
        setSnackbarSeverity('error');
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error handling image:', error);
      setSnackbarMessage('Có lỗi xảy ra khi xử lý ảnh!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploadImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formik.values.images];
    newImages.splice(index, 1);
    formik.setFieldValue('images', newImages);
  };

  const ImagePreview = () => (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Hình ảnh sản phẩm
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<AddPhotoAlternate />}
          disabled={uploadImage}
        >
          Thêm ảnh
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handleImageChange}
          />
        </Button>
        {uploadImage && <CircularProgress size={24} />}
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {formik.values.images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={image}
                alt={`Product ${index + 1}`}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <IconButton
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      {formik.values.images.length > 0 && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Số lượng ảnh: {formik.values.images.length}
        </Typography>
      )}
      
      {formik.touched.images && formik.errors.images && (
        <FormHelperText error>{formik.errors.images}</FormHelperText>
      )}
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Thêm sản phẩm mới
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên sản phẩm"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    name="description"
                    multiline
                    rows={4}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá niêm yết"
                    name="mrpPrice"
                    type="number"
                    value={formik.values.mrpPrice}
                    onChange={formik.handleChange}
                    error={formik.touched.mrpPrice && Boolean(formik.errors.mrpPrice)}
                    helperText={formik.touched.mrpPrice && formik.errors.mrpPrice}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá bán"
                    name="sellingPrice"
                    type="number"
                    value={formik.values.sellingPrice}
                    onChange={formik.handleChange}
                    error={formik.touched.sellingPrice && Boolean(formik.errors.sellingPrice)}
                    helperText={formik.touched.sellingPrice && formik.errors.sellingPrice}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số lượng"
                    name="quantity"
                    type="number"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={formik.touched.quantity && formik.errors.quantity}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    <InputLabel>Thể loại chính</InputLabel>
                    <Select
                      value={formik.values.category}
                      label="Thể loại chính"
                      name="category"
                      onChange={formik.handleChange}
                    >
                      {mainCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <FormHelperText>{formik.errors.category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    disabled={!formik.values.category}
                  >
                    <InputLabel>Thể loại phụ 1</InputLabel>
                    <Select
                      value={formik.values.category2}
                      label="Thể loại phụ 1"
                      name="category2"
                      onChange={formik.handleChange}
                    >
                      {selectedCategory2Options.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    disabled={!formik.values.category2}
                  >
                    <InputLabel>Thể loại phụ 2</InputLabel>
                    <Select
                      value={formik.values.category3}
                      label="Thể loại phụ 2"
                      name="category3"
                      onChange={formik.handleChange}
                    >
                      {selectedCategory3Options.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.selectedColors && Boolean(formik.errors.selectedColors)}
              >
                <InputLabel>Màu sắc</InputLabel>
                <Select
                  multiple
                  value={formik.values.selectedColors}
                  label="Màu sắc"
                  onChange={handleColorChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {colors.map((color) => (
                    <MenuItem key={color} value={color}>
                      <Checkbox checked={formik.values.selectedColors.indexOf(color) > -1} />
                      <ListItemText primary={color} />
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.selectedColors && formik.errors.selectedColors && (
                  <FormHelperText>{formik.errors.selectedColors as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Kích cỡ - Multiple Select */}
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.selectedSizes && Boolean(formik.errors.selectedSizes)}
              >
                <InputLabel>Kích cỡ</InputLabel>
                <Select
                  multiple
                  value={formik.values.selectedSizes}
                  label="Kích cỡ"
                  onChange={handleSizeChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      <Checkbox checked={formik.values.selectedSizes.indexOf(size) > -1} />
                      <ListItemText primary={size} />
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.selectedSizes && formik.errors.selectedSizes && (
                  <FormHelperText>{formik.errors.selectedSizes as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
                <Grid item xs={12}>
                  <ImagePreview />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        formik.resetForm();
                        setSelectedCategory2Options([]);
                        setSelectedCategory3Options([]);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                    >
                      Lưu sản phẩm
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddProduct;