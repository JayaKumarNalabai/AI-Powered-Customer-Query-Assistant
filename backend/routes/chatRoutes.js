// backend/routes/chatRoutes.js

import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);

export default router;
