import { Router } from 'express';
import userAccessController from './userAccess.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.get('/', authorization, userAccessController.getAllUserAccess);
router.get('/count', authorization, userAccessController.getUserAccessCount);
router.get('/role/:roleId', authorization, userAccessController.getUserAccessByRoleId);
router.get('/:id', authorization, userAccessController.getUserAccessById);
router.put('/:id', authorization, userAccessController.updateUserAccess);

export default router; 