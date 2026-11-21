import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import {
  DomainError,
  ErrAlreadyExists,
  ErrConflict,
  ErrInvalidInput,
  ErrNotFound,
} from '../../domain/errors';

export interface QueryExecutor {
  query<R extends QueryResultRow = any>(
    queryText: string,
    values?: any[],
  ): Promise<QueryResult<R>>;
}

export function mapPgError(err: unknown): DomainError | Error {
  if (err instanceof DomainError) {
    return err;
  }

  if (err && typeof err === 'object' && 'code' in err) {
    const pgErr = err as { code?: string; message?: string; constraint?: string };
    switch (pgErr.code) {
      case '23505': // unique_violation
        return new DomainError(
          ErrAlreadyExists.code,
          `${ErrAlreadyExists.message}${pgErr.constraint ? `: ${pgErr.constraint}` : ''}`,
          err,
        );
      case '23503': // foreign_key_violation
        return new DomainError(
          ErrConflict.code,
          `${ErrConflict.message}${pgErr.constraint ? `: ${pgErr.constraint}` : ''}`,
          err,
        );
      case '23514': // check_violation
      case '22P02': // invalid_text_representation
        return new DomainError(
          ErrInvalidInput.code,
          `${ErrInvalidInput.message}: ${pgErr.message ?? ''}`,
          err,
        );
    }
  }

  return err instanceof Error ? err : new Error(String(err));
}

export function normalizePagination(
  limit: number,
  offset: number,
): { safeLimit: number; safeOffset: number } {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 20;
  const safeOffset =
    Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;
  return { safeLimit, safeOffset };
}

export async function withTx<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // игнорируем ошибку отката при уже прерванном соединении
    }
    throw mapPgError(err);
  } finally {
    client.release();
  }
}