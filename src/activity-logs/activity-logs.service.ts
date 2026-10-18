import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';
import { buildInsert, buildUpdate, required, safe } from '../common/db.util';

const FIELDS = ['user_id', 'exercise_id', 'duration_minutes', 'calories_burned', 'date_completed'];
const SELECT_JOIN = `SELECT al.*, u.full_name, e.exercise_name
  FROM activity_logs al
  JOIN users u ON u.user_id = al.user_id
  JOIN exercises e ON e.exercise_id = al.exercise_id`;

@Injectable()
export class ActivityLogsService {
  constructor(private db: DatabaseService) {}
  private pool = () => this.db.getPool();

  async create(body: any) {
    required(body, ['user_id', 'exercise_id', 'duration_minutes', 'date_completed']);
    const data = { ...body };
    // if calories_burned is not given, compute it: calories_per_minute x duration
    if (data.calories_burned === undefined) {
      const [ex] = await this.pool().execute<RowDataPacket[]>(
        'SELECT calories_per_minute FROM exercises WHERE exercise_id = ?',
        [data.exercise_id],
      );
      if (!ex[0]) throw new BadRequestException(`Exercise ${data.exercise_id} does not exist`);
      data.calories_burned = Number(ex[0].calories_per_minute) * Number(data.duration_minutes);
    }
    const q = buildInsert('activity_logs', FIELDS, data);
    const [result] = await safe(() => this.pool().execute<ResultSetHeader>(q.sql, q.values));
    return this.findById(result.insertId);
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(`${SELECT_JOIN} ORDER BY al.date_completed DESC`);
    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(`${SELECT_JOIN} WHERE al.log_id = ?`, [id]);
    if (!rows[0]) throw new NotFoundException(`Activity log ${id} not found`);
    return rows[0];
  }

  async update(id: number, body: any) {
    const q = buildUpdate(FIELDS, body);
    if (!q) return this.findById(id);
    const [res] = await safe(() =>
      this.pool().execute<ResultSetHeader>(`UPDATE activity_logs SET ${q.set} WHERE log_id = ?`, [...q.values, id]),
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Activity log ${id} not found`);
    return this.findById(id);
  }

  async remove(id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>('DELETE FROM activity_logs WHERE log_id = ?', [id]);
    if (res.affectedRows === 0) throw new NotFoundException(`Activity log ${id} not found`);
    return { message: `Activity log ${id} deleted` };
  }
}