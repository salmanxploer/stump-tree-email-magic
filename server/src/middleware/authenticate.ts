import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { UserModel } from '../models/User';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: 'admin' | 'staff' | 'student';
  headers: Request['headers'];
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers['authorization'] ?? (req.headers as Record<string, string | undefined>)['Authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const payload = verifyToken(token);
    const existingUser = await UserModel.findById(payload.sub);

    if (!existingUser) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (existingUser.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact an administrator.' });
    }

    req.userId = existingUser.id;
    req.userRole = existingUser.role;
    next();
  } catch (error) {
    console.error('Authentication error', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
