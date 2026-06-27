import { Router } from 'express';
import {
  syncPlatformStats,
  syncAllStats,
  getDashboardStats,
  getPlatformStats
} from '../controllers/syncController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', verifyJWT, asyncHandler(getDashboardStats));
router.post('/all', verifyJWT, asyncHandler(syncAllStats));
router.post('/:platform', verifyJWT, asyncHandler(syncPlatformStats));
router.get('/:platform', verifyJWT, asyncHandler(getPlatformStats));

export default router;
