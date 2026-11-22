import {
  DomainError,
  ErrConflict,
  ErrInvalidInput,
  ErrNotFound,
} from '../domain/errors';
import { Subscription } from '../domain/subscription';
import {
  PodcastRepository,
  SubscriptionRepository,
} from '../repository/repository';
import { CreateSubscriptionDto } from '../dto/subscription.dto';

export class SubscriptionService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
    private readonly podcasts: PodcastRepository,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    if (!dto.userId?.trim() || !dto.podcastId?.trim()) {
      throw new DomainError(
        ErrInvalidInput.code,
        'userId and podcastId are required',
      );
    }

    // Бизнес-правило 1: связанный подкаст должен существовать
    await this.podcasts.getByID(dto.podcastId);

    // Бизнес-правило 2: нельзя оформить повторную подписку на тот же подкаст
    const existingList = await this.subscriptions.list(100, 0);
    const duplicate = existingList.find(
      (item) =>
        item.userId === dto.userId &&
        item.podcastId === dto.podcastId &&
        item.status !== 'cancelled',
    );
    if (duplicate) {
      throw new DomainError(
        ErrConflict.code,
        'User is already subscribed to this podcast',
      );
    }

    const subscription = new Subscription({
      userId: dto.userId,
      podcastId: dto.podcastId,
      status: 'active',
    });

    await this.subscriptions.create(subscription);
    return subscription;
  }

  async getById(id: string): Promise<Subscription> {
    if (!id?.trim()) {
      throw new DomainError(ErrInvalidInput.code, 'id is required');
    }
    return this.subscriptions.getByID(id);
  }

  async cancel(id: string): Promise<Subscription> {
    if (!id?.trim()) {
      throw new DomainError(ErrInvalidInput.code, 'id is required');
    }

    const subscription = await this.subscriptions.getByID(id);
    if (!subscription) {
      throw new DomainError(ErrNotFound.code, 'Subscription not found');
    }

    // Бизнес-правило 3: нельзя отменить уже отменённую подписку
    if (subscription.status === 'cancelled') {
      throw new DomainError(
        ErrConflict.code,
        'Subscription is already cancelled',
      );
    }

    subscription.status = 'cancelled';
    return subscription;
  }
}