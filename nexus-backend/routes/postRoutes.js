import express from 'express';
import { getPosts, createPost, likePost, addComment, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router.route('/:id/like')
  .put(protect, likePost);

router.route('/:id/comment')
  .post(protect, addComment);

router.route('/:id')
  .delete(protect, deletePost);

export default router;
