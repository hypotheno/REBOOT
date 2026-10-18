import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { buildInsert, buildUpdate, required, safe } from '../common/db.util';

const FIELDS = ['user_id', 'goal_type', 'target_value', 'target_date', 'status'];

@Injectable()
export class GoalsService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async create(body: any) {
    required(body, ['user_id', 'goal_type']);
    const q = buildInsert('goals', FIELDS, body);
    const [result] = await safe(() => this.pool().execute<ResultSetHeader>(q.sql, q.values));
    return this.findById(result.insertId);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT g.*, u.full_name FROM goals g JOIN users u ON u.user_id = g.user_id`,
    );
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT g.*, u.full_name FROM goals g JOIN users u ON u.user_id = g.user_id WHERE g.goal_id = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Goal ${id} not found`);
    return rows[0];
  }

  async update(id: number, body: any) {
    const q = buildUpdate(FIELDS, body);
    if (!q) return this.findById(id);
    const [res] = await safe(() =>
      this.pool().execute<ResultSetHeader>(`UPDATE goals SET ${q.set} WHERE goal_id = ?`, [...q.values, id]),
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Goal ${id} not found`);
    return this.findById(id);
  }

  async remove(id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>('DELETE FROM goals WHERE goal_id = ?', [id]);
    if (res.affectedRows === 0) throw new NotFoundException(`Goal ${id} not found`);
    return { message: `Goal ${id} deleted` };
  }
}