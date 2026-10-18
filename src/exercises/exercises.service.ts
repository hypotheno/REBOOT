import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { buildInsert, buildUpdate, required, safe } from '../common/db.util';

const FIELDS = ['exercise_name', 'category', 'calories_per_minute', 'description'];

@Injectable()
export class ExercisesService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async create(body: any) {
    required(body, ['exercise_name', 'category', 'calories_per_minute']);
    const q = buildInsert('exercises', FIELDS, body);
    const [result] = await safe(() => this.pool().execute<ResultSetHeader>(q.sql, q.values));
    return this.findById(result.insertId);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>('SELECT * FROM exercises');
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM exercises WHERE exercise_id = ?',
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Exercise ${id} not found`);
    return rows[0];
  }

  async update(id: number, body: any) {
    const q = buildUpdate(FIELDS, body);
    if (!q) return this.findById(id);
    const [res] = await safe(() =>
      this.pool().execute<ResultSetHeader>(`UPDATE exercises SET ${q.set} WHERE exercise_id = ?`, [...q.values, id]),
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Exercise ${id} not found`);
    return this.findById(id);
  }

  async remove(id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>('DELETE FROM exercises WHERE exercise_id = ?', [id]);
    if (res.affectedRows === 0) throw new NotFoundException(`Exercise ${id} not found`);
    return { message: `Exercise ${id} deleted` };
  }
}