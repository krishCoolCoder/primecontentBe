import { Request, Response } from 'express';
import contentTypeService, { CreateContentTypeData, UpdateContentTypeData, ContentTypeFilterOptions } from './contentType.service';

interface AuthRequest extends Request {
  user?: any;
}

export class ContentTypeController {
  // Create content type
  async createContentType(req: AuthRequest, res: Response) {
    try {
      const contentTypeData: CreateContentTypeData = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          data: null,
          message: 'User ID not found in token'
        });
      }

      const contentType = await contentTypeService.createContentType(contentTypeData, userId);
      
      res.status(201).json({
        data: {
          id: contentType._id,
          tags: contentType.tags,
          contentTypeName: contentType.contentTypeName,
          contentTypeList: contentType.contentTypeList,
          createdAt: contentType.createdAt,
          createdBy: contentType.createdBy
        },
        message: 'Content type created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all content types
  async getAllContentTypes(req: Request, res: Response) {
    try {
      // Extract query parameters
      const filters: ContentTypeFilterOptions = {};
      
      if (req.query.contentType) {
        filters.contentType = req.query.contentType as string;
      }
      
      if (req.query.fromDate) {
        filters.fromDate = req.query.fromDate as string;
      }
      
      if (req.query.toDate) {
        filters.toDate = req.query.toDate as string;
      }

      const contentTypes = await contentTypeService.getAllContentTypes(Object.keys(filters).length > 0 ? filters : undefined, req);
      
      res.status(200).json({
        data: contentTypes,
        message: 'Content types fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get content type by ID
  async getContentTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contentType = await contentTypeService.getContentTypeById(id);
      
      if (!contentType) {
        return res.status(404).json({
          data: null,
          message: 'Content type not found'
        });
      }

      res.status(200).json({
        data: contentType,
        message: 'Content type fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update content type
  async updateContentType(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const contentTypeData: UpdateContentTypeData = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          data: null,
          message: 'User ID not found in token'
        });
      }

      const contentType = await contentTypeService.updateContentType(id, contentTypeData, userId);
      
      if (!contentType) {
        return res.status(404).json({
          data: null,
          message: 'Content type not found'
        });
      }

      res.status(200).json({
        data: {
          id: contentType._id,
          tags: contentType.tags,
          contentTypeName: contentType.contentTypeName,
          contentTypeList: contentType.contentTypeList,
          createdAt: contentType.createdAt,
          createdBy: contentType.createdBy,
          updatedAt: contentType.updatedAt,
          updatedBy: contentType.updatedBy
        },
        message: 'Content type updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete content type
  async deleteContentType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await contentTypeService.deleteContentType(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'Content type not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'Content type deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get content types count
  async getContentTypesCount(req: Request, res: Response) {
    try {
      const count = await contentTypeService.getContentTypesCount();
      
      res.status(200).json({
        data: { count },
        message: 'Content types count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get content types by tag
  async getContentTypesByTag(req: Request, res: Response) {
    try {
      const { tagName } = req.params;
      const contentTypes = await contentTypeService.getContentTypesByTag(tagName, req);
      
      res.status(200).json({
        data: contentTypes,
        message: `Content types for tag "${tagName}" fetched successfully`
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get contents by content type name
  async getContentsByContentTypeName(req: Request, res: Response) {
    try {
      const { contentTypeName } = req.params;
      const contents = await contentTypeService.getContentsByContentTypeName(contentTypeName, req);
      
      res.status(200).json({
        data: contents,
        message: `Contents for content type "${contentTypeName}" fetched successfully`
      });
    } catch (error: any) {
      res.status(404).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new ContentTypeController(); 