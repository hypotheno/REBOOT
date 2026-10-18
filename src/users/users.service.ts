import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { buildUpdate, required, safe } from '../common/db.util';

const PUBLIC_COLS = 'user_id, full_name, email, weight_kg, height_cm, created_at';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async createUser(body: any) {
    required(body, ['full_name', 'email', 'password']);
    const hash = await bcrypt.hash(body.password, 10);
    const [result] = await safe(() =>
      this.pool().execute<ResultSetHeader>(
        'INSERT INTO users (full_name, email, password_hash, weight_kg, height_cm) VALUES (?, ?, ?, ?, ?)',
        [body.full_name, body.email, hash, body.weight_kg ?? null, body.height_cm ?? null],
      ),
    );
    return this.findById(result.insertId);
  }

  // internal use only (login) - includes password_hash
  async findByEmail(email: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows[0];
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT ${PUBLIC_COLS} FROM users WHERE user_id = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`User ${id} not found`);
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(`SELECT ${PUBLIC_COLS} FROM users`);
    return rows;
  }

  async updateUser(id: number, body: any) {
    const data = { ...body };
    if (data.password) data.password_hash = await bcrypt.hash(data.password, 10);
    const q = buildUpdate(['full_name', 'email', 'password_hash', 'weight_kg', 'height_cm'], data);
    if (!q) return this.findById(id);
    await safe(() =>
      this.pool().execute(`UPDATE users SET ${q.set} WHERE user_id = ?`, [...q.values, id]),
    );
    return this.findById(id);
  }

  async deleteUser(id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM users WHERE user_id = ?',
      [id],
    );
    if (res.affectedRows === 0) throw new NotFoundException(`User ${id} not found`);
    return { message: `User ${id} deleted` };
  }
}