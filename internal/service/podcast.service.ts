import {
  DomainError,
  ErrInvalidInput,
  ErrNotFound,
} from '../domain/errors';
import { Podcast } from '../domain/podcast';
import { PodcastRepository } from '../repository/repository';
import { CreatePodcastDto, UpdatePodcastDto } from '../dto/podcast.dto';

export class PodcastService {
  constructor(private readonly podcasts: PodcastRepository) {}

  async create(dto: CreatePodcastDto): Promise<Podcast> {
    const title = dto.title?.trim() ?? '';
    const rssSlug = dto.rssSlug?.trim() ?? '';

    if (!title || !rssSlug || !dto.authorId || dto.categoryId <= 0) {
      throw new DomainError(
        ErrInvalidInput.code,
        'title, rssSlug, authorId and positive categoryId are required',
      );
    }

    const podcast = new Podcast({
      authorId: dto.authorId,
      categoryId: dto.categoryId,
      title,
      description: dto.description ?? null,
      coverUrl: dto.coverUrl ?? null,
      rssSlug,
      language: dto.language ?? 'ru',
    });

    await this.podcasts.create(podcast);
    return podcast;
  }

  async getById(id: string): Promise<Podcast> {
    if (!id?.trim()) {
      throw new DomainError(ErrInvalidInput.code, 'id is required');
    }
    return this.podcasts.getByID(id);
  }

  async list(limit: number, offset: number): Promise<Podcast[]> {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
    return this.podcasts.list(safeLimit, safeOffset);
  }

  async update(id: string, dto: UpdatePodcastDto): Promise<Podcast> {
    const title = dto.title?.trim() ?? '';
    if (!id?.trim() || !title || dto.categoryId <= 0) {
      throw new DomainError(
        ErrInvalidInput.code,
        'id, title and positive categoryId are required',
      );
    }

    const existing = await this.podcasts.getByID(id);
    existing.title = title;
    existing.description = dto.description ?? null;
    existing.coverUrl = dto.coverUrl ?? null;
    existing.categoryId = dto.categoryId;
    if (dto.language) {
      existing.language = dto.language;
    }

    await this.podcasts.update(existing);
    return this.podcasts.getByID(id);
  }

  async delete(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new DomainError(ErrInvalidInput.code, 'id is required');
    }
    await this.podcasts.delete(id);
  }
}