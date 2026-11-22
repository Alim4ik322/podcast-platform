export type SubscriptionStatus = 'active' | 'cancelled';

export interface SubscriptionProps {
  id?: string;
  userId: string;
  podcastId: string;
  status?: SubscriptionStatus;
  subscribedAt?: Date;
}

export class Subscription {
  id: string;
  userId: string;
  podcastId: string;
  status: SubscriptionStatus;
  subscribedAt: Date;

  constructor(props: SubscriptionProps) {
    this.id = props.id ?? '';
    this.userId = props.userId;
    this.podcastId = props.podcastId;
    this.status = props.status ?? 'active';
    this.subscribedAt = props.subscribedAt ?? new Date(0);
  }
}