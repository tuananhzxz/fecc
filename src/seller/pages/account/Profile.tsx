import React, { useEffect, useState, useRef } from 'react';
import {
  User,
  Edit
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  Grid,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import { useAppDispatch, useAppSelector } from '../../../state/Store';
import PersonalDetails from './PersionalDetails';
import BusinessDetails from './BussinessDetails';
import PickupAddress from './PickupAddress';
import BankDetails from './BankDetails';
import { fetchSellerProfile, updateSellerBanner } from '../../../state/seller/SellerSlice';
import { uploadToCloud } from '../../../utils/uploadToCloud';
import { bool } from 'yup';


const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.seller.profile);
  const [uploadImage, setUploadImage] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [openPersonal, setOpenPersonal] = useState(false);
  const [openBusiness, setOpenBusiness] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [openBank, setOpenBank] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('sellerToken');
    if (token) {
      dispatch(fetchSellerProfile(token))
        .then((response) => {
          console.log("Profile Response:", response);
        })
        .catch((error) => {
          console.error("Profile Error:", error);
        });
    }
  }, [dispatch]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        // Cập nhật banner trong store
        const token = localStorage.getItem('sellerToken');
        let flag = false;
        if (token) {
          dispatch(updateSellerBanner(uploadedUrl));
          flag = true;
        }
        setSnackbarMessage('Tải ảnh lên thành công!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        if(flag){
          window.location.reload();
        }
      } catch (error) {
        console.error('Upload error:', error);
        setSnackbarMessage('Lỗi khi tải ảnh lên!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error handling image:', error);
      setSnackbarMessage('Có lỗi xảy ra khi xử lý ảnh!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploadImage(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const renderEditDialog = (
    open: boolean,
    handleClose: () => void,
    EditComponent: React.ComponentType
  ) => (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <EditComponent />
      </DialogContent>
    </Dialog>
  );

  const renderProfileSection = (
    title: string,
    fields: { label: string; value: string | null | undefined }[],
    onEditClick: () => void
  ) => (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        p: 3,
        boxShadow: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6" color="text.primary">
          {title}
        </Typography>
        <Edit
          size={24}
          color="#007bff"
          style={{ cursor: 'pointer' }}
          onClick={onEditClick}
        />
      </Box>
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Typography variant="body2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body1" color="text.primary">
              {field.value || 'Chưa cập nhật'}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Profile Header */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: 200,
            background: 'linear-gradient(to right, #34D399, #06B6D4)'
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            px: 3,
            mt: -10
          }}
        >
          <Box
            onClick={handleImageClick}
            sx={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '4px solid white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'white',
              boxShadow: 3,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              hidden 
              accept="image/*" 
              onChange={handleChangeImage} 
            />
            <img 
              src={profile?.businessDetails?.banner || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png'} 
              alt="Banner" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
            {uploadImage && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'rgba(0,0,0,0.5)' 
                }}
              >
                <Typography variant="body2" color="white">Đang tải...</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" color="text.primary">
              {profile?.sellerName || 'Chưa cập nhật'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {profile?.pickupAddress?.city || 'Chưa cập nhật địa chỉ'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Profile Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Personal Information */}
        {renderProfileSection(
          "Thông tin cá nhân",
          [
            { label: "Họ tên", value: profile?.sellerName },
            { label: "Email", value: profile?.email },
            { label: "Số điện thoại", value: profile?.phone },
          ],
          () => setOpenPersonal(true)
        )}

        {/* Business Information */}
        {renderProfileSection(
          "Thông tin doanh nghiệp",
          [
            { label: "Tên doanh nghiệp", value: profile?.businessDetails?.businessName },
            { label: "Email doanh nghiệp", value: profile?.businessDetails?.businessEmail },
            { label: "Số điện thoại DN", value: profile?.businessDetails?.businessPhone },
            { label: "Mã số thuế", value: profile?.taxCode },
            { label: "Trạng thái", value: profile?.accountStatus }
          ],
          () => setOpenBusiness(true)
        )}

        {/* Address Information */}
        {renderProfileSection(
          "Địa chỉ",
          [
            { label: "Tên người nhận", value: profile?.pickupAddress?.name },
            { label: "Địa chỉ", value: profile?.pickupAddress?.locality },
            { label: "Thành phố", value: profile?.pickupAddress?.city },
            { label: "Tỉnh/Thành phố", value: profile?.pickupAddress?.state }
          ],
          () => setOpenAddress(true)
        )}

        {/* Bank Information */}
        {renderProfileSection(
          "Thông tin ngân hàng",
          [
            { label: "Thông tin ngân hàng", value: profile?.bankDetails?.accountNumber || 'Chưa cập nhật' },
            { label: "Chủ tài khoản", value: profile?.bankDetails?.accountHolderName || 'Chưa cập nhật' }
          ],
          () => setOpenBank(true)
        )}
      </Box>

      {/* Edit Dialogs */}
      {renderEditDialog(openPersonal, () => setOpenPersonal(false), PersonalDetails)}
      {renderEditDialog(openBusiness, () => setOpenBusiness(false), BusinessDetails)}
      {renderEditDialog(openAddress, () => setOpenAddress(false), PickupAddress)}
      {renderEditDialog(openBank, () => setOpenBank(false), BankDetails)}

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;