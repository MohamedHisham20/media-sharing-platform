import express from 'express';
import { uploadMedia, getMedia, likeMedia, unlikeMedia } from '../controllers/media.controller';
import { upload } from '../middlewares/upload';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadMedia);
router.get('/', getMedia);
router.post('/:id/like', likeMedia);
router.post('/:id/unlike', unlikeMedia);

export default router;
