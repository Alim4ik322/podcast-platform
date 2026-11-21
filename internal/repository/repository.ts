import { Podcast } from '../domain/podcast';
import { Subscription } from '../domain/subscription';
import { User } from '../domain/user';

export interface UserRepository {
  create(user: User): Promise<void>;
  getByID(id: string): Promise<User>;
  getByEmail(email: string): Promise<User>;
  list(limit: number, offset: number): Promise<User[]>;
  delete(id: string): Promise<void>;
}

export interface PodcastRepository {
  create(podcast: Podcast): Promise<void>;
  getByID(id: string): Promise<Podcast>;
  list(limit: number, offset: number): Promise<Podcast[]>;
  update(podcast: Podcast): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<void>;
  getByID(id: string): Promise<Subscription>;
  list(limit: number, offset: number): Promise<Subscription[]>;
  delete(id: string): Promise<void>;
}