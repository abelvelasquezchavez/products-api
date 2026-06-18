import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock the Prisma client before importing the app. `vi.hoisted` guarantees the
// mock object exists when the (hoisted) `vi.mock` factory runs.
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

const sampleProduct = {
  id: 1,
  name: 'Keyboard',
  description: 'Mechanical keyboard',
  price: '49.99',
  stock: 10,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('GET /api/health', () => {
  it('returns 200 with an ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/products', () => {
  it('returns a paginated list of products', async () => {
    prisma.product.findMany.mockResolvedValue([sampleProduct]);
    prisma.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ id: 1, name: 'Keyboard', price: 49.99 });
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { id: 'asc' },
    });
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product when it exists', async () => {
    prisma.product.findUnique.mockResolvedValue(sampleProduct);

    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 1, name: 'Keyboard', price: 49.99 });
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('returns 404 when the product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});

describe('POST /api/products', () => {
  it('returns 401 when no auth token is provided', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'New', price: 9.99, stock: 1 });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(prisma.product.create).not.toHaveBeenCalled();
  });
});
