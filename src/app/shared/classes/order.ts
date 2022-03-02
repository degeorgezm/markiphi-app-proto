import { Product } from './product';

// Order
export interface DefaultOrder {
    shippingDetails?: any;
    product?: Product;
    orderId?: any;
    totalAmount?: any;
}