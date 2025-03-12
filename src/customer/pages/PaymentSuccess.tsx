import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../state/Store';
import { handlePaymentSuccess } from "../../state/customer/PaymentHandleSlice";
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        // Get payment parameters from URL
        const searchParams = new URLSearchParams(location.search);
        let paymentId = '';
        let paymentLinkId = '';
        searchParams.forEach((value, key) => {
            if (key === 'razorpay_payment_id') {
                paymentId = value;
            }
            if (key === 'razorpay_payment_link_id') {
                paymentLinkId = value;
            }
        });
        
        // If parameters exist, handle payment
        if (paymentId && paymentLinkId) {
            dispatch(handlePaymentSuccess({ paymentId, paymentLinkId }))
                .then((res) => {
                    if (res.type.includes('fulfilled')) {
                        toast.success('Thanh toán thành công!');
                    } else {
                        toast.error('Có lỗi xảy ra khi xử lý thanh toán');
                    }
                });
        } else {
            toast.error('Thông tin thanh toán không hợp lệ');
        }
    }, [location, dispatch]);
    
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-green-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Thanh toán thành công</h2>
                <p className="text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.</p>
                <button onClick={() => navigate('/account/order')} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors">
                    Xem đơn hàng của tôi
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;