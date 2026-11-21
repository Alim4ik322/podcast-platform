export interface PodcastProps {
  id?: string;
  authorId: string;
  categoryId: number;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  rssSlug: string;
  language?: string;
  createdAt?: Date;
}

export class Podcast {
  id: string;
  authorId: string;
  categoryId: number;
  title: string;
  description: string | null;
  coverUrl: string | null;
  rssSlug: string;
  language: string;
  createdAt: Date;

  constructor(props: PodcastProps) {
    this.id = props.id ?? '';
    this.authorId = props.authorId;
    this.categoryId = props.categoryId;
    this.title = props.title;
    this.description = props.description ?? null;
    this.coverUrl = props.coverUrl ?? null;
    this.rssSlug = props.rssSlug;
    this.language = props.language ?? 'ru';
    this.createdAt = props.createdAt ?? new Date(0);
  }
}