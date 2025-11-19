import { Schema, model, type Document, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'mobile';

interface OrderItem {
  menuItem: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document {
  customer: Types.ObjectId;
  customerName: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'], default: 'cash' },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    if (ret.customer) {
      ret.customerId = ret.customer.toString();
      delete ret.customer;
    }
    if (Array.isArray(ret.items)) {
      ret.items = ret.items.map((item: Record<string, any>) => ({
        foodId: item.menuItem ? item.menuItem.toString() : undefined,
        foodName: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const OrderModel = model<OrderDocument>('Order', orderSchema);


