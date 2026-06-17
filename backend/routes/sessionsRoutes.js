import express from 'express';
import { getSessions, upsertSession, leaveSession, heartbeat } from '../controllers/sessionsController.js';

const router = express.Router();

router.get('/', getSessions);
router.post('/', upsertSession);
router.post('/leave', leaveSession);
router.post('/heartbeat', heartbeat);

export default router;
