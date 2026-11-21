export type UserRole = 'listener' | 'creator' | 'admin';

export interface UserProps {
  id?: string;
  email: string;
  passwordHash: string;
  username: string;
  role: UserRole;
  createdAt?: Date;
}

export class User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  role: UserRole;
  createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id ?? '';
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.username = props.username;
    this.role = props.role;
    this.createdAt = props.createdAt ?? new Date(0);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      created_at: this.createdAt,
    };
  }
}