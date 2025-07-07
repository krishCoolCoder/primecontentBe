import { Router } from 'express';
import contentsController from './contents.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.post('/', authorization, contentsController.createContent);
router.get('/', authorization, contentsController.getAllContents);
router.get('/count', authorization, contentsController.getContentsCount);
router.get('/content-type/:contentTypeId', authorization, contentsController.getContentsByContentType);
router.get('/content-type/:contentTypeId/count', authorization, contentsController.getContentsCountByContentType);
router.get('/:id', authorization, contentsController.getContentById);
router.put('/:id', authorization, contentsController.updateContent);
router.delete('/:id', authorization, contentsController.deleteContent);

export default router; 