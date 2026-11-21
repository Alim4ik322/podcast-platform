export interface SubscriptionProps {
  id?: string;
  userId: string;
  podcastId: string;
  subscribedAt?: Date;
}

export class Subscription {
  id: string;
  userId: string;
  podcastId: string;
  subscribedAt: Date;

  constructor(props: SubscriptionProps) {
    this.id = props.id ?? '';
    this.userId = props.userId;
    this.podcastId = props.podcastId;
    this.subscribedAt = props.subscribedAt ?? new Date(0);
  }
}