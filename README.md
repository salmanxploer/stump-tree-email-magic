# 🍽️ BUBT Cafe - Cafeteria Management System

<div align="center">

![BUBT Cafe](https://img.shields.io/badge/BUBT-Cafe-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.6-47A248?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=for-the-badge&logo=firebase)

A modern, full-featured cafeteria management system with real-time order processing, invoice generation, and comprehensive analytics. Built for Bangladesh University of Business and Technology (BUBT).

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Deployment](#-deployment)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

BUBT Cafe is a comprehensive cafeteria management system designed to streamline food ordering, order processing, and business operations. The system supports three distinct user roles (Admin, Staff, and Student) with role-specific dashboards and features. It includes real-time order tracking, automatic invoice generation, inventory management, and detailed analytics.

### Key Highlights

- ✅ **Real-time Order Processing** - Live order updates with 15-second polling
- ✅ **Automatic Invoice Generation** - Professional invoices generated on order delivery
- ✅ **Role-Based Access Control** - Secure authentication with Firebase and JWT
- ✅ **MongoDB Integration** - Persistent data storage with Mongoose ODM
- ✅ **Modern UI/UX** - Beautiful, responsive design with dark mode support
- ✅ **Comprehensive Analytics** - Revenue tracking, popular items, and sales trends

---

## ✨ Features

### 👨‍💼 Admin Dashboard

- **Analytics & Reporting**
  - Real-time revenue statistics and order metrics
  - Interactive charts (sales trends, popular items, category distribution)
  - Daily, weekly, and monthly sales reports
  - Order status distribution visualization

- **Menu Management**
  - Complete CRUD operations for food items
  - Category management (Rice & Curry, Snacks, Beverages, Fast Food, Desserts, Breakfast)
  - Stock management and availability toggling
  - Image upload and item descriptions
  - Price and inventory tracking

- **Order Management**
  - View all orders across the system
  - Filter and search capabilities
  - Order status monitoring
  - Customer information access

- **User Management**
  - Staff account creation and management
  - Role assignment and permissions
  - User profile administration

### 👨‍🍳 Staff Dashboard

- **Order Processing**
  - Live view of active orders
  - Order status updates (Pending → Preparing → Ready → Delivered)
  - Quick action buttons for status progression
  - Order details and customer information

- **Daily Operations**
  - Today's order count and revenue
  - Active orders tracking
  - Menu item availability management
  - Real-time notifications

### 🎓 Student/Customer Portal

- **Menu Browsing**
  - Browse all available food items with images
  - Category filtering and search functionality
  - Item details (description, price, availability)
  - Stock information display

- **Shopping Cart**
  - Add/remove items with quantity adjustment
  - Real-time total calculation
  - Cart persistence across sessions

- **Order Management**
  - Place orders with payment method selection (Cash, Card, Mobile Payment)
  - Order notes and special instructions
  - Real-time order tracking with visual progress indicators
  - Complete order history

- **Invoice System**
  - Automatic invoice generation for delivered orders
  - Professional invoice layout
  - Print and download capabilities
  - Invoice history access

---

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.5.3 | Type safety |
| **Vite** | 5.4.1 | Build tool and dev server |
| **React Router** | 6.26.2 | Client-side routing |
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **shadcn/ui** | Latest | UI component library (Radix UI) |
| **Framer Motion** | 12.23.24 | Animation library |
| **React Hook Form** | 7.53.0 | Form management |
| **Zod** | 3.23.8 | Schema validation |
| **TanStack Query** | 5.56.2 | Data fetching and caching |
| **Recharts** | 2.12.7 | Chart visualization |
| **Firebase** | 12.6.0 | Authentication |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **Sonner** | 1.5.0 | Toast notifications (alternative) |
| **next-themes** | 0.3.0 | Dark mode support |
| **Lucide React** | 0.462.0 | Icon library |
| **date-fns** | 3.6.0 | Date manipulation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.19.2 | Web framework |
| **TypeScript** | 5.5.3 | Type safety |
| **MongoDB** | 8.6.3 | Database (via Mongoose) |
| **Mongoose** | 8.6.3 | MongoDB ODM |
| **Firebase Admin** | 12.7.0 | Server-side Firebase operations |
| **Passport.js** | 0.7.0 | Authentication middleware |
| **Passport Google OAuth** | 2.0.0 | Google OAuth strategy |
| **JWT (jsonwebtoken)** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.4.5 | Environment variable management |
| **tsx** | 4.19.1 | TypeScript execution |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.9.0 | Code linting |
| **TypeScript ESLint** | 8.0.1 | TypeScript-specific linting |
| **PostCSS** | 8.4.47 | CSS processing |
| **Autoprefixer** | 10.4.20 | CSS vendor prefixing |
| **@vitejs/plugin-react-swc** | 3.5.0 | Fast React refresh |

---

## 📁 Project Structure

```
bubt-cafe/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── server/                 # Backend application
│   ├── src/
│   │   ├── config.ts              # Environment configuration
│   │   ├── index.ts               # Express server and routes
│   │   ├── firebaseAdmin.ts       # Firebase Admin SDK setup
│   │   ├── middleware/
│   │   │   └── authenticate.ts    # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.ts            # User schema
│   │   │   ├── MenuItem.ts        # Menu item schema
│   │   │   ├── Order.ts           # Order schema
│   │   │   └── Invoice.ts         # Invoice schema
│   │   ├── utils/
│   │   │   └── token.ts           # JWT token utilities
│   │   └── seed.ts                # Database seeding script
│   ├── package.json
│   └── tsconfig.json
│
├── src/                    # Frontend application
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (40+ components)
│   │   ├── shared/                # Shared components
│   │   │   ├── Layout.tsx         # Main layout wrapper
│   │   │   ├── Header.tsx         # Application header
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── Footer.tsx         # Application footer
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   └── features/
│   │       └── QuickReorder.tsx   # Quick reorder feature
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication state management
│   │   └── DataContext.tsx        # Data state management (menu, orders, cart)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx          # Login page
│   │   │   ├── Register.tsx       # Registration page
│   │   │   └── OAuthCallback.tsx  # OAuth callback handler
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx      # Admin analytics dashboard
│   │   │   ├── Foods.tsx          # Menu management
│   │   │   └── Orders.tsx         # Order management
│   │   ├── staff/
│   │   │   └── Dashboard.tsx      # Staff order processing
│   │   ├── customer/
│   │   │   ├── Menu.tsx           # Menu browsing
│   │   │   ├── Cart.tsx           # Shopping cart
│   │   │   ├── Orders.tsx         # Order history
│   │   │   ├── OrderTracking.tsx  # Real-time order tracking
│   │   │   └── Invoice.tsx        # Invoice viewing and printing
│   │   ├── shared/
│   │   │   └── Profile.tsx        # User profile management
│   │   ├── Index.tsx              # Home page redirect
│   │   └── NotFound.tsx           # 404 page
│   │
│   ├── lib/
│   │   ├── firebase.ts            # Firebase client configuration
│   │   └── utils.ts               # Utility functions
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   │
│   ├── data/
│   │   └── mockData.ts            # Mock data generators
│   │
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
│
├── .env                          # Frontend environment variables
├── .env.example                  # Environment variable template
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **yarn** / **pnpm**)
- **MongoDB** Atlas account (or local MongoDB instance)
- **Firebase** project with Authentication enabled
- **Google Cloud Console** account (for OAuth)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd bubt-cafe
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Environment Configuration

#### Frontend Environment (`.env` in root)

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_API_BASE_URL=http://localhost:4000

# Firebase Configuration (Client-side)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend Environment (`.env` in `server/`)

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key\n-----END PRIVATE KEY-----\n

# CORS Configuration
CLIENT_URLS=http://localhost:8080,http://localhost:5173,http://localhost:8081

# Admin Configuration
ADMIN_EMAILS=admin@bubt.edu
```

### Step 4: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google)

2. **Get Firebase Client Config**
   - Project Settings → General → Your apps
   - Copy the config values to frontend `.env`

3. **Get Firebase Admin SDK**
   - Project Settings → Service Accounts
   - Generate new private key
   - Copy values to backend `.env`

### Step 5: Google OAuth Setup

1. **Create OAuth 2.0 Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:4000/auth/google/callback`
   - Copy Client ID and Secret to backend `.env`

### Step 6: Start Development Servers

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000

---

## ⚙️ Configuration

### Environment Variables Reference

#### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `bubt-2c983` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456:web:abc123` |

#### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `4000` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | Yes | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | No | `http://localhost:4000/auth/google/callback` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | `bubt-2c983` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes | `-----BEGIN PRIVATE KEY-----...` |
| `CLIENT_URLS` | Allowed CORS origins | No | `http://localhost:8080,http://localhost:5173` |
| `ADMIN_EMAILS` | Admin email addresses | No | `admin@bubt.edu` |

---

## 📖 Usage

### Running the Application

#### Development Mode

```bash
# Start both servers concurrently
npm run dev              # Frontend (port 8080)
npm run server:dev       # Backend (port 4000)
```

#### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build

# Start production server
npm start
```

### Available Scripts

#### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend Scripts

```bash
npm run dev          # Start with hot reload (tsx watch)
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run seed         # Seed database with sample data
```

---

## 🔌 API Documentation

### Base URL

```
http://localhost:4000
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

#### Authentication Endpoints

##### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+8801234567890"
}
```

##### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

##### Sync Firebase Auth

```http
POST /auth/sync
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+8801234567890",
  "role": "student"
}
```

##### Get User Profile

```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

