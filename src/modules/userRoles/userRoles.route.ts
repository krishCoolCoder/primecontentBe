import { Router } from 'express';
import userRolesController from './userRoles.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.post('/', authorization, userRolesController.createUserRole);
router.get('/', authorization, userRolesController.getAllUserRoles);
router.get('/count', authorization, userRolesController.getUserRolesCount);
router.get('/tag/:tagId', authorization, userRolesController.getUserRolesByTag);
router.get('/:id', authorization, userRolesController.getUserRoleById);
router.put('/:id', authorization, userRolesController.updateUserRole);
router.delete('/:id', authorization, userRolesController.deleteUserRole);

export default router; 