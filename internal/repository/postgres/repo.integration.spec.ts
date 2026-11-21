import { Pool } from 'pg';
import { DomainError } from '../../domain/errors';
import { User } from '../../domain/user';
import { PostgresUserRepository } from './user.repository';

const testDbUrl =
  process.env.TEST_DATABASE_URL ||
  'postgres://podcast_user:podcast_secret_pass@localhost:5433/podcast_test?sslmode=disable';

describe('PostgresUserRepository (integration)', () => {
  let pool: Pool;
  let repo: PostgresUserRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: testDbUrl, max: 5 });
    repo = new PostgresUserRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  const uniq = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  it('creates, reads, paginates and deletes a user (DB generates id and created_at)', async () => {
    const email = `${uniq('listener')}@example.com`;
    const user = new User({
      email,
      passwordHash: 'hashed_secret_123',
      username: 'TestListener',
      role: 'listener',
    });

    await repo.create(user);
    expect(user.id).toBeTruthy();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.toJSON()).not.toHaveProperty('passwordHash');

    const fetched = await repo.getByID(user.id);
    expect(fetched.email).toBe(email);
    expect(fetched.username).toBe('TestListener');

    const page = await repo.list(1, 0);
    expect(page.length).toBeLessThanOrEqual(1);

    await repo.delete(user.id);

    await expect(repo.getByID(user.id)).rejects.toMatchObject<Partial<DomainError>>({
      code: 'NOT_FOUND',
    });
  });

  it('returns ALREADY_EXISTS on duplicate unique email', async () => {
    const email = `${uniq('dup')}@example.com`;
    const first = new User({
      email,
      passwordHash: 'hash1',
      username: 'FirstUser',
      role: 'creator',
    });
    await repo.create(first);

    const second = new User({
      email,
      passwordHash: 'hash2',
      username: 'SecondUser',
      role: 'creator',
    });

    try {
      await expect(repo.create(second)).rejects.toMatchObject<Partial<DomainError>>({
        code: 'ALREADY_EXISTS',
      });
    } finally {
      await repo.delete(first.id);
    }
  });

  it('returns NOT_FOUND for non-existent ID', async () => {
    await expect(
      repo.getByID('00000000-0000-0000-0000-000000000000'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: 'NOT_FOUND',
    });
  });

  it('prevents SQL injection in getByEmail and returns NOT_FOUND', async () => {
    const email = `${uniq('safe')}@example.com`;
    const user = new User({
      email,
      passwordHash: 'secret_hash',
      username: 'SafeUser',
      role: 'listener',
    });
    await repo.create(user);

    try {
      await expect(repo.getByEmail("' OR '1'='1")).rejects.toMatchObject<
        Partial<DomainError>
      >({
        code: 'NOT_FOUND',
      });
    } finally {
      await repo.delete(user.id);
    }
  });
});