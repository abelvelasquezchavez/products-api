import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

const prisma = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $disconnect: vi.fn(),
}));

vi.mock('../src/config/prisma', () => ({ prisma }));

import { app } from '../src/app';

describe('POST /api/auth/register', () => {
  it('creates a user and returns a JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'jane@example.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'supersecret' });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toEqual({ id: 1, email: 'jane@example.com' });
  });

  it('returns 409 when the email is already registered', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'jane@example.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'jane@example.com', password: 'supersecret' });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });

  it('returns 400 when the payload is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 for unknown credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'supersecret' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });
});
