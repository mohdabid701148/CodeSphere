import { Router } from 'express';
import {
  syncGitHubStats,
  syncCodeforcesStats,
  syncAllStats,
  getDashboardStats,
  getGitHubStats,
  getCodeforcesStats
} from '../controllers/syncController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/github', verifyJWT, asyncHandler(syncGitHubStats));
router.post('/codeforces', verifyJWT, asyncHandler(syncCodeforcesStats));
router.post('/all', verifyJWT, asyncHandler(syncAllStats));
router.get('/', verifyJWT, asyncHandler(getDashboardStats));
router.get('/github', verifyJWT, asyncHandler(getGitHubStats));
router.get('/codeforces', verifyJWT, asyncHandler(getCodeforcesStats));

export default router;
