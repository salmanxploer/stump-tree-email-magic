import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { UserModel } from './models/User';
import { createToken } from './utils/token';
import type { UserDocument } from './models/User';
import { authenticate, type AuthenticatedRequest } from './middleware/authenticate';
import { firebaseAdminAuth } from './firebaseAdmin';
import { MenuItemModel } from './models/MenuItem';
import { OrderModel, type OrderStatus, type PaymentMethod } from './models/Order';
import { InvoiceModel } from './models/Invoice';

const normalizeClientUrl = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url);
const allowedOrigins = config.clientUrls.map(normalizeClientUrl);
const defaultClientBase = allowedOrigins[0] ?? 'http://localhost:5173';
const defaultCallbackUrl = `${defaultClientBase}/auth/callback`;
const isAllowedRedirect = (target: string) => allowedOrigins.some((origin) => target.startsWith(origin));

const app = express();

const requireRole =
  (roles: Array<'admin' | 'staff' | 'student'>) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }
    next();
  };

// Simple request logger to help debug connectivity from frontend
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // In development, allow localhost on any port
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl ?? '/auth/google/callback',
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('Google account is missing an email address'));
        }

        const displayName = profile.displayName ?? email.split('@')[0];
        const avatar = profile.photos?.[0]?.value;

        let user = await UserModel.findOne({ googleId });
        if (user) {
          user.name = displayName;
          user.email = email;
          if (avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        user = await UserModel.findOne({ email });
        if (user) {
          user.googleId = googleId;
          user.name = displayName;
          if (avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        const newUser = await UserModel.create({
          googleId,
          name: displayName,
          email,
          avatar,
          role: 'student',
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      passwordHash,
      phone,
      role: 'student',
    });

  const token = createToken(newUser.id, newUser.role);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Registration error', error);
    return res.status(500).json({ message: 'Something went wrong while creating the account.' });
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

  const token = createToken(user.id, user.role);

    return res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ message: 'Something went wrong while signing in.' });
  }
});

app.get('/auth/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Profile error', error);
    return res.status(500).json({ message: 'Unable to fetch profile.' });
  }
});

// Sync a Firebase-authenticated user into MongoDB and return the app user
app.post('/auth/sync', async (req: Request, res: Response) => {
  try {
    if (!firebaseAdminAuth) {
      return res.status(500).json({ message: 'Firebase Admin is not configured on the server.' });
    }

    const authHeader = req.headers.authorization ?? '';
    const [, firebaseIdToken] = authHeader.split(' ');

    if (!firebaseIdToken) {
      return res.status(401).json({ message: 'Missing Firebase ID token.' });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(firebaseIdToken);
    const firebaseUid = decoded.uid;
    const email = decoded.email;

    if (!email) {
      return res.status(400).json({ message: 'Firebase user has no email address.' });
    }

    const { name, phone, role } = req.body as {
      name?: string;
      phone?: string;
      role?: 'admin' | 'staff' | 'student';
    };

    const displayName = name ?? decoded.name ?? email.split('@')[0];
    const normalizedEmail = email.toLowerCase();
    const isAdminEmail = config.adminEmails.includes(normalizedEmail);
    const desiredRole = role ?? (isAdminEmail ? 'admin' : 'student');

    let user = await UserModel.findOne({ firebaseUid });
    if (!user) {
      // Fallback to existing user by email for smooth migration
      user = await UserModel.findOne({ email: normalizedEmail });
    }

    if (!user) {
      user = await UserModel.create({
        firebaseUid,
        name: displayName,
        email: normalizedEmail,
        phone,
        role: desiredRole,
      });
    } else {
      user.firebaseUid = firebaseUid;
      user.name = displayName;
      if (typeof phone === 'string') {
        user.phone = phone;
      }
      if (role) {
        user.role = role;
      } else if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    }

    const sessionToken = createToken(user.id, user.role);
    return res.json({ user: user.toJSON(), token: sessionToken });
  } catch (error) {
    console.error('Auth sync error', error);
    return res.status(401).json({ message: 'Invalid or expired Firebase ID token.' });
  }
});

app.patch('/auth/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, phone, avatar, preferences } = req.body as {
      name?: string;
      phone?: string | null;
      avatar?: string;
      preferences?: {
        theme?: 'light' | 'dark' | 'system';
        notifications?: {
          email?: boolean;
          push?: boolean;
          orderUpdates?: boolean;
          promotions?: boolean;
        };
      };
    };

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone || undefined;
    }

    if (avatar !== undefined) {
      user.avatar = avatar || undefined;
    }

    if (preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
        notifications: {
          ...user.preferences?.notifications,
          ...preferences.notifications,
        },
      };
    }

    await user.save();

    return res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Profile update error', error);
    return res.status(500).json({ message: 'Unable to update profile.' });
  }
});

