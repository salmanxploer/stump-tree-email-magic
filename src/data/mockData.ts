import { User, FoodItem, Order } from '@/types';

// Default users (password is 'password123' for all)
export const defaultUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@bubt.edu',
    password: 'password123',
    role: 'admin',
    phone: '01712345678',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-staff-1',
    name: 'Staff Member',
    email: 'staff@bubt.edu',
    password: 'password123',
    role: 'staff',
    phone: '01723456789',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-student-1',
    name: 'John Doe',
    email: 'student@bubt.edu',
    password: 'password123',
    role: 'student',
    phone: '01734567890',
    createdAt: new Date().toISOString(),
  },
];

// Food categories
export const foodCategories = [
  'Rice & Curry',
  'Snacks',
  'Beverages',
  'Fast Food',
  'Desserts',
  'Breakfast',
];

// Default food items
export const defaultFoodItems: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Chicken Biryani',
    description: 'Delicious aromatic rice with tender chicken pieces',
    category: 'Rice & Curry',
    price: 150,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    stock: 50,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-2',
    name: 'Beef Tehari',
    description: 'Spicy beef rice with authentic BUBT cafeteria taste',
    category: 'Rice & Curry',
    price: 180,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    stock: 30,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-3',
    name: 'Vegetable Rice',
    description: 'Healthy mixed vegetable rice bowl',
    category: 'Rice & Curry',
    price: 80,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    stock: 40,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-4',
    name: 'Chicken Burger',
    description: 'Juicy chicken patty with fresh vegetables',
    category: 'Fast Food',
    price: 120,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    stock: 25,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-5',
    name: 'Beef Burger',
    description: 'Premium beef burger with cheese',
    category: 'Fast Food',
    price: 150,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    stock: 20,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-6',
    name: 'Samosa',
    description: 'Crispy triangle pastry with spicy filling',
    category: 'Snacks',
    price: 15,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    stock: 100,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-7',
    name: 'Singara',
    description: 'Bangladeshi style samosa',
    category: 'Snacks',
    price: 12,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
    stock: 120,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-8',
    name: 'Tea',
    description: 'Hot milk tea',
    category: 'Beverages',
    price: 10,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    stock: 200,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-9',
    name: 'Coffee',
    description: 'Fresh brewed coffee',
    category: 'Beverages',
    price: 25,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    stock: 150,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-10',
    name: 'Mango Juice',
    description: 'Fresh mango juice',
    category: 'Beverages',
    price: 40,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
    stock: 80,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-11',
    name: 'Paratha',
    description: 'Flaky layered flatbread',
    category: 'Breakfast',
    price: 20,
    image: 'https://images.unsplash.com/photo-1626019476712-6b51e6576aa5?w=400',
    stock: 60,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'food-12',
    name: 'Egg Bhurji',
    description: 'Scrambled eggs with spices',
    category: 'Breakfast',
    price: 40,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    stock: 45,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to generate mock orders
export const generateMockOrders = (count: number = 10): Order[] => {
  const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'delivered'];
  const paymentMethods: Order['paymentMethod'][] = ['cash', 'card', 'mobile'];
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 24));
    
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = Array.from({ length: itemCount }, (_, j) => {
      const food = defaultFoodItems[Math.floor(Math.random() * defaultFoodItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      return {
        foodId: food.id,
        foodName: food.name,
        quantity,
        price: food.price,
      };
    });
    
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    return {
      id: `order-${i + 1}`,
      customerId: 'user-student-1',
      customerName: 'John Doe',
      items,
      totalAmount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
  });
};
