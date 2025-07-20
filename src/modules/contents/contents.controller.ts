import { Request, Response } from 'express';
import contentsService, { CreateContentsData, UpdateContentsData, ContentsFilterOptions } from './contents.service';

export class ContentsController {
  // Create content
  async createContent(req: Request, res: Response) {
    try {
      const contentData: CreateContentsData = req.body;
      const content = await contentsService.createContent(contentData);
      
      res.status(201).json({
        data: {
          id: content._id,
          contentType: content.contentType,
          contentTypeId: content.contentTypeId,
          contentFields: content.contentFields,
          createdAt: content.createdAt
        },
        message: 'Content created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all contents
  async getAllContents(req: Request, res: Response) {
    try {
      // Extract query parameters
      const filters: ContentsFilterOptions = {};
      
      if (req.query.contentType) {
        filters.contentType = req.query.contentType as string;
      }
      
      if (req.query.fromDate) {
        filters.fromDate = req.query.fromDate as string;
      }
      
      if (req.query.toDate) {
        filters.toDate = req.query.toDate as string;
      }

      const contents = await contentsService.getAllContents(Object.keys(filters).length > 0 ? filters : undefined, req);
      
      res.status(200).json({
        data: contents,
        message: 'Contents fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get content by ID
  async getContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await contentsService.getContentById(id);
      
      if (!content) {
        return res.status(404).json({
          data: null,
          message: 'Content not found'
        });
      }

      res.status(200).json({
        data: content,
        message: 'Content fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get contents by content type
  async getContentsByContentType(req: Request, res: Response) {
    try {
      const { contentTypeId } = req.params;
      const contents = await contentsService.getContentsByContentType(contentTypeId, req);
      
      res.status(200).json({
        data: contents,
        message: 'Contents fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update content
  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contentData: UpdateContentsData = req.body;
      const content = await contentsService.updateContent(id, contentData);
      
      if (!content) {
        return res.status(404).json({
          data: null,
          message: 'Content not found'
        });
      }

      res.status(200).json({
        data: {
          id: content._id,
          contentType: content.contentType,
          contentTypeId: content.contentTypeId,
          contentFields: content.contentFields,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt
        },
        message: 'Content updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete content
  async deleteContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await contentsService.deleteContent(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'Content not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'Content deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get contents count
  async getContentsCount(req: Request, res: Response) {
    try {
      const count = await contentsService.getContentsCount();
      
      res.status(200).json({
        data: { count },
        message: 'Contents count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get contents count by content type
  async getContentsCountByContentType(req: Request, res: Response) {
    try {
      const { contentTypeId } = req.params;
      const count = await contentsService.getContentsCountByContentType(contentTypeId);
      
      res.status(200).json({
        data: { count },
        message: 'Contents count for content type fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new ContentsController(); 