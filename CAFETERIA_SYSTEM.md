# BUBT Cafeteria Management System

A modern, full-featured cafeteria management system built with React, TypeScript, and Tailwind CSS. The system supports three user roles: Admin, Staff, and Student/Customer, each with role-specific dashboards and features.

## 🚀 Features

### Admin Panel
- **Analytics Dashboard**: Real-time statistics with revenue, orders, and inventory metrics
- **Interactive Charts**: Sales trends, popular items, category distribution, and order status visualization
- **Food Management**: Complete CRUD operations for menu items (add, edit, delete)
- **Order Management**: View all orders with filtering and search capabilities
- **Staff Management**: Create and manage staff accounts
- **Notifications**: Real-time alerts for new orders and low stock

### Staff Panel
- **Live Order View**: See all active orders in real-time
- **Order Status Management**: Update order status (Pending → Preparing → Ready → Delivered)
- **Quick Actions**: One-click status progression for efficient order processing
- **Daily Summary**: Track today's revenue and order count
- **Food Availability**: Toggle menu items as available/unavailable

### Student/Customer Panel
- **Menu Browsing**: View all available food items with images, descriptions, and prices
- **Category Filtering**: Filter items by Rice & Curry, Snacks, Beverages, Fast Food, Desserts, Breakfast
- **Search**: Find items quickly with search functionality
- **Shopping Cart**: Add items to cart, adjust quantities, view total
- **Order Placement**: Place orders with payment method selection (Cash, Card, Mobile)
- **Live Order Tracking**: Track order status in real-time with visual progress indicators
- **Order History**: View all past orders with details

## 🎨 Design Features

- **Modern UI**: Clean, card-based design with BUBT branding colors
- **Gradient Accents**: Blue to purple gradients throughout the interface
- **Dark Mode**: Full dark/light theme support
- **Responsive**: Mobile-first design that works on all screen sizes
- **Animations**: Smooth transitions and entrance animations using Framer Motion
- **Toast Notifications**: Real-time feedback for all user actions

## 🛠 Technology Stack

- **Framework**: Vite + React 18
- **Language**: TypeScript
- **UI Components**: shadcn-ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast + Sonner
- **State Management**: React Context API
- **Routing**: React Router v6
- **Theme**: next-themes
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Accounts

### Admin
- **Email**: admin@bubt.edu
- **Password**: password123
- **Access**: Full system access with analytics and management capabilities

### Staff
- **Email**: staff@bubt.edu
- **Password**: password123
- **Access**: Order management and food availability control

### Student
- **Email**: student@bubt.edu
- **Password**: password123
- **Access**: Menu browsing, cart, and order placement

## 📁 Project Structure

```
src/
├── components/
│   ├── shared/              # Reusable components
│   │   ├── Layout.tsx       # Main layout with header and sidebar
│   │   ├── Sidebar.tsx      # Navigation sidebar for admin/staff
│   │   └── ProtectedRoute.tsx # Route protection HOC
│   ├── ui/                  # shadcn-ui components
│   └── ...
├── contexts/
│   ├── AuthContext.tsx      # Authentication state and functions
│   └── DataContext.tsx      # Data management (foods, orders, cart)
├── data/
│   └── mockData.ts          # Default mock data and generators
├── pages/
│   ├── auth/
│   │   ├── Login.tsx        # Login page
│   │   └── Register.tsx     # Registration page
│   ├── admin/
│   │   ├── Dashboard.tsx    # Admin analytics dashboard
│   │   ├── Foods.tsx        # Food management page
│   │   └── Orders.tsx       # All orders view
│   ├── staff/
│   │   └── Dashboard.tsx    # Staff order management
│   └── customer/
│       ├── Menu.tsx         # Browse menu items
│       ├── Cart.tsx         # Shopping cart and checkout
│       ├── Orders.tsx       # Order history
│       └── OrderTracking.tsx # Live order tracking
├── types/
│   └── index.ts             # TypeScript type definitions
├── lib/
│   └── utils.ts             # Utility functions
└── App.tsx                  # Main app with routing and providers
```

## 🎯 Key Features Explained

### Authentication System
- Role-based access control (Admin, Staff, Student)
- Protected routes for each role
- Automatic redirection based on user role
- Persistent login with localStorage

### Data Management
- Context-based state management
- localStorage for data persistence
- Mock backend simulation
- CRUD operations for all entities

### Order Flow
1. **Student**: Browse menu → Add to cart → Checkout → Place order
2. **Staff**: View new order → Update status → Mark as ready/delivered
3. **System**: Generate notifications for status changes
4. **Student**: Track order in real-time

### Real-time Updates (Simulated)
- Order status changes trigger notifications
- Context updates propagate to all components
- Toast messages for user feedback

## 🎨 Customization

### Colors
The system uses BUBT branding colors. To customize, update the Tailwind config:

```typescript
// tailwind.config.ts
colors: {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  // Add custom colors here
}
```

### Mock Data
Customize default food items and orders in:
```typescript
// src/data/mockData.ts
export const defaultFoodItems = [...]
export const generateMockOrders = (count) => [...]
```

## 📊 Analytics Dashboard Metrics

- **Total Revenue**: Cumulative revenue from all orders
- **Total Orders**: Count of all orders
- **Pending Orders**: Orders waiting to be processed
- **Menu Items**: Total food items in inventory
- **Sales Trend**: 7-day line chart showing daily revenue
- **Popular Items**: Bar chart of most ordered items
- **Revenue by Category**: Pie chart showing category distribution
- **Order Status Distribution**: Progress bars for each status

## 🔒 Security Notes

**Current Implementation (Demo):**
- Client-side authentication with localStorage
- Plain text passwords
- No backend API
- No encryption

**For Production, Implement:**
- Backend API with proper authentication (JWT, OAuth)
- Password hashing (bcrypt, argon2)
- HTTPS/SSL
- Input sanitization and validation
- Rate limiting
- CSRF protection
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Netlify / Vercel
```bash
npm run build
# Deploy the 'dist' folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

## 🐛 Known Issues & Limitations

1. **Image Loading**: External images may be blocked by ad blockers
2. **Data Persistence**: Uses localStorage (not suitable for production)
3. **Real-time**: Simulated with context updates (not true real-time)
4. **Authentication**: Basic client-side only (not secure for production)
5. **Bundle Size**: Large bundle due to all dependencies being included

## 🔮 Future Enhancements

- [ ] Backend API integration (Node.js/Express, Django, or Spring Boot)
- [ ] Database integration (MongoDB, PostgreSQL, or MySQL)
- [ ] Real-time updates with WebSockets/Socket.io
- [ ] Payment gateway integration (Stripe, bKash, Nagad)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] PDF invoice generation
- [ ] Analytics export (CSV/Excel)
- [ ] Multi-language support (i18n)
- [ ] PWA support for offline mode
- [ ] Push notifications
- [ ] Advanced reporting
- [ ] Inventory management
- [ ] User profile management
- [ ] Order scheduling
- [ ] Loyalty program
- [ ] Promo codes and discounts

## 📝 License

This project is created for educational purposes as part of the BUBT Cafeteria Management System.

## 👥 Contributors

Created with ❤️ for BUBT (Bangladesh University of Business and Technology)

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with React ⚛️ | TypeScript 💙 | Tailwind CSS 🎨**
