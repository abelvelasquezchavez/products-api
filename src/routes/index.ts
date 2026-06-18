import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router;
