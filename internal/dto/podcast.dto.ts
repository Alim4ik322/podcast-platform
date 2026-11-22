import { Podcast } from '../domain/podcast';

export interface CreatePodcastDto {
  authorId: string;
  categoryId: number;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  rssSlug: string;
  language?: string;
}

export interface UpdatePodcastDto {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  categoryId: number;
  language?: string;
}

export interface PodcastResponseDto {
  id: string;
  author_id: string;
  category_id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  rss_slug: string;
  language: string;
  created_at: string;
}

export function toPodcastResponseDto(podcast: Podcast): PodcastResponseDto {
  return {
    id: podcast.id,
    author_id: podcast.authorId,
    category_id: podcast.categoryId,
    title: podcast.title,
    description: podcast.description,
    cover_url: podcast.coverUrl,
    rss_slug: podcast.rssSlug,
    language: podcast.language,
    created_at: podcast.createdAt.toISOString(),
  };
}