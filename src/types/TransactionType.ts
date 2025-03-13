import { Order } from "./orderType";
import { ProfileSeller } from "./ProfileSeller";
import { User } from "./UserType";

export interface Transaction {
    id: number;
    customer: User;
    order : Order;
    seller : ProfileSeller;
    date : Date;
}
