import { z } from 'zod';

/** Numeric id coming from the URL (`:id`), coerced from string. */
const idParam = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

const productBody = z.object({
  name: z.string().trim().min(1, 'name is required').max(255),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce
    .number()
    .nonnegative('price must be zero or greater')
    .max(99999999.99, 'price is out of range'),
  stock: z.coerce
    .number()
    .int('stock must be an integer')
    .nonnegative('stock must be zero or greater')
    .default(0),
});

export const createProductSchema = z.object({
  body: productBody,
});

/** On update every field is optional, but at least one must be present. */
export const updateProductSchema = z.object({
  params: idParam,
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const productIdSchema = z.object({
  params: idParam,
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsSchema>['query'];
