import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Link
} from "@mui/material";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import StyledTextField from "./StyledTextField";
import { useAppDispatch } from '../../../state/Store';
import { loginSeller, sendLoginSignupOtp, verifySellerOtp } from '../../../state/seller/AuthSlice';
import { useNavigate } from 'react-router-dom';

const SellerLoginForm: React.FC = () => {
  // Định nghĩa các stage của form login
  const [loginStage, setLoginStage] = useState<'EMAIL' | 'OTP' | 'LOGIN'>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  // Thêm state cho việc đếm ngược gửi lại OTP
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const dispatch = useAppDispatch();

  // Validation Schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email không được để trống'),
    otp: loginStage === 'OTP' 
      ? Yup.string()
          .required('Vui lòng nhập mã OTP')
          .min(6, 'OTP phải có 6 ký tự')
          .max(6, 'OTP phải có 6 ký tự')
      : Yup.string()
  });

  // Effect để quản lý đếm ngược gửi lại OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCountdown]);

  // Hàm gửi lại OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const otpResponse = await dispatch(sendLoginSignupOtp({ 
        email: userEmail 
      })).unwrap();
      
      if (otpResponse.success) {
        // Reset countdown sau khi gửi lại OTP
        setResendCountdown(30);
        setErrorMessage('');
      } else {
        setErrorMessage(otpResponse.message || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      setErrorMessage('Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Formik Configuration
  const formik = useFormik({
    initialValues: {
      email: '',
      otp: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        switch(loginStage) {
          case 'EMAIL':
            // Gửi OTP
            const otpResponse = await dispatch(sendLoginSignupOtp({ 
              email: values.email 
            })).unwrap();
            
            if (otpResponse.success) {
              setUserEmail(values.email);
              setLoginStage('OTP');
              // Đặt countdown khi gửi OTP lần đầu
              setResendCountdown(60);
            } else {
              setErrorMessage(otpResponse.message || 'Không thể gửi OTP');
            }
            break;

          case 'OTP':
            const verifyResponse = await dispatch(verifySellerOtp({
            email: userEmail,
            otp: values.otp
            })).unwrap();

            if (verifyResponse.success) {
            // Chuyển sang stage login cuối cùng
            setLoginStage('LOGIN');
            } else {
            setErrorMessage(verifyResponse.message || 'Xác thực OTP thất bại');
            }
            break;

          case 'LOGIN':
            // Xử lý đăng nhập cuối cùng
            const loginResponse = await dispatch(loginSeller({
                email: userEmail,
                otp: values.otp
              })).unwrap();
  
              if (loginResponse.success) {
                // Xử lý đăng nhập thành công
                navigate('/seller');
              } else {
                setErrorMessage(loginResponse.message || 'Đăng nhập thất bại');
              }
              break;
        }
      } catch (error) {
        setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Render nút và tiêu đề theo từng stage
  const renderButtonContent = () => {
    switch(loginStage) {
      case 'EMAIL':
        return isLoading ? 'Đang gửi OTP...' : 'Tiếp tục';
      case 'OTP':
        return isLoading ? 'Đang xác thực...' : 'Xác nhận';
      case 'LOGIN':
        return isLoading ? 'Đang đăng nhập...' : 'Đăng nhập';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'transparent',
        p: 3,
        borderRadius: 4,
        maxWidth: 400,
        margin: 'auto'
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Email Input */}
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Email"
              variant="outlined"
              {...formik.getFieldProps('email')}
              disabled={loginStage !== 'EMAIL'}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          {/* OTP Input */}
          {(loginStage === 'OTP' || loginStage === 'LOGIN') && (
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="OTP"
                variant="outlined"
                {...formik.getFieldProps('otp')}
                error={formik.touched.otp && Boolean(formik.errors.otp)}
                helperText={formik.touched.otp && formik.errors.otp}
                autoFocus
              />
              
              {/* Phần thông báo nhận lại OTP */}
              {loginStage === 'OTP' && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {resendCountdown > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Bạn có thể nhận lại OTP sau {resendCountdown} giây
                    </Typography>
                  ) : (
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      Bạn chưa nhận được OTP? Nhận lại
                    </Link>
                  )}
                </Typography>
              )}
            </Grid>
          )}

          {/* Nút submit động */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ mr: 1 }} />
              ) : null}
              {renderButtonContent()}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SellerLoginForm;