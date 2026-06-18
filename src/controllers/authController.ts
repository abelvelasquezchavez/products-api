import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/authService';
import { LoginInput, RegisterInput } from '../schemas/authSchema';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RegisterInput;
    const result = await authService.register(body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginInput;
    const result = await authService.login(body);
    res.status(200).json(result);
  }),
};
