import { Router } from 'express';
import {
  initiateLogin,
  googleCallback,
  getMe,
  logoutUser,
  refreshAccessToken
} from '../controllers/authController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/google', asyncHandler(initiateLogin));
router.get('/google/callback', asyncHandler(googleCallback));
router.post('/refresh-token', asyncHandler(refreshAccessToken));
router.get('/me', verifyJWT, asyncHandler(getMe));
router.post('/logout', asyncHandler(logoutUser));

export default router;
