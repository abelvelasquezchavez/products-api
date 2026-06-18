import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { productService } from '../services/productService';
import {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '../schemas/productSchema';

/**
 * HTTP layer for products. Controllers stay thin: they read the (already
 * validated) request, delegate to the service and shape the response.
 */
export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListProductsQuery;
    const result = await productService.list(query);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    res.status(200).json({ data: product });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateProductInput;
    const product = await productService.create(body);
    res.status(201).json({ data: product });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const body = req.body as UpdateProductInput;
    const product = await productService.update(id, body);
    res.status(200).json({ data: product });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await productService.remove(id);
    res.status(204).send();
  }),
};
