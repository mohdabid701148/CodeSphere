import { Router } from 'express';
import {
  getProfileBySlug,
  updateProfile,
  togglePrivacy
} from '../controllers/profileController.js';
import { verifyJWT, verifyJWTOptional } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/:slug', verifyJWTOptional, asyncHandler(getProfileBySlug));
router.patch('/', verifyJWT, asyncHandler(updateProfile));
router.patch('/privacy', verifyJWT, asyncHandler(togglePrivacy));

export default router;
