import { Subscription, SubscriptionStatus } from '../domain/subscription';

export interface CreateSubscriptionDto {
  userId: string;
  podcastId: string;
}

export interface SubscriptionResponseDto {
  id: string;
  user_id: string;
  podcast_id: string;
  status: SubscriptionStatus;
  subscribed_at: string;
}

export function toSubscriptionResponseDto(
  sub: Subscription,
): SubscriptionResponseDto {
  return {
    id: sub.id,
    user_id: sub.userId,
    podcast_id: sub.podcastId,
    status: sub.status,
    subscribed_at: sub.subscribedAt.toISOString(),
  };
}