import { User, UserRole } from '../../domain/user';
import { ErrNotFound, DomainError } from '../../domain/errors';
import { UserRepository } from '../repository';
import { mapPgError, normalizePagination, QueryExecutor } from './db';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  role: UserRole;
  created_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    username: row.username,
    role: row.role,
    createdAt: new Date(row.created_at),
  });
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: QueryExecutor) {}

  async create(user: User): Promise<void> {
    const q = `
      INSERT INTO users (email, password_hash, username, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;
    try {
      const res = await this.db.query<{ id: string; created_at: Date }>(q, [
        user.email,
        user.passwordHash,
        user.username,
        user.role,
      ]);
      user.id = res.rows[0].id;
      user.createdAt = new Date(res.rows[0].created_at);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async getByID(id: string): Promise<User> {
    const q = `
      SELECT id, email, password_hash, username, role, created_at
      FROM users
      WHERE id = $1
    `;
    try {
      const res = await this.db.query<UserRow>(q, [id]);
      if (res.rows.length === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
      return mapRowToUser(res.rows[0]);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async getByEmail(email: string): Promise<User> {
    const q = `
      SELECT id, email, password_hash, username, role, created_at
      FROM users
      WHERE email = $1
    `;
    try {
      const res = await this.db.query<UserRow>(q, [email]);
      if (res.rows.length === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
      return mapRowToUser(res.rows[0]);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async list(limit: number, offset: number): Promise<User[]> {
    const { safeLimit, safeOffset } = normalizePagination(limit, offset);
    const q = `
      SELECT id, email, password_hash, username, role, created_at
      FROM users
      ORDER BY created_at DESC, id
      LIMIT $1 OFFSET $2
    `;
    try {
      const res = await this.db.query<UserRow>(q, [safeLimit, safeOffset]);
      return res.rows.map(mapRowToUser);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async delete(id: string): Promise<void> {
    const q = `DELETE FROM users WHERE id = $1`;
    try {
      const res = await this.db.query(q, [id]);
      if ((res.rowCount ?? 0) === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
    } catch (err) {
      throw mapPgError(err);
    }
  }
}