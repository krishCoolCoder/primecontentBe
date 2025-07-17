import { Router } from 'express';
import contentTypeController from './contentType.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.post('/', authorization, contentTypeController.createContentType);
router.get('/', authorization, contentTypeController.getAllContentTypes);
router.get('/count', authorization, contentTypeController.getContentTypesCount);
router.get('/list/:contentTypeName', authorization, contentTypeController.getContentsByContentTypeName);
router.get('/tag/:tagName', authorization, contentTypeController.getContentTypesByTag);
router.get('/:id', authorization, contentTypeController.getContentTypeById);
router.put('/:id', authorization, contentTypeController.updateContentType);
router.delete('/:id', authorization, contentTypeController.deleteContentType);

export default router; 