import express from 'express';
import { uploadMedia, getMedia, likeMedia, unlikeMedia, getPublicMedia } from '../controllers/media.controller';
import { upload } from '../middlewares/upload';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadMedia);

router.get('/',authenticateToken, getMedia);
router.get('/public', getPublicMedia)


router.post('/:id/like', authenticateToken, likeMedia);
router.post('/:id/dislike', authenticateToken, unlikeMedia);

export default router;
