import { Podcast } from '../../domain/podcast';
import { DomainError, ErrNotFound } from '../../domain/errors';
import { PodcastRepository } from '../repository';
import { mapPgError, normalizePagination, QueryExecutor } from './db';

interface PodcastRow {
  id: string;
  author_id: string;
  category_id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  rss_slug: string;
  language: string;
  created_at: Date;
}

function mapRowToPodcast(row: PodcastRow): Podcast {
  return new Podcast({
    id: row.id,
    authorId: row.author_id,
    categoryId: Number(row.category_id),
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url,
    rssSlug: row.rss_slug,
    language: row.language,
    createdAt: new Date(row.created_at),
  });
}

export class PostgresPodcastRepository implements PodcastRepository {
  constructor(private readonly db: QueryExecutor) {}

  async create(podcast: Podcast): Promise<void> {
    const q = `
      INSERT INTO podcasts (author_id, category_id, title, description, cover_url, rss_slug, language)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `;
    try {
      const res = await this.db.query<{ id: string; created_at: Date }>(q, [
        podcast.authorId,
        podcast.categoryId,
        podcast.title,
        podcast.description,
        podcast.coverUrl,
        podcast.rssSlug,
        podcast.language,
      ]);
      podcast.id = res.rows[0].id;
      podcast.createdAt = new Date(res.rows[0].created_at);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async getByID(id: string): Promise<Podcast> {
    const q = `
      SELECT id, author_id, category_id, title, description, cover_url, rss_slug, language, created_at
      FROM podcasts
      WHERE id = $1
    `;
    try {
      const res = await this.db.query<PodcastRow>(q, [id]);
      if (res.rows.length === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
      return mapRowToPodcast(res.rows[0]);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async list(limit: number, offset: number): Promise<Podcast[]> {
    const { safeLimit, safeOffset } = normalizePagination(limit, offset);
    const q = `
      SELECT id, author_id, category_id, title, description, cover_url, rss_slug, language, created_at
      FROM podcasts
      ORDER BY created_at DESC, id
      LIMIT $1 OFFSET $2
    `;
    try {
      const res = await this.db.query<PodcastRow>(q, [safeLimit, safeOffset]);
      return res.rows.map(mapRowToPodcast);
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async update(podcast: Podcast): Promise<void> {
    const q = `
      UPDATE podcasts
      SET title = $1, description = $2, cover_url = $3, category_id = $4, language = $5
      WHERE id = $6
    `;
    try {
      const res = await this.db.query(q, [
        podcast.title,
        podcast.description,
        podcast.coverUrl,
        podcast.categoryId,
        podcast.language,
        podcast.id,
      ]);
      if ((res.rowCount ?? 0) === 0) {
        throw new DomainError(ErrNotFound.code, ErrNotFound.message);
      }
    } catch (err) {
      throw mapPgError(err);
    }
  }

  async delete(id: string): Promise<void> {
    const q = `DELETE FROM podcasts WHERE id = $1`;
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