##### Update Profile

```http
PATCH /auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+8809876543210"
}
```

##### Google OAuth

```http
GET /auth/google?redirect=<callback_url>
```

#### Menu Endpoints

##### Get All Menu Items

```http
GET /menu
```

**Response:**
```json
{
  "items": [
    {
      "id": "item_id",
      "name": "Burger",
      "description": "Delicious burger",
      "category": "Fast Food",
      "price": 150,
      "image": "https://...",
      "stock": 50,
      "isAvailable": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

##### Create Menu Item (Admin/Staff)

```http
POST /menu
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Pizza",
  "description": "Cheese pizza",
  "category": "Fast Food",
  "price": 300,
  "image": "https://...",
  "stock": 30,
  "isAvailable": true,
  "tags": ["popular", "vegetarian"]
}
```

##### Update Menu Item (Admin/Staff)

```http
PATCH /menu/:menuItemId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price": 350,
  "stock": 25,
  "isAvailable": false
}
```

##### Delete Menu Item (Admin)

```http
DELETE /menu/:menuItemId
Authorization: Bearer <jwt_token>
```

#### Order Endpoints

##### Get Orders

```http
GET /orders
Authorization: Bearer <jwt_token>
```

**Response (Student):** Returns only their orders  
**Response (Admin/Staff):** Returns all orders

##### Get Order by ID

```http
GET /orders/:orderId
Authorization: Bearer <jwt_token>
```

##### Create Order

```http
POST /orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "menuItemId": "item_id_1",
      "quantity": 2
    },
    {
      "menuItemId": "item_id_2",
      "quantity": 1
    }
  ],
  "paymentMethod": "cash",
  "notes": "Extra spicy please"
}
```

**Response:**
```json
{
  "order": {
    "id": "order_id",
    "customerId": "user_id",
    "customerName": "John Doe",
    "items": [...],
    "totalAmount": 600,
    "status": "pending",
    "paymentMethod": "cash",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

##### Update Order Status (Admin/Staff)

```http
PATCH /orders/:orderId/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "preparing"
}
```

**Valid statuses:** `pending`, `preparing`, `ready`, `delivered`, `cancelled`

#### Invoice Endpoints

##### Get All Invoices

```http
GET /invoices
Authorization: Bearer <jwt_token>
```

**Response (Student):** Returns only their invoices  
**Response (Admin/Staff):** Returns all invoices

##### Get Invoice by ID

```http
GET /invoices/:invoiceId
Authorization: Bearer <jwt_token>
```

##### Get Invoice by Order ID

```http
GET /orders/:orderId/invoice
Authorization: Bearer <jwt_token>
```

**Note:** Automatically generates invoice if order is delivered and invoice doesn't exist.

##### Create Invoice (Admin/Staff)

```http
POST /invoices
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "orderId": "order_id",
  "tax": 50,
  "discount": 0,
  "notes": "Thank you for your order"
}
```

---

## 🗄️ Database Schema

### User Model

```typescript
{
  _id: ObjectId,
  firebaseUid?: string,        // Firebase user ID
  googleId?: string,           // Google OAuth ID
  name: string,                // User's full name
  email: string,               // Unique email (lowercase)
  passwordHash?: string,       // Hashed password (bcrypt)
  role: 'admin' | 'staff' | 'student',
  phone?: string,              // Phone number
  avatar?: string,             // Profile picture URL
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Model

```typescript
{
  _id: ObjectId,
  name: string,                // Item name
  description?: string,        // Item description
  category: string,            // Food category
  price: number,               // Price in BDT
  image?: string,              // Image URL
  stock: number,               // Available quantity
  isAvailable: boolean,        // Availability status
  tags?: string[],             // Tags (e.g., ["popular", "vegetarian"])
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```typescript
{
  _id: ObjectId,
  customer: ObjectId,          // Reference to User
  customerName: string,        // Customer name (denormalized)
  paymentMethod: 'cash' | 'card' | 'mobile',
  items: [{
    menuItem: ObjectId,        // Reference to MenuItem
    name: string,              // Item name (denormalized)
    price: number,             // Price at time of order
    quantity: number           // Quantity ordered
  }],
  totalAmount: number,         // Total order amount
  notes?: string,              // Special instructions
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice Model

```typescript
{
  _id: ObjectId,
  invoiceNumber: string,       // Unique: INV-YYYY-XXXXXX
  order: ObjectId,             // Reference to Order (unique)
  customer: ObjectId,          // Reference to User
  customerName: string,
  customerEmail?: string,
  customerPhone?: string,
  items: [{
    name: string,
    quantity: number,
    unitPrice: number,
    total: number
  }],
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  paymentMethod: 'cash' | 'card' | 'mobile',
  status: 'paid' | 'pending' | 'cancelled',
  issuedAt: Date,
  dueDate?: Date,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication

### Authentication Flow

1. **Email/Password Authentication**
   - User registers/logs in via Firebase Authentication
   - Frontend receives Firebase ID token
   - Frontend sends ID token to `/auth/sync` endpoint
   - Backend verifies token with Firebase Admin SDK
   - Backend creates/updates user in MongoDB
   - Backend returns JWT token for API access

2. **Google OAuth Authentication**
   - User clicks "Sign in with Google"
   - Redirected to Google OAuth consent screen
   - Google redirects back with authorization code
   - Backend exchanges code for user info
   - Backend creates/updates user in MongoDB
   - Backend returns JWT token

3. **JWT Token Usage**
   - JWT token stored in localStorage
   - Included in `Authorization: Bearer <token>` header
   - Token expires after 7 days
   - Middleware validates token on protected routes

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder:**
   - **Vercel**: Connect GitHub repo, set build command: `npm run build`, output directory: `dist`
   - **Netlify**: Drag and drop `dist` folder or connect repo

3. **Set environment variables** in deployment platform:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_FIREBASE_*` - Firebase configuration

### Backend Deployment (Railway/Render/Heroku)

1. **Prepare for deployment:**
   ```bash
   cd server
   npm run build
   ```

2. **Set environment variables** in deployment platform:
   - All variables from `server/.env`

3. **Deploy:**
   - **Railway**: Connect GitHub repo, set start command: `npm start`
   - **Render**: Connect repo, set build: `npm install && npm run build`, start: `npm start`
   - **Heroku**: Use Heroku CLI or GitHub integration

### Docker Deployment

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:4000
  
  backend:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      # ... other env vars
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

---

## 💻 Development

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Recommended for code formatting
- **Conventions**: 
  - Use functional components with hooks
  - Type all props and state
  - Use meaningful variable names
  - Follow React best practices

### Adding New Features

1. **Create new page:**
   ```typescript
   // src/pages/customer/NewPage.tsx
   import Layout from '@/components/shared/Layout';
   
   const NewPage = () => {
     return <Layout title="New Page">Content</Layout>;
   };
   ```

2. **Add route:**
   ```typescript
   // src/App.tsx
   import NewPage from './pages/customer/NewPage';
   
   <Route path="/customer/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```

3. **Create API endpoint:**
   ```typescript
   // server/src/index.ts
   app.get('/api/new-endpoint', authenticate, async (req, res) => {
     // Implementation
   });
   ```

### Database Seeding

```bash
cd server
npm run seed
```

This will populate the database with sample data for testing.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Menu item CRUD operations
- [ ] Order placement and tracking
- [ ] Invoice generation and viewing
- [ ] Role-based access control
- [ ] Real-time order updates
- [ ] Responsive design on mobile/tablet
- [ ] Dark mode functionality
- [ ] Print/PDF invoice generation

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Verify MongoDB URI is correct
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify username/password are correct

#### Firebase Authentication Error

**Problem:** `Firebase: Error (auth/invalid-api-key)`

**Solution:**
- Verify Firebase config in `.env`
- Check Firebase project settings
- Ensure Authentication is enabled in Firebase Console

#### CORS Error

**Problem:** `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution:**
- Add frontend URL to `CLIENT_URLS` in backend `.env`
- Restart backend server

#### Invoice Generation Fails

**Problem:** "Unable to generate invoice"

**Solution:**
- Ensure order status is "delivered"
- Check MongoDB connection
- Verify invoice number generation logic
- Check server logs for detailed error

---

## 📊 Performance Optimization

### Frontend

- **Code Splitting**: Implemented via React Router lazy loading
- **Image Optimization**: Use optimized image formats (WebP)
- **Bundle Size**: Tree-shaking enabled in Vite
- **Caching**: React Query for API response caching

### Backend

- **Database Indexing**: Indexes on frequently queried fields
- **Connection Pooling**: Mongoose connection pooling
- **Response Compression**: Enable gzip compression
- **Rate Limiting**: Implement rate limiting for production

---

## 🔒 Security Best Practices

### Implemented

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection (React escapes by default)

### Recommended for Production

- [ ] HTTPS/SSL certificates
- [ ] Rate limiting
- [ ] Request size limits
- [ ] Helmet.js for security headers
- [ ] Environment variable encryption
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

---

## 📈 Future Enhancements

### Planned Features

- [ ] **Payment Gateway Integration**
  - bKash, Nagad, Rocket integration
  - Stripe for international payments
  - Payment status tracking

- [ ] **Real-time Notifications**
  - WebSocket/Socket.io integration
  - Push notifications
  - Email notifications
  - SMS notifications

- [ ] **Advanced Analytics**
  - Revenue forecasting
  - Inventory predictions
  - Customer behavior analysis
  - Export reports (PDF, Excel, CSV)

- [ ] **Inventory Management**
  - Low stock alerts
  - Automatic reordering
  - Supplier management
  - Batch tracking

- [ ] **Loyalty Program**
  - Points system
  - Rewards and discounts
  - Referral program

- [ ] **Order Scheduling**
  - Pre-order functionality
  - Scheduled delivery
  - Recurring orders

- [ ] **Multi-language Support**
  - i18n implementation
  - Bengali/English support

- [ ] **PWA Support**
  - Offline mode
  - Installable app
  - Service workers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

---

## 📝 License

This project is created for educational purposes as part of the BUBT (Bangladesh University of Business and Technology) Cafeteria Management System.

---

## 👥 Authors & Contributors

- **Development Team** - BUBT Cafeteria System
- **Institution** - Bangladesh University of Business and Technology

---

## 📧 Support & Contact

- **Email**: cafeteria@bubt.edu
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: See [Wiki](https://github.com/your-repo/wiki) for detailed docs

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **Firebase** - Authentication and backend services
- **MongoDB** - Database solution
- **Vite** - Fast build tool
- **React** - Framework

---

<div align="center">

**Built with ❤️ for BUBT**

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.6-47A248?logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

[⬆ Back to Top](#-bubt-cafe---cafeteria-management-system)

</div>
