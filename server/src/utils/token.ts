import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  sub: string;
  role: 'admin' | 'staff' | 'student';
}

export const createToken = (id: string, role: 'admin' | 'staff' | 'student'): string =>
  jwt.sign({ sub: id, role } satisfies TokenPayload, config.jwtSecret, { expiresIn: '7d' });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwtSecret) as TokenPayload;
