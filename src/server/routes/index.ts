import { Router } from 'express';
import { songsRouter } from './songs';
import { productsRouter } from './products';
import { usersRouter } from './users';
import { authRouter } from './auth';
import { ordersRouter } from './orders';
import { bandsRouter } from './bands';
import { searchRouter } from './search';
import { auth } from '../middleware/auth';

const router = Router();

router.use('/auth', authRouter);
router.use('/songs', auth, songsRouter);
router.use('/products', auth, productsRouter);
router.use('/users', auth, usersRouter);
router.use('/orders', auth, ordersRouter);
router.use('/bands', bandsRouter);
router.use('/search', auth, searchRouter);

export { router };