app.get('/auth/google', (req: Request, res: Response, next: NextFunction) => {
  const requestedRedirect = typeof req.query.redirect === 'string' ? req.query.redirect : undefined;
  const redirect = requestedRedirect && isAllowedRedirect(requestedRedirect) ? requestedRedirect : defaultCallbackUrl;
  const statePayload = JSON.stringify({ redirect });
  const encodedState = Buffer.from(statePayload).toString('base64url');

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: encodedState,
  })(req, res, next);
});

app.get('/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user?: UserDocument | false) => {
    const fallbackRedirect = defaultCallbackUrl;

    if (err || !user) {
      const errorMessage = encodeURIComponent(err?.message ?? 'Unable to sign in with Google');
      return res.redirect(`${fallbackRedirect}?error=${errorMessage}`);
    }

    let redirectTarget = fallbackRedirect;
    if (typeof req.query.state === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(req.query.state, 'base64url').toString()) as { redirect?: string };
        if (decoded.redirect && isAllowedRedirect(decoded.redirect)) {
          redirectTarget = decoded.redirect;
        }
      } catch (stateError) {
        console.error('Failed to parse OAuth state payload', stateError);
      }
    }

  const token = createToken(user.id, user.role);
    const separator = redirectTarget.includes('?') ? '&' : '?';
    const redirectUrl = `${redirectTarget}${separator}token=${encodeURIComponent(token)}`;

    return res.redirect(redirectUrl);
  })(req, res, next);
});

// Menu routes
app.get('/menu', async (_req: Request, res: Response) => {
  try {
    const items = await MenuItemModel.find().sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    console.error('Failed to fetch menu items', error);
    return res.status(500).json({ message: 'Unable to load menu items.' });
  }
});

app.post('/menu', authenticate, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, category, price, image, stock, isAvailable, tags } = req.body as {
      name?: string;
      description?: string;
      category?: string;
      price?: number;
      image?: string;
      stock?: number;
      isAvailable?: boolean;
      tags?: string[];
    };

    if (!name || !category || typeof price !== 'number') {
      return res.status(400).json({ message: 'Name, category, and price are required.' });
    }

    const item = await MenuItemModel.create({
      name: name.trim(),
      description,
      category: category.trim(),
      price,
      image,
      stock: typeof stock === 'number' ? Math.max(0, stock) : 0,
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
      tags: Array.isArray(tags) ? tags : undefined,
    });

    return res.status(201).json({ item: item.toJSON() });
  } catch (error) {
    console.error('Failed to create menu item', error);
    return res.status(500).json({ message: 'Unable to create menu item.' });
  }
});

app.patch('/menu/:menuItemId', authenticate, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const updates = req.body as Partial<{
      name: string;
      description: string;
      category: string;
      price: number;
      image: string;
      stock: number;
      isAvailable: boolean;
      tags: string[];
    }>;

    if (updates.price !== undefined && typeof updates.price !== 'number') {
      return res.status(400).json({ message: 'Price must be a number.' });
    }
    if (updates.stock !== undefined && typeof updates.stock !== 'number') {
      return res.status(400).json({ message: 'Stock must be a number.' });
    }

    const item = await MenuItemModel.findById(menuItemId);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    if (updates.name !== undefined) item.name = updates.name.trim();
    if (updates.description !== undefined) item.description = updates.description;
    if (updates.category !== undefined) item.category = updates.category.trim();
    if (updates.price !== undefined) item.price = updates.price;
    if (updates.image !== undefined) item.image = updates.image;
    if (updates.stock !== undefined) item.stock = Math.max(0, updates.stock);
    if (updates.isAvailable !== undefined) item.isAvailable = updates.isAvailable;
    if (updates.tags !== undefined && Array.isArray(updates.tags)) item.tags = updates.tags;

    await item.save();

    return res.json({ item: item.toJSON() });
  } catch (error) {
    console.error('Failed to update menu item', error);
    return res.status(500).json({ message: 'Unable to update menu item.' });
  }
});

app.delete('/menu/:menuItemId', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const item = await MenuItemModel.findByIdAndDelete(menuItemId);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    return res.json({ message: 'Menu item deleted.' });
  } catch (error) {
    console.error('Failed to delete menu item', error);
    return res.status(500).json({ message: 'Unable to delete menu item.' });
  }
});

