import React, {useEffect, useState} from 'react';
import {Box, Button, Modal} from "@mui/material";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import {CreditCard, DollarSign} from "lucide-react";
import { useAppDispatch } from '../../../state/Store';
import { useLocation } from 'react-router-dom';
import { createOrder } from '../../../state/customer/OrderSlice';
import { Address } from '../../../types/UserType';
import { getUserProfile } from '../../../state/customer/AuthSliceCus';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    borderRadius: 2
};
const Checkout = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const handleClose = () => setOpen(false);

    const [selectedMethod, setSelectedMethod] = useState('');

    useEffect(() => {
        dispatch(getUserProfile(localStorage.getItem('token') || '')).then((user : any) => {
            setAddresses(user.payload.addresses);
        });
    }, [location, dispatch]);

    const handleConfirmPayment = () => {
        if (!selectedMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }
        dispatch(createOrder({
            shippingAddress : selectedAddress || addresses[0],
            paymentMethod: selectedMethod
        })).then((res : any) => {
            toast.success('Đơn hàng đã được tạo thành công');
            if (res.payload?.payment_link_url) {
                window.location.href = res.payload.payment_link_url;
            }
            setOpen(false);
        }).catch((err : any) => {
            toast.error(err.payload.message);
        });
    };

    const paymentMethods = [
        {
            id: 'RAZORPAY',
            icon: <CreditCard className="w-5 h-5" />,
            name: 'Razorpay',
            value: "RAZORPAY",
            description: 'Thanh toán an toàn qua Razorpay'
        },
        {
            id: 'STRIPE',
            icon: <DollarSign className="w-5 h-5" />,
            name: 'Stripe',
            value: "STRIPE",
            description: 'Giải pháp thanh toán toàn cầu'
        }
    ];

    return (
        <>
            <div className={`pt-10 px-5.sm:px-10 md:px-44 lg:px-60 min-h-screen`}>
                <div className={`space-y-5 lg:space-y-0 lg:grid grid-cols-3 lg:gap-9`}>
                    <div className={`col-span-2 space-y-5`}>
                        <div className={`flex justify-between items-center`}>
                            <h1 className={`font-semibold`}>Chọn địa chỉ</h1>
                            <Button onClick={handleOpen}>
                                Thêm địa chỉ mới
                            </Button>
                        </div>

                        <div className={`text-xs font-medium space-y-5`}>
                            <p>Địa chỉ đã lưu</p>
                            <div className="space-y-5">
                            {addresses && addresses.length > 0 ? (
                                addresses.map((address, index) => (
                                    <AddressCard
                                        key={index}
                                        address={address}
                                        isSelected={selectedAddress?.id === address.id}
                                        onSelect={setSelectedAddress}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500">Không có địa chỉ nào được lưu</p>
                            )}
                        </div>
                        </div>

                        <div className={`py-4 px-5 rounded-md border`}>
                            <Button onClick={handleOpen}>
                                Thêm địa chỉ mới
                            </Button>
                        </div>
                    </div>

                    <div className="w-[380px] space-y-5 pt-[3.5rem]">
                        <h3 className="text-sm font-medium text-gray-600">Chọn phương thức thanh toán</h3>

                        <div className={`bg-white p-4 rounded-lg shadow`}>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`
                                  flex items-center justify-between p-3 border rounded-lg cursor-pointer
                                  transition-all duration-300
                                  ${selectedMethod === method.id
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-300'}
            `                       }
                                    onClick={() => setSelectedMethod(method.id)}
                                    >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`
                                      w-10 h-10 rounded-full flex items-center justify-center
                                      ${selectedMethod === method.id
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-100 text-gray-600'}
                                    `}
                                        >
                                            {method.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm">{method.name}</h3>
                                            <p className="text-xs text-gray-500">{method.description}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={selectedMethod === method.id}
                                        onChange={() => setSelectedMethod(method.id)}
                                        className="form-radio text-blue-600"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* <PricingCard/> */}

                        <div className="pt-2 border-t">
                        <button
                            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            onClick={handleConfirmPayment}
                        >
                            Xác nhận thanh toán
                        </button>
                        </div>
                        </div>
                    </div>

                </div>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <AddressForm onClose={handleClose} paymentMethod={selectedMethod === 'RAZORPAY' ? 'RAZORPAY' : 'STRIPE'}/>
                </Box>
            </Modal>
        </>
    );
}

export default Checkout;