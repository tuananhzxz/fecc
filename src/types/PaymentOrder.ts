import {User} from "./UserType";
import {Order} from "./orderType";
export interface PaymentOrder {
    id : number;
    amount : number;
    status : string;
    paymentMethod : PaymentMethod;
    paymentLinkId: string;
    user : User;
    orders : Order[];
}

export enum PaymentOrderStatus {
    PENDING,
    SUCCESS,
    FAILED
}

export enum PaymentMethod {
    RAZORPAY, STRIPE
}
