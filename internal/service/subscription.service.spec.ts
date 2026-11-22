import { DomainError, ErrNotFound } from '../domain/errors';
import { Podcast } from '../domain/podcast';
import { Subscription } from '../domain/subscription';
import {
  PodcastRepository,
  SubscriptionRepository,
} from '../repository/repository';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService (unit)', () => {
  let subRepo: jest.Mocked<SubscriptionRepository>;
  let podcastRepo: jest.Mocked<PodcastRepository>;
  let service: SubscriptionService;

  beforeEach(() => {
    subRepo = {
      create: jest.fn(async (s: Subscription) => {
        s.id = 'sub-1';
        s.subscribedAt = new Date('2026-11-21T10:00:00Z');
      }),
      getByID: jest.fn(),
      list: jest.fn<Promise<Subscription[]>, [number, number]>(async () => []),
      delete: jest.fn(),
    };

    podcastRepo = {
      create: jest.fn(),
      getByID: jest.fn(async (id: string) => {
        if (id === 'missing-podcast') {
          throw new DomainError(ErrNotFound.code, ErrNotFound.message);
        }
        return new Podcast({
          id,
          authorId: 'author-1',
          categoryId: 1,
          title: 'Tech Show',
          rssSlug: 'tech-show',
        });
      }),
      list: jest.fn<Promise<Podcast[]>, [number, number]>(async () => []),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new SubscriptionService(subRepo, podcastRepo);
  });

  it('creates subscription when podcast exists and no duplicate exists', async () => {
    const created = await service.create({
      userId: 'user-1',
      podcastId: 'pod-1',
    });

    expect(created.id).toBe('sub-1');
    expect(created.status).toBe('active');
    expect(subRepo.create).toHaveBeenCalledTimes(1);
  });

  it('rejects subscription when podcast does not exist with NOT_FOUND', async () => {
    await expect(
      service.create({ userId: 'user-1', podcastId: 'missing-podcast' }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: 'NOT_FOUND',
    });
    expect(subRepo.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate active subscription with CONFLICT', async () => {
    subRepo.list.mockResolvedValueOnce([
      new Subscription({
        id: 'sub-existing',
        userId: 'user-1',
        podcastId: 'pod-1',
        status: 'active',
      }),
    ]);

    await expect(
      service.create({ userId: 'user-1', podcastId: 'pod-1' }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: 'CONFLICT',
    });
    expect(subRepo.create).not.toHaveBeenCalled();
  });

  it('rejects cancelling an already cancelled subscription with CONFLICT', async () => {
    subRepo.getByID.mockResolvedValueOnce(
      new Subscription({
        id: 'sub-cancelled',
        userId: 'user-1',
        podcastId: 'pod-1',
        status: 'cancelled',
      }),
    );

    await expect(service.cancel('sub-cancelled')).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: 'CONFLICT',
    });
  });
});