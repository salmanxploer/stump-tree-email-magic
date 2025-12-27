import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { FoodItem, Order, CartItem, Notification } from '@/types';
import { defaultFoodItems } from '@/data/mockData';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const HAS_BACKEND = Boolean(API_BASE_URL && API_BASE_URL !== 'http://localhost:4000');
const FOOD_CACHE_KEY = 'bubt-menu-cache';
const ORDER_CACHE_KEY = 'bubt-orders-cache';
const CART_STORAGE_KEY = 'bubt-cart';
const NOTIFICATION_STORAGE_KEY = 'bubt-notifications';

interface DataContextType {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFoodItem: (id: string, item: Partial<FoodItem>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  cart: CartItem[];
  addToCart: (foodItem: FoodItem, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  notifications: Notification[];
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: (userId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authToken } = useAuth();

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    try {
      const cached = localStorage.getItem(FOOD_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as FoodItem[];
      }
    } catch {
      // Ignore parse errors
    }
    return defaultFoodItems;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem(ORDER_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as Order[];
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem(CART_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as CartItem[];
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const cached = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as Notification[];
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const fetchFromApi = useCallback(
    async <T,>(
      path: string,
      options: {
        method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
        body?: unknown;
        requireAuth?: boolean;
      } = {}
    ): Promise<T> => {
      // If no backend is configured, throw error to trigger fallback to mock data
      if (!HAS_BACKEND) {
        throw new Error('Backend not configured - using local data');
      }

      const { method = 'GET', body, requireAuth = false } = options;
      const headers: Record<string, string> = {};

      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }

      const needsAuth = requireAuth;
      if (needsAuth) {
        if (!authToken) {
          throw new Error('Authentication required');
        }
        headers.Authorization = `Bearer ${authToken}`;
      } else if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => undefined);
        throw new Error(errorPayload?.message ?? 'Request failed');
      }

      return (await response.json()) as T;
    },
    [authToken]
  );

  // Load menu items from backend
  useEffect(() => {
    let ignore = false;
    const loadMenu = async () => {
      try {
        const data = await fetchFromApi<{ items: FoodItem[] }>('/menu');
        if (!ignore) {
          setFoodItems(data.items);
          localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(data.items));
        }
      } catch (error) {
        // Backend not available - use default/cached data
        console.info('Using local menu data - backend unavailable', error);
      }
    };

    void loadMenu();
    return () => {
      ignore = true;
    };
  }, [fetchFromApi]);

  // Load orders and set up polling for near real-time updates
  useEffect(() => {
    if (!authToken) {
      setOrders([]);
      localStorage.removeItem(ORDER_CACHE_KEY);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      try {
        const data = await fetchFromApi<{ orders: Order[] }>('/orders', { requireAuth: true });
        if (!ignore) {
          setOrders(data.orders);
          localStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(data.orders));
        }
      } catch (error) {
        console.error('Failed to load orders', error);
      }
    };

    void loadOrders();
    const interval = window.setInterval(loadOrders, 15000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [authToken, fetchFromApi]);

  const addFoodItem = async (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const data = await fetchFromApi<{ item: FoodItem }>('/menu', {
        method: 'POST',
        body: item,
        requireAuth: true,
      });

      setFoodItems((prev) => {
        const updated = [data.item, ...prev.filter((entry) => entry.id !== data.item.id)];
        localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      toast.success('Food item added successfully');
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to add food item.');
    }
  };

  const updateFoodItem = async (id: string, item: Partial<FoodItem>) => {
    try {
      const data = await fetchFromApi<{ item: FoodItem }>(`/menu/${id}`, {
        method: 'PATCH',
        body: item,
        requireAuth: true,
      });

      setFoodItems((prev) => {
        const updated = prev.map((entry) => (entry.id === id ? data.item : entry));
        localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      toast.success('Food item updated successfully');
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to update food item.');
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await fetchFromApi(`/menu/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });

      setFoodItems((prev) => {
        const updated = prev.filter((entry) => entry.id !== id);
        localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      toast.success('Food item deleted successfully');
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to delete food item.');
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const payload = {
        items: order.items.map((item) => ({
          menuItemId: item.foodId,
          quantity: item.quantity,
        })),
        paymentMethod: order.paymentMethod,
        notes: order.notes,
      };

      const data = await fetchFromApi<{ order: Order }>('/orders', {
        method: 'POST',
        body: payload,
        requireAuth: true,
      });

      setOrders((prev) => {
        const updated = [data.order, ...prev];
        localStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      toast.success('Order placed successfully');
      return data.order.id;
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to place order.');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const data = await fetchFromApi<{ order: Order }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
        requireAuth: true,
      });

      setOrders((prev) => {
        const updated = prev.map((order) => (order.id === orderId ? data.order : order));
        localStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      const statusMessages: Record<Order['status'], string> = {
        pending: 'Your order has been received',
        preparing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup!',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled',
      };

      addNotification(data.order.customerId, statusMessages[status], 'info');
      toast.success(`Order status updated to ${status}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to update order status.');
    }
  };

  // Cart Management
  const persistCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  };

  const addToCart = (foodItem: FoodItem, quantity: number) => {
    const existingItem = cart.find((item) => item.foodItem.id === foodItem.id);
    let updated: CartItem[];

    if (existingItem) {
      updated = cart.map((item) =>
        item.foodItem.id === foodItem.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...cart, { foodItem, quantity }];
    }

    persistCart(updated);
    toast.success('Added to cart');
  };

  const removeFromCart = (foodId: string) => {
    const updated = cart.filter((item) => item.foodItem.id !== foodId);
    persistCart(updated);
    toast.success('Removed from cart');
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    const updated = cart.map((item) =>
      item.foodItem.id === foodId ? { ...item, quantity } : item
    );
    persistCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
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
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const clearNotifications = (userId: string) => {
    const updated = notifications.filter((n) => n.userId !== userId);
    setNotifications(updated);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
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
