import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { buildInsert, buildUpdate, required, safe } from '../common/db.util';

const FIELDS = ['plan_name', 'difficulty_level', 'target_goal'];

@Injectable()
export class WorkoutPlansService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async create(body: any) {
    required(body, ['plan_name']);
    const q = buildInsert('workout_plans', FIELDS, body);
    const [result] = await safe(() => this.pool().execute<ResultSetHeader>(q.sql, q.values));
    return this.findById(result.insertId);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>('SELECT * FROM workout_plans');
    return rows;
  }

  // plan + its exercises (from the plan_exercises junction table)
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT * FROM workout_plans WHERE plan_id = ?',
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Workout plan ${id} not found`);
    const [exercises] = await this.pool().execute<RowDataPacket[]>(
      `SELECT e.exercise_id, e.exercise_name, e.category, pe.sets, pe.reps
       FROM plan_exercises pe JOIN exercises e ON e.exercise_id = pe.exercise_id
       WHERE pe.plan_id = ?`,
      [id],
    );
    return { ...rows[0], exercises };
  }

  async update(id: number, body: any) {
    const q = buildUpdate(FIELDS, body);
    if (!q) return this.findById(id);
    const [res] = await safe(() =>
      this.pool().execute<ResultSetHeader>(`UPDATE workout_plans SET ${q.set} WHERE plan_id = ?`, [...q.values, id]),
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Workout plan ${id} not found`);
    return this.findById(id);
  }

  async remove(id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>('DELETE FROM workout_plans WHERE plan_id = ?', [id]);
    if (res.affectedRows === 0) throw new NotFoundException(`Workout plan ${id} not found`);
    return { message: `Workout plan ${id} deleted` };
  }
}