import express from 'express';
import { getUpcomingContests } from '../controllers/contestsController.js';

const router = express.Router();

router.get('/upcoming', getUpcomingContests);

export default router;
