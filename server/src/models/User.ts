import { Schema, model, type Document } from 'mongoose';

export interface UserDocument extends Document {
  firebaseUid?: string;
  googleId?: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'admin' | 'staff' | 'student';
  phone?: string;
  avatar?: string;
  isBlocked?: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      orderUpdates?: boolean;
      promotions?: boolean;
    };
  };
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firebaseUid: { type: String, index: true, sparse: true },
    googleId: { type: String, index: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['admin', 'staff', 'student'], default: 'student' },
    phone: { type: String },
    avatar: { type: String },
    isBlocked: { type: Boolean, default: false },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc: unknown, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const UserModel = model<UserDocument>('User', userSchema);
