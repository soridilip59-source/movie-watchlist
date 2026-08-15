import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

export class FamilyService {
  static getFamily(familyId: number = 1) {
    const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
    if (!family) {
      throw new AppError('Family not found', 404);
    }
    const members = db.prepare('SELECT * FROM members WHERE family_id = ? ORDER BY id ASC').all(familyId);
    return { ...family, members };
  }

  static createFamily(name: string) {
    const result = db.prepare('INSERT INTO families (name) VALUES (?)').run(name);
    return this.getFamily(result.lastInsertRowid as number);
  }

  static addMember(data: {
    family_id: number;
    name: string;
    role: 'Parent' | 'Teen' | 'Kid' | 'Other';
    age: number;
    max_rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
    avatar_emoji?: string;
  }) {
    const family = db.prepare('SELECT id FROM families WHERE id = ?').get(data.family_id);
    if (!family) {
      throw new AppError('Family not found', 404);
    }

    const result = db.prepare(`
      INSERT INTO members (family_id, name, role, age, max_rating, avatar_emoji)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.family_id,
      data.name,
      data.role,
      data.age,
      data.max_rating,
      data.avatar_emoji || '👤'
    );

    return db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  }

  static updateMember(memberId: number, data: Partial<{
    name: string;
    role: 'Parent' | 'Teen' | 'Kid' | 'Other';
    age: number;
    max_rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
    avatar_emoji: string;
  }>) {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
    if (data.age !== undefined) { fields.push('age = ?'); values.push(data.age); }
    if (data.max_rating !== undefined) { fields.push('max_rating = ?'); values.push(data.max_rating); }
    if (data.avatar_emoji !== undefined) { fields.push('avatar_emoji = ?'); values.push(data.avatar_emoji); }

    if (fields.length === 0) return member;

    values.push(memberId);
    db.prepare(`UPDATE members SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
  }

  static deleteMember(memberId: number) {
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }
    db.prepare('DELETE FROM members WHERE id = ?').run(memberId);
    return { success: true, message: 'Member deleted successfully' };
  }
}
