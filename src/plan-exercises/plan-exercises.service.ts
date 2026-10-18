import { Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { buildInsert, buildUpdate, required, safe } from '../common/db.util';

const SELECT_JOIN = `SELECT pe.plan_id, wp.plan_name, pe.exercise_id, e.exercise_name, pe.sets, pe.reps
  FROM plan_exercises pe
  JOIN workout_plans wp ON wp.plan_id = pe.plan_id
  JOIN exercises e ON e.exercise_id = pe.exercise_id`;

@Injectable()
export class PlanExercisesService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async create(body: any) {
    required(body, ['plan_id', 'exercise_id']);
    const q = buildInsert('plan_exercises', ['plan_id', 'exercise_id', 'sets', 'reps'], body);
    await safe(() => this.pool().execute<ResultSetHeader>(q.sql, q.values));
    return this.findOne(body.plan_id, body.exercise_id);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(SELECT_JOIN);
    return rows;
  }

  async findByPlan(planId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(`${SELECT_JOIN} WHERE pe.plan_id = ?`, [planId]);
    return rows;
  }

  async findOne(planId: number, exerciseId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `${SELECT_JOIN} WHERE pe.plan_id = ? AND pe.exercise_id = ?`,
      [planId, exerciseId],
    );
    if (!rows[0]) throw new NotFoundException(`Exercise ${exerciseId} is not in plan ${planId}`);
    return rows[0];
  }

  async update(planId: number, exerciseId: number, body: any) {
    const q = buildUpdate(['sets', 'reps'], body);
    if (!q) return this.findOne(planId, exerciseId);
    const [res] = await this.pool().execute<ResultSetHeader>(
      `UPDATE plan_exercises SET ${q.set} WHERE plan_id = ? AND exercise_id = ?`,
      [...q.values, planId, exerciseId],
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Exercise ${exerciseId} is not in plan ${planId}`);
    return this.findOne(planId, exerciseId);
  }

  async remove(planId: number, exerciseId: number) {
    const [res] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM plan_exercises WHERE plan_id = ? AND exercise_id = ?',
      [planId, exerciseId],
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Exercise ${exerciseId} is not in plan ${planId}`);
    return { message: `Exercise ${exerciseId} removed from plan ${planId}` };
  }
}