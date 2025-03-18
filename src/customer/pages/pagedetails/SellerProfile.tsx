import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import { getSellerById } from '../../../state/seller/SellerSlice';
import { 
  CircularProgress, Grid, Card, CardMedia, CardContent, 
  Typography, Container, Box, Rating, Chip, 
  Avatar, Tab, Tabs, IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { api } from '../../../config/Api';
import { Product } from '../../../state/customer/ProductCustomerSlice';
import { toast } from 'react-toastify';
import { addToWishlist } from '../../../state/wishlist/WishListSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SellerProfile: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector(state => state.seller);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (sellerId) {
      dispatch(getSellerById(Number(sellerId)));
    }
  }, [dispatch, sellerId]);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!sellerId) return;
      
      try {
        setProductsLoading(true);
        const response = await api.get(`/api/seller/product/${sellerId}`);
        setProducts(response.data);
        setProductsError(null);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm của người bán:', error);
        setProductsError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  const handleAddToWishlist = async (productId : number) => {
    try {
      await dispatch(addToWishlist(productId || 0)).unwrap();
      toast.success('Đã thêm vào danh sách yêu thích!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Không thể thêm vào danh sách yêu thích!', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error">
          {error || 'Không tìm thấy thông tin người bán'}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          borderRadius: '16px',
          overflow: 'hidden',
          mb: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <CardMedia
          component="img"
          image={profile.businessDetails?.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'}
          alt="Ảnh bìa cửa hàng"
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            filter: 'brightness(0.85)',
          }}
        />
        
        {/* Overlay with gradient */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)',
            height: '70%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: { xs: 3, md: 5 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
            <Avatar
              src={profile.businessDetails?.banner || 'https://via.placeholder.com/100x100?text=Logo'}
              alt="Logo cửa hàng"
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                border: '4px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                mr: 3,
              }}
            />
            <Box sx={{ color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {profile.sellerName}
                </Typography>
                <VerifiedIcon color="primary" sx={{ ml: 1 }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={<StorefrontIcon />}
                  label={profile.businessDetails?.businessName || 'Cửa hàng'}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' } 
                  }}
                />
                <Chip
                  icon={<LocationOnIcon />}
                  label={profile.businessDetails?.businessAddress?.split(',').pop()?.trim() || 'Hà Nội'}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' } 
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Action buttons */}
        {/* <Box 
          sx={{ 
            position: 'absolute', 
            top: { xs: 16, md: 24 }, 
            right: { xs: 16, md: 24 },
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}>
            <FavoriteIcon />
          </IconButton>
          <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}>
            <ShareIcon />
          </IconButton>
        </Box> */}
      </Box>

      {/* Content Tabs */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        mb: 4,
        overflow: 'hidden'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
              py: 2,
            },
            '& .Mui-selected': {
              color: 'primary.main',
            },
          }}
        >
          <Tab label="Sản Phẩm" />
          <Tab label="Thông Tin Cửa Hàng" />
        </Tabs>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
            {/* Product filter and view options */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="h6" component="h2" fontWeight="bold">
                {products.length} Sản phẩm
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                
                <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewModeChange('grid')}
                    sx={{ 
                      borderRadius: '8px 0 0 8px',
                      bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                      color: viewMode === 'grid' ? 'primary.light' : 'inherit',
                    }}
                  >
                    <GridViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewModeChange('list')}
                    sx={{ 
                      borderRadius: '0 8px 8px 0',
                      bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                      color: viewMode === 'list' ? 'primary.light' : 'inherit',
                    }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Products display */}
            {productsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : productsError ? (
              <Typography color="error" align="center" py={4}>
                {productsError}
              </Typography>
            ) : products.length === 0 ? (
              <Box 
                sx={{ 
                  py: 8, 
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: '12px',
                }}
              >
                <StorefrontIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Người bán chưa có sản phẩm nào.
                </Typography>
              </Box>
            ) : viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
                        }
                      }}
                    >
                      <Link to={`/product-details/${product.category.categoryId}/${product.title}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Box sx={{ position: 'relative', pt: '100%' }}>
                          <CardMedia
                            component="img"
                            image={product.images[0] || 'https://via.placeholder.com/300'}
                            alt={product.title}
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {product.discountPercent > 0 && (
                            <Chip
                              label={`-${product.discountPercent}%`}
                              color="error"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                fontWeight: 'bold',
                                borderRadius: '4px'
                              }}
                            />
                          )}
                          <IconButton
                            onClick={() => handleAddToWishlist(product.id)}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              bgcolor: 'rgba(255,255,255,0.8)',
                              '&:hover': { bgcolor: 'white', color: 'error.main' }
                            }}
                          >
                            <FavoriteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography gutterBottom variant="subtitle1" component="h3" noWrap fontWeight="medium">
                            {product.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={product.reviews.length} readOnly precision={0.5} size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({product.reviews.length })
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h6" color="error" fontWeight="bold">
                              {product.sellingPrice.toLocaleString()}đ
                            </Typography>
                            {product.discountPercent > 0 && (
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                {product.mrpPrice.toLocaleString()}đ
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Link>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {products.map((product) => (
                  <Card 
                    key={product.id}
                    sx={{ 
                      display: 'flex',
                      transition: 'all 0.3s ease',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Link to={`/product-details/${product.category.categoryId}/${product.title}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
                      <CardMedia
                        component="img"
                        image={product.images[0] || 'https://via.placeholder.com/300'}
                        alt={product.title}
                        sx={{ 
                          width: { xs: 120, sm: 160 },
                          height: { xs: 120, sm: 160 },
                          objectFit: 'cover'
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, width: '100%' }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                          {product.description || 'Mô tả sản phẩm không có sẵn'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={product.reviews.length} readOnly precision={0.5} size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({product.reviews.length })
                          </Typography>
                        </Box>
                        <Box sx={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h6" color="error" fontWeight="bold">
                              {product.sellingPrice.toLocaleString()}đ
                            </Typography>
                            {product.discountPercent > 0 && (
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                {product.mrpPrice.toLocaleString()}đ
                              </Typography>
                            )}
                          </Box>
                          {product.discountPercent > 0 && (
                            <Chip
                              label={`-${product.discountPercent}%`}
                              color="error"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Link>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Store Info Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <Card sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  {profile.businessDetails?.businessAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <LocationOnIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Địa chỉ
                        </Typography>
                        <Typography variant="body2">
                          {profile.businessDetails.businessAddress}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {profile.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <PhoneIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body2">
                          {profile.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {profile.email && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <EmailIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Email
                        </Typography>
                        <Typography variant="body2">
                          {profile.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Giới thiệu
                </Typography>
                <Card sx={{ 
                  p: 3, 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <Typography variant="body1" paragraph>
                    Trên trời có triệu vì sao. Gặp nhau buổi sáng phải chiều mới vui. Ai ơi nhìn thấy em rồi. Chúc nhau buổi sáng, vui may cả nhà.
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Thông tin bổ sung:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label="Thành lập 2025" size="small" />
                      <Chip label="Giao hàng nhanh" size="small" />
                      <Chip label="Hỗ trợ 24/7" size="small" />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default SellerProfile;