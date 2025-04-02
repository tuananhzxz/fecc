import { Product } from "../state/customer/ProductCustomerSlice";
import { Address, User } from "./UserType";

export type PaymentStatusMethod =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface OrderState {
  orders: Order[];
  orderItem: OrderItem | null;
  currentOrder: Order | null;
  paymentOrder: any | null;
  loading: boolean;
  error: string | null;
  orderCanceled: boolean;
  paymentSuccess: boolean;
}

export interface Order {
  id: number;
  orderId: string;
  user: User;
  sellerId: number;
  orderItems: OrderItem[];
  orderDate: string;
  shippingAddress: Address;
  paymentDetails: any;
  paymentStatus: PaymentStatusMethod;
  totalMrpPrice: number;
  totalSellingPrice?: number;
  discount?: number;
  orderStatus: OrderStatus;
  totalItem: number;
  deliveryDate: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  id: number;
  order: Order;
  product: Product;
  size: string;
  quantity: number;
  mrpPrice: number;
  sellingPrice: number;
  userId: number;
}
