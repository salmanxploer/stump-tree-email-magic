export type UserRole = 'admin' | 'staff' | 'student';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'mobile';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: Array<{
    foodId: string;
    foodName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DailySales {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface PopularItem {
  foodId: string;
  foodName: string;
  orderCount: number;
  revenue: number;
}
