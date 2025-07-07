import { Router } from 'express';
import tagsController from './tags.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.post('/', authorization, tagsController.createTag);
router.get('/', authorization, tagsController.getAllTags);
router.get('/count', authorization, tagsController.getTagsCount);
router.get('/:id', authorization, tagsController.getTagById);
router.put('/:id', authorization, tagsController.updateTag);
router.delete('/:id', authorization, tagsController.deleteTag);

export default router; 