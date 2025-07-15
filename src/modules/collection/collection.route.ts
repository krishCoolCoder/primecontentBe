import { Router } from 'express';
import collectionController from './collection.controller';
import { authorization } from '../../middleware/authorization';

const router = Router();

// All routes require authorization
router.post('/', authorization, collectionController.createCollection);
router.get('/', authorization, collectionController.getAllCollections);
router.get('/count', authorization, collectionController.getCollectionCount);
router.get('/:collectionName/contents', authorization, collectionController.getCollectionContents);
router.get('/:id', authorization, collectionController.getCollectionById);
router.put('/:id', authorization, collectionController.updateCollection);
router.delete('/:id', authorization, collectionController.deleteCollection);

// Special route for getting collection contents by collection name

export default router; 