// Order routes
app.get('/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filter = req.userRole === 'student' ? { customer: new mongoose.Types.ObjectId(req.userId) } : {};
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    return res.json({ orders: orders.map((o) => o.toJSON()) });
  } catch (error) {
    console.error('Failed to fetch orders', error);
    return res.status(500).json({ message: 'Unable to load orders.' });
  }
});

app.get('/orders/:orderId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (req.userRole === 'student' && order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not allowed to view this order.' });
    }

    return res.json({ order: order.toJSON() });
  } catch (error) {
    console.error('Failed to fetch order', error);
    return res.status(500).json({ message: 'Unable to load order.' });
  }
});

app.post('/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { items, paymentMethod, notes } = req.body as {
      items?: Array<{ menuItemId?: string; quantity?: number }>;
      paymentMethod?: PaymentMethod;
      notes?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one menu item.' });
    }

    const customer = await UserModel.findById(req.userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const menuItemIds = items
      .map((entry) => entry.menuItemId)
      .filter((value): value is string => typeof value === 'string')
      .map((id) => new mongoose.Types.ObjectId(id));

    const dbMenuItems = await MenuItemModel.find({ _id: { $in: menuItemIds } });
    const menuItemMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    let totalAmount = 0;
    const orderItems: {
      menuItem: typeof dbMenuItems[number]['_id'];
      name: string;
      price: number;
      quantity: number;
    }[] = [];
    const updatedMenuItems = new Map<string, typeof dbMenuItems[number]>();

    for (const entry of items) {
      if (!entry.menuItemId || typeof entry.quantity !== 'number' || entry.quantity <= 0) {
        return res.status(400).json({ message: 'Each order item must include a valid menuItemId and quantity.' });
      }

      const menuItem = menuItemMap.get(entry.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ message: 'One or more menu items could not be found.' });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable.` });
      }
      if (menuItem.stock < entry.quantity) {
        return res.status(400).json({ message: `${menuItem.name} does not have enough stock.` });
      }

      menuItem.stock -= entry.quantity;
      updatedMenuItems.set(menuItem.id, menuItem);

      const lineTotal = menuItem.price * entry.quantity;
      totalAmount += lineTotal;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: entry.quantity,
      });
    }

    await Promise.all(
      Array.from(updatedMenuItems.values()).map(async (item) => {
        await item.save();
      })
    );

    const newOrder = await OrderModel.create({
      customer: customer._id,
      customerName: customer.name,
      paymentMethod: paymentMethod ?? 'cash',
      notes,
      status: 'pending',
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({ order: newOrder.toJSON() });
  } catch (error) {
    console.error('Failed to create order', error);
    return res.status(500).json({ message: 'Unable to create order.' });
  }
});

app.patch(
  '/orders/:orderId/status',
  authenticate,
  requireRole(['admin', 'staff']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body as { status?: OrderStatus };

      if (!status || !['pending', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }

      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const previousStatus = order.status;
      order.status = status;
      await order.save();

      // Auto-generate invoice when order is delivered
      if (status === 'delivered' && previousStatus !== 'delivered') {
        try {
          const existingInvoice = await InvoiceModel.findOne({ order: order._id });
          if (!existingInvoice) {
            const customer = await UserModel.findById(order.customer);
            const invoiceItems = order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.price * item.quantity,
            }));

            // Generate invoice number manually
            const year = new Date().getFullYear();
            const count = await InvoiceModel.countDocuments({});
            const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;

            await InvoiceModel.create({
              invoiceNumber,
              order: order._id,
              customer: order.customer,
              customerName: order.customerName,
              customerEmail: customer?.email,
              customerPhone: customer?.phone,
              items: invoiceItems,
              subtotal: order.totalAmount,
              tax: 0,
              discount: 0,
              total: order.totalAmount,
              paymentMethod: order.paymentMethod,
              status: 'paid',
              issuedAt: new Date(),
            });
          }
        } catch (invoiceError) {
          console.error('Failed to generate invoice', invoiceError);
          // Don't fail the order status update if invoice generation fails
        }
      }

      return res.json({ order: order.toJSON() });
    } catch (error) {
      console.error('Failed to update order status', error);
      return res.status(500).json({ message: 'Unable to update order status.' });
    }
  }
);

// Invoice routes
app.get('/invoices', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filter = req.userRole === 'student' ? { customer: new mongoose.Types.ObjectId(req.userId) } : {};
    const invoices = await InvoiceModel.find(filter).sort({ createdAt: -1 }).populate('order');
    return res.json({ invoices: invoices.map((inv) => inv.toJSON()) });
  } catch (error) {
    console.error('Failed to fetch invoices', error);
    return res.status(500).json({ message: 'Unable to load invoices.' });
  }
});

app.get('/invoices/:invoiceId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await InvoiceModel.findById(invoiceId).populate('order');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    if (req.userRole === 'student' && invoice.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not allowed to view this invoice.' });
    }

    return res.json({ invoice: invoice.toJSON() });
  } catch (error) {
    console.error('Failed to fetch invoice', error);
    return res.status(500).json({ message: 'Unable to load invoice.' });
  }
});

app.get('/orders/:orderId/invoice', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    let invoice = await InvoiceModel.findOne({ order: new mongoose.Types.ObjectId(orderId) }).populate('order');
    
    // If invoice doesn't exist but order is delivered, auto-generate it
    if (!invoice) {
      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      // Check permissions
      if (req.userRole === 'student' && order.customer.toString() !== req.userId) {
        return res.status(403).json({ message: 'You are not allowed to view this invoice.' });
      }

      // Only auto-generate for delivered orders
      if (order.status === 'delivered') {
        try {
          const customer = await UserModel.findById(order.customer);
          const invoiceItems = order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
          }));

          // Generate invoice number manually
          const year = new Date().getFullYear();
          const count = await InvoiceModel.countDocuments({});
          const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;

          invoice = await InvoiceModel.create({
            invoiceNumber,
            order: order._id,
            customer: order.customer,
            customerName: order.customerName,
            customerEmail: customer?.email,
            customerPhone: customer?.phone,
            items: invoiceItems,
            subtotal: order.totalAmount,
            tax: 0,
            discount: 0,
            total: order.totalAmount,
            paymentMethod: order.paymentMethod,
            status: 'paid',
            issuedAt: new Date(),
          });
        } catch (invoiceError: any) {
          console.error('Failed to auto-generate invoice', invoiceError);
          const errorMessage = invoiceError?.message || 'Unknown error occurred';
          console.error('Invoice error details:', errorMessage);
          return res.status(500).json({ 
            message: 'Unable to generate invoice.',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
          });
        }
      } else {
        return res.status(404).json({ message: 'Invoice not yet generated for this order. Invoice is only available for delivered orders.' });
      }
    }

    // Check permissions for existing invoice
    if (req.userRole === 'student' && invoice.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not allowed to view this invoice.' });
    }

    return res.json({ invoice: invoice.toJSON() });
  } catch (error) {
    console.error('Failed to fetch invoice by order', error);
    return res.status(500).json({ message: 'Unable to load invoice.' });
  }
});

app.post('/invoices', authenticate, requireRole(['admin', 'staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, tax, discount, notes } = req.body as {
      orderId?: string;
      tax?: number;
      discount?: number;
      notes?: string;
    };

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required.' });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const existingInvoice = await InvoiceModel.findOne({ order: order._id });
    if (existingInvoice) {
      return res.status(409).json({ message: 'Invoice already exists for this order.' });
    }

    const customer = await UserModel.findById(order.customer);
    const invoiceItems = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    }));

    const subtotal = order.totalAmount;
    const taxAmount = typeof tax === 'number' ? tax : 0;
    const discountAmount = typeof discount === 'number' ? discount : 0;
    const total = subtotal + taxAmount - discountAmount;

    // Generate invoice number manually
    const year = new Date().getFullYear();
    const count = await InvoiceModel.countDocuments({});
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;

    const invoice = await InvoiceModel.create({
      invoiceNumber,
      order: order._id,
      customer: order.customer,
      customerName: order.customerName,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      items: invoiceItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      paymentMethod: order.paymentMethod,
      status: order.status === 'delivered' ? 'paid' : 'pending',
      issuedAt: new Date(),
      notes,
    });

    return res.status(201).json({ invoice: invoice.toJSON() });
  } catch (error) {
    console.error('Failed to create invoice', error);
    return res.status(500).json({ message: 'Unable to create invoice.' });
  }
});

// User Management Routes (Admin only)
app.get('/users', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, search, isBlocked } = req.query;
    const query: any = {};

    if (role && typeof role === 'string' && ['admin', 'staff', 'student'].includes(role)) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await UserModel.find(query).sort({ createdAt: -1 });
    return res.json({ users: users.map(u => u.toJSON()) });
  } catch (error) {
    console.error('Failed to fetch users', error);
    return res.status(500).json({ message: 'Unable to fetch users.' });
  }
});

app.get('/users/:userId', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get user statistics
    const orderCount = await OrderModel.countDocuments({ customer: user._id });
    const totalSpent = await OrderModel.aggregate([
      { $match: { customer: user._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSpentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;

    return res.json({
      user: user.toJSON(),
      statistics: {
        orderCount,
        totalSpent: totalSpentAmount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user', error);
    return res.status(500).json({ message: 'Unable to fetch user.' });
  }
});

app.patch('/users/:userId/block', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({ message: 'You cannot block yourself.' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isBlocked = true;
    await user.save();

    return res.json({ user: user.toJSON(), message: 'User blocked successfully.' });
  } catch (error) {
    console.error('Failed to block user', error);
    return res.status(500).json({ message: 'Unable to block user.' });
  }
});

app.patch('/users/:userId/unblock', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isBlocked = false;
    await user.save();

    return res.json({ user: user.toJSON(), message: 'User unblocked successfully.' });
  } catch (error) {
    console.error('Failed to unblock user', error);
    return res.status(500).json({ message: 'Unable to unblock user.' });
  }
});

app.delete('/users/:userId', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user has orders
    const orderCount = await OrderModel.countDocuments({ customer: user._id });
    if (orderCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing orders. Consider blocking instead.' 
      });
    }

    // Delete from Firebase
    let firebaseDeleted = false;
    if (firebaseAdminAuth) {
      try {
        // First, try to delete using firebaseUid if available
        if (user.firebaseUid) {
          try {
            await firebaseAdminAuth.deleteUser(user.firebaseUid);
            console.log(`✓ Firebase user deleted by UID: ${user.firebaseUid}`);
            firebaseDeleted = true;
          } catch (firebaseError: any) {
            if (firebaseError.code === 'auth/user-not-found') {
              console.log(`ℹ Firebase user with UID ${user.firebaseUid} not found (may have been deleted already)`);
            } else {
              console.warn(`⚠ Failed to delete Firebase user by UID ${user.firebaseUid}:`, firebaseError.message);
            }
          }
        }

        // If deletion by UID failed or UID doesn't exist, try to find and delete by email
        if (!firebaseDeleted && user.email) {
          try {
            const firebaseUser = await firebaseAdminAuth.getUserByEmail(user.email);
            if (firebaseUser) {
              await firebaseAdminAuth.deleteUser(firebaseUser.uid);
              console.log(`✓ Firebase user deleted by email: ${user.email} (UID: ${firebaseUser.uid})`);
              firebaseDeleted = true;
            }
          } catch (firebaseError: any) {
            if (firebaseError.code === 'auth/user-not-found') {
              console.log(`ℹ Firebase user with email ${user.email} not found (may not exist in Firebase)`);
            } else {
              console.warn(`⚠ Failed to find/delete Firebase user by email ${user.email}:`, firebaseError.message);
            }
          }
        }
      } catch (error: any) {
        console.error('Error during Firebase deletion:', error.message);
      }
    } else {
      console.warn('⚠ Firebase Admin is not configured. Skipping Firebase deletion.');
    }

    // Delete from MongoDB
    await UserModel.findByIdAndDelete(userId);
    console.log(`✓ MongoDB user deleted: ${user.email} (ID: ${userId})`);

    const message = firebaseDeleted 
      ? 'User deleted successfully from both Firebase and MongoDB.'
      : 'User deleted from MongoDB. Firebase user was not found or already deleted.';

    return res.json({ message });
  } catch (error) {
    console.error('Failed to delete user', error);
    return res.status(500).json({ message: 'Unable to delete user.' });
  }
});

app.patch('/users/:userId/role', authenticate, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role?: 'admin' | 'staff' | 'student' };
    
    if (!role || !['admin', 'staff', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (userId === req.userId && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own role from admin.' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    return res.json({ user: user.toJSON(), message: 'User role updated successfully.' });
  } catch (error) {
    console.error('Failed to update user role', error);
    return res.status(500).json({ message: 'Unable to update user role.' });
  }
});

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');
    console.log('Allowed client origins:', allowedOrigins);
    console.log('Server will listen on port:', config.port);

    app.listen(config.port, () => {
      console.log(`BUBT Cafe server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Server startup failed', error);
    process.exit(1);
  }
};

void start();
