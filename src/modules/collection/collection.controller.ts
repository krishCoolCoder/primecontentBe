import { Request, Response } from 'express';
import collectionService, { 
  CreateCollectionData, 
  UpdateCollectionData
} from './collection.service';

// Define filter options locally
interface CollectionFilterOptions {
  collectionName?: string;
  fromDate?: string;
  toDate?: string;
}

export class CollectionController {
  // Create collection
  async createCollection(req: Request, res: Response) {
    try {
      const collectionData: CreateCollectionData = req.body;
      const collection = await collectionService.createCollection(collectionData);
      
      res.status(201).json({
        data: collection,
        message: 'Collection created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all collections
  async getAllCollections(req: Request, res: Response) {
    try {
      // Extract query parameters
      const filters: CollectionFilterOptions = {};
      
      if (req.query.collectionName) {
        filters.collectionName = req.query.collectionName as string;
      }
      
      if (req.query.fromDate) {
        filters.fromDate = req.query.fromDate as string;
      }
      
      if (req.query.toDate) {
        filters.toDate = req.query.toDate as string;
      }

      const collections = await collectionService.getAllCollections(Object.keys(filters).length > 0 ? filters : undefined, req);
      
      res.status(200).json({
        data: collections,
        message: 'Collections fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get collection by ID
  async getCollectionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collection = await collectionService.getCollectionById(id);
      
      if (!collection) {
        return res.status(404).json({
          data: null,
          message: 'Collection not found'
        });
      }

      res.status(200).json({
        data: collection,
        message: 'Collection fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update collection
  async updateCollection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collectionData: UpdateCollectionData = req.body;
      const collection = await collectionService.updateCollection(id, collectionData);
      
      if (!collection) {
        return res.status(404).json({
          data: null,
          message: 'Collection not found'
        });
      }

      res.status(200).json({
        data: collection,
        message: 'Collection updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete collection
  async deleteCollection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await collectionService.deleteCollection(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'Collection not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'Collection deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get collection count
  async getCollectionCount(req: Request, res: Response) {
    try {
      const count = await collectionService.getCollectionCount();
      
      res.status(200).json({
        data: { count },
        message: 'Collection count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get collection contents by collection name with filtering
  async getCollectionContents(req: Request, res: Response) {
    try {
      const { collectionName } = req.params;
      const queryParams = req.query;
      
      const contents = await collectionService.getCollectionContents(collectionName, queryParams, req);
      
      res.status(200).json({
        data: contents,
        message: `Contents for collection "${collectionName}" fetched successfully`
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new CollectionController(); 