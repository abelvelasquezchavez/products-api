import { Prisma, Product } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface FindManyOptions {
  skip: number;
  take: number;
}

/**
 * Data-access layer for products. This is the only place that talks to Prisma
 * for the `Product` model, keeping persistence concerns out of the services.
 */
export const productRepository = {
  findMany({ skip, take }: FindManyOptions): Promise<Product[]> {
    return prisma.product.findMany({
      skip,
      take,
      orderBy: { id: 'asc' },
    });
  },

  count(): Promise<number> {
    return prisma.product.count();
  },

  findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  },

  update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  },

  delete(id: number): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  },
};
