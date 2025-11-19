import { Schema, model, type Document, Types } from 'mongoose';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDocument extends Document {
  invoiceNumber: string;
  order: Types.ObjectId;
  customer: Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'paid' | 'pending' | 'cancelled';
  issuedAt: Date;
  dueDate?: Date;
  notes?: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<InvoiceItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
    items: { type: [invoiceItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'], default: 'cash' },
    status: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'paid' },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Generate unique invoice number before saving (fallback if not provided)
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    try {
      const year = new Date().getFullYear();
      const count = await InvoiceModel.countDocuments({});
      this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // If counting fails, use timestamp as fallback
      this.invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

invoiceSchema.set('toJSON', {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    if (ret.order) {
      ret.orderId = ret.order.toString();
      delete ret.order;
    }
    if (ret.customer) {
      ret.customerId = ret.customer.toString();
      delete ret.customer;
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const InvoiceModel = model<InvoiceDocument>('Invoice', invoiceSchema);

