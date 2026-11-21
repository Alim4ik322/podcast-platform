import { Subscription } from '../../domain/subscription';
import { DomainError, ErrNotFound } from '../../domain/errors';
import { SubscriptionRepository } from '../repository';
import { mapPgError, normalizePagination, QueryExecutor } from './db';

interface SubscriptionRow {
  id: string;
  user_id: string;
  podcast_id: string;
  subscribed_at: Date;
}

function mapRowToSubscription(row: SubscriptionRow): Subscription {
  return new Subscription({
    id: row.id,
    userId: row.user_id,
    podcastId: row.podcast_id,
    subscribedAt: new Date(row.subscribed_at),
  });
}

export class PostgresSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly db: QueryExecutor) {}

  async create(subscription: Subscription): Promise<void> {
    const q = `
      INSERT INTO subscriptions (user_id, podcast_id)
      VALUES ($1, $2)
      RETURNING id, subscribed_at
    `;
    try {
      const res = await this.db.query<{ id: string; subscribed_at: Date }>(
        q,
        [subscription.userId, subscription.podcastId],
      );
      subscription.id = res.rows[0].id;
      subscription.subscribedAt = new Date(res.rows[0].subscribed_at);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async getByID(id: string): Promise<Subscription> {
    const q = `
      SELECT id, user_id, podcast_id, subscribed_at
      FROM subscriptions
      WHERE id = $1
    `;
    try {
      const res = await this.db.query<SubscriptionRow>(q, [id]);
      if (res.rows.length === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
      return mapRowToSubscription(res.rows[0]);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async list(limit: number, offset: number): Promise<Subscription[]> {
    const { safeLimit, safeOffset } = normalizePagination(limit, offset);
    const q = `
      SELECT id, user_id, podcast_id, subscribed_at
      FROM subscriptions
      ORDER BY subscribed_at DESC, id
      LIMIT $1 OFFSET $2
    `;
    try {
      const res = await this.db.query<SubscriptionRow>(q, [
        safeLimit,
        safeOffset,
      ]);
      return res.rows.map(mapRowToSubscription);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async delete(id: string): Promise<void> {
    const q = `DELETE FROM subscriptions WHERE id = $1`;
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