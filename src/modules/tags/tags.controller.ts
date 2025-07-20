import { Request, Response } from 'express';
import tagsService, { CreateTagsData, UpdateTagsData, TagsFilterOptions } from './tags.service';

export class TagsController {
  // Create tag
  async createTag(req: Request, res: Response) {
    try {
      const tagData: CreateTagsData = req.body;
      const tag = await tagsService.createTag(tagData, req);
      
      res.status(201).json({
        data: {
          id: tag._id,
          tagName: tag.tagName,
          description: tag.description,
          createdAt: tag.createdAt,
          createdBy: tag.createdBy
        },
        message: 'Tag created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all tags
  async getAllTags(req: Request, res: Response) {
    try {
      // Extract query parameters
      const filters: TagsFilterOptions = {};
      
      if (req.query.tagName) {
        filters.tagName = req.query.tagName as string;
      }
      
      if (req.query.fromDate) {
        filters.fromDate = req.query.fromDate as string;
      }
      
      if (req.query.toDate) {
        filters.toDate = req.query.toDate as string;
      }

      const tags = await tagsService.getAllTags(Object.keys(filters).length > 0 ? filters : undefined, req);
      
      res.status(200).json({
        data: tags,
        message: 'Tags fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get tag by ID
  async getTagById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tag = await tagsService.getTagById(id);
      
      if (!tag) {
        return res.status(404).json({
          data: null,
          message: 'Tag not found'
        });
      }

      res.status(200).json({
        data: tag,
        message: 'Tag fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update tag
  async updateTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tagData: UpdateTagsData = req.body;
      const tag = await tagsService.updateTag(id, tagData);
      
      if (!tag) {
        return res.status(404).json({
          data: null,
          message: 'Tag not found'
        });
      }

      res.status(200).json({
        data: {
          id: tag._id,
          tagName: tag.tagName,
          description: tag.description,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt
        },
        message: 'Tag updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete tag
  async deleteTag(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await tagsService.deleteTag(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'Tag not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'Tag deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get tags count
  async getTagsCount(req: Request, res: Response) {
    try {
      const count = await tagsService.getTagsCount();
      
      res.status(200).json({
        data: { count },
        message: 'Tags count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new TagsController(); 