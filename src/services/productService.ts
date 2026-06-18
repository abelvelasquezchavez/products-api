import { Product } from '@prisma/client';
import { productRepository } from '../repositories/productRepository';
import { NotFoundError } from '../utils/AppError';
import {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '../schemas/productSchema';

/** Shape returned to clients — `price` is exposed as a plain number. */
export interface ProductDTO {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: ProductDTO[];
  pagination: PaginationMeta;
}

/** Converts a Prisma `Product` (with a Decimal price) into a clean DTO. */
function toDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export const productService = {
  async list({ page, limit }: ListProductsQuery): Promise<PaginatedProducts> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      productRepository.findMany({ skip, take: limit }),
      productRepository.count(),
    ]);

    return {
      data: items.map(toDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number): Promise<ProductDTO> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with id ${id} not found`);
    }
    return toDTO(product);
  },

  async create(input: CreateProductInput): Promise<ProductDTO> {
    const product = await productRepository.create({
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock,
    });
    return toDTO(product);
  },

  async update(id: number, input: UpdateProductInput): Promise<ProductDTO> {
    // Ensure the product exists so we return a clean 404 instead of a raw
    // Prisma "record not found" error.
    await this.getById(id);
    const product = await productRepository.update(id, input);
    return toDTO(product);
  },

  async remove(id: number): Promise<void> {
    await this.getById(id);
    await productRepository.delete(id);
  },
};
