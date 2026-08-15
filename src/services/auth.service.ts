import crypto from 'crypto';
import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'salt_cinefamily').digest('hex');
}

export class AuthService {
  static signup(data: { name: string; email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new AppError('Email address is already registered', 400);
    }

    const hashedPassword = hashPassword(data.password);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'user')
    `).run(data.name, email, hashedPassword);

    const newUser = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as any;

    const token = crypto.randomBytes(24).toString('hex');

    return {
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    };
  }

  static login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const hashedPassword = hashPassword(data.password);
    if (user.password_hash !== hashedPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = crypto.randomBytes(24).toString('hex');

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    };
  }
}
