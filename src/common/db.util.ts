import { BadRequestException, ConflictException } from '@nestjs/common';

export function required(body: any, fields: string[]) {
  const missing = fields.filter(
    (f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === '',
  );
  if (missing.length)
    throw new BadRequestException(`Missing required field(s): ${missing.join(', ')}`);
}

export async function safe<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') throw new ConflictException('Duplicate entry (already exists)');
    if (e?.code === 'ER_NO_REFERENCED_ROW_2')
      throw new BadRequestException('Related record does not exist (check the foreign key id)');
    if (e?.code === 'WARN_DATA_TRUNCATED' || e?.code === 'ER_TRUNCATED_WRONG_VALUE')
      throw new BadRequestException('Invalid value for one of the fields');
    throw e;
  }
}

export function buildInsert(table: string, allowed: string[], body: any) {
  const fields = allowed.filter((f) => body[f] !== undefined);
  return {
    sql: `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
    values: fields.map((f) => body[f]) as any[],
  };
}

export function buildUpdate(allowed: string[], body: any) {
  const fields = allowed.filter((f) => body[f] !== undefined);
  if (!fields.length) return null;
  return {
    set: fields.map((f) => `${f} = ?`).join(', '),
    values: fields.map((f) => body[f]) as any[],
  };
}