import { Router } from 'express';
import userController from './user.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// Public routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

// Protected routes (require authentication)
router.get('/', authorization, userController.getAllUsers);
router.get('/count', authorization, userController.getUserCount);
router.get('/:id', authorization, userController.getUserById);
router.put('/:id', authorization, userController.updateUser);
router.delete('/:id', authorization, userController.deleteUser);

export default router; 