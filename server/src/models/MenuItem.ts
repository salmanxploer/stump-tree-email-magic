import { Schema, model, type Document } from 'mongoose';

export interface MenuItemDocument extends Document {
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  stock: number;
  isAvailable: boolean;
  tags?: string[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

menuItemSchema.set('toJSON', {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MenuItemModel = model<MenuItemDocument>('MenuItem', menuItemSchema);


