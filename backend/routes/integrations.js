import { Router } from 'express';
import {
  connectPlatform,
  getConnectionStatus,
  updateConnection,
  disconnectPlatform
} from '../controllers/integrationsController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/:platform', verifyJWT, asyncHandler(connectPlatform));
router.get('/status', verifyJWT, asyncHandler(getConnectionStatus));
router.patch('/:platform', verifyJWT, asyncHandler(updateConnection));
router.delete('/:platform', verifyJWT, asyncHandler(disconnectPlatform));

export default router;
