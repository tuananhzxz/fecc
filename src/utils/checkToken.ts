import { jwtDecode } from "jwt-decode";

export const checkTokenExpire = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('sellerToken') || '';
    if(token){
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Kiểm tra xem token đã hết hạn hay chưa
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
        } else {
            const tokenAge = currentTime - decoded.iat; // iat là thời gian tạo token
            const twentyFourHours = 24 * 60 * 60; // 24 giờ tính bằng giây

            if (tokenAge > twentyFourHours) {
                    localStorage.removeItem('token');
                }
            }
    }
};