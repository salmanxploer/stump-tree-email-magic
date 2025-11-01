import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FoodItem, Order, CartItem, Notification } from '@/types';
import { defaultFoodItems, generateMockOrders } from '@/data/mockData';
import toast from 'react-hot-toast';

interface DataContextType {
  // Food Items
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFoodItem: (id: string, item: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (foodItem: FoodItem, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Notifications
  notifications: Notification[];
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: (userId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize data from localStorage
  useEffect(() => {
    const storedFoods = localStorage.getItem('bubt-foods');
    if (storedFoods) {
      setFoodItems(JSON.parse(storedFoods));
    } else {
      setFoodItems(defaultFoodItems);
      localStorage.setItem('bubt-foods', JSON.stringify(defaultFoodItems));
    }

    const storedOrders = localStorage.getItem('bubt-orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      const mockOrders = generateMockOrders(15);
      setOrders(mockOrders);
      localStorage.setItem('bubt-orders', JSON.stringify(mockOrders));
    }

    const storedCart = localStorage.getItem('bubt-cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    const storedNotifications = localStorage.getItem('bubt-notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Food Item Management
  const addFoodItem = (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `food-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...foodItems, newItem];
    setFoodItems(updated);
    localStorage.setItem('bubt-foods', JSON.stringify(updated));
    toast.success('Food item added successfully');
  };

  const updateFoodItem = (id: string, item: Partial<FoodItem>) => {
    const updated = foodItems.map(f =>
      f.id === id ? { ...f, ...item, updatedAt: new Date().toISOString() } : f
    );
    setFoodItems(updated);
    localStorage.setItem('bubt-foods', JSON.stringify(updated));
    toast.success('Food item updated successfully');
  };

  const deleteFoodItem = (id: string) => {
    const updated = foodItems.filter(f => f.id !== id);
    setFoodItems(updated);
    localStorage.setItem('bubt-foods', JSON.stringify(updated));
    toast.success('Food item deleted successfully');
  };

  // Order Management
  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('bubt-orders', JSON.stringify(updated));
    toast.success('Order placed successfully');
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    setOrders(updated);
    localStorage.setItem('bubt-orders', JSON.stringify(updated));
    
    // Create notification for the customer
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const statusMessages: Record<Order['status'], string> = {
        pending: 'Your order has been received',
        preparing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup!',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled',
      };
      addNotification(order.customerId, statusMessages[status], 'info');
    }
    
    toast.success(`Order status updated to ${status}`);
  };

  // Cart Management
  const addToCart = (foodItem: FoodItem, quantity: number) => {
    const existingItem = cart.find(item => item.foodItem.id === foodItem.id);
    let updated: CartItem[];
    
    if (existingItem) {
      updated = cart.map(item =>
        item.foodItem.id === foodItem.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updated = [...cart, { foodItem, quantity }];
    }
    
    setCart(updated);
    localStorage.setItem('bubt-cart', JSON.stringify(updated));
    toast.success('Added to cart');
  };

  const removeFromCart = (foodId: string) => {
    const updated = cart.filter(item => item.foodItem.id !== foodId);
    setCart(updated);
    localStorage.setItem('bubt-cart', JSON.stringify(updated));
    toast.success('Removed from cart');
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    
    const updated = cart.map(item =>
      item.foodItem.id === foodId ? { ...item, quantity } : item
    );
    setCart(updated);
    localStorage.setItem('bubt-cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('bubt-cart');
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.foodItem.price * item.quantity,
    0
  );

  // Notification Management
  const addNotification = (userId: string, message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [notification, ...notifications];
    setNotifications(updated);
    localStorage.setItem('bubt-notifications', JSON.stringify(updated));
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('bubt-notifications', JSON.stringify(updated));
  };

  const clearNotifications = (userId: string) => {
    const updated = notifications.filter(n => n.userId !== userId);
    setNotifications(updated);
    localStorage.setItem('bubt-notifications', JSON.stringify(updated));
  };

  return (
    <DataContext.Provider
      value={{
        foodItems,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        orders,
        addOrder,
        updateOrderStatus,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        notifications,
        addNotification,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
