import ContentType, { IContentType, IContentTypeField } from './contentType.model';
import Tags from '../tags/tags.model';
import Contents from '../contents/contents.model';
import { getAccessFilter } from '../../utils/accessFilter';
import { Request } from 'express';

export interface CreateContentTypeData {
  tags?: string;
  contentTypeName: string;
  contentTypeList: IContentTypeField[];
}

export interface UpdateContentTypeData {
  tags?: string;
  contentTypeName?: string;
  contentTypeList?: IContentTypeField[];
}

export interface ContentTypeFilterOptions {
  contentType?: string;
  fromDate?: string;
  toDate?: string;
}

export class ContentTypeService {
  // Create content type
  async createContentType(contentTypeData: CreateContentTypeData, userId: string): Promise<IContentType> {
    // Check if content type name already exists
    const existingContentType = await ContentType.findOne({ contentTypeName: contentTypeData.contentTypeName });
    if (existingContentType) {
      throw new Error('Content type with this name already exists');
    }

    // Validate tags if provided
    if (contentTypeData.tags) {
      const existingTag = await Tags.findOne({ tagName: contentTypeData.tags });
      if (!existingTag) {
        throw new Error(`Tag "${contentTypeData.tags}" does not exist in the database`);
      }
    }

    const contentType = new ContentType({
      ...contentTypeData,
      createdBy: userId
    });
    return await contentType.save();
  }

  // Get all content types with optional filters
  async getAllContentTypes(filters?: ContentTypeFilterOptions, req?: Request): Promise<IContentType[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'contentType');
      Object.assign(query, accessFilter);
    }
    
    // Build the query based on filters
    if (filters) {
      // Content type filter
      if (filters.contentType) {
        query.contentTypeName = { $regex: filters.contentType, $options: 'i' };
      }

      // Date range filters
      if (filters.fromDate || filters.toDate) {
        query.createdAt = {};
        
        if (filters.fromDate) {
          query.createdAt.$gte = new Date(filters.fromDate);
        }
        
        if (filters.toDate) {
          query.createdAt.$lte = new Date(filters.toDate);
        }
      }
    }

    return await ContentType.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  // Get content type by ID
  async getContentTypeById(id: string): Promise<IContentType | null> {
    return await ContentType.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  // Update content type
  async updateContentType(id: string, contentTypeData: UpdateContentTypeData, userId: string): Promise<IContentType | null> {
    const contentType = await ContentType.findById(id);
    if (!contentType) {
      throw new Error('Content type not found');
    }

    // If content type name is being updated, check if it's already taken
    if (contentTypeData.contentTypeName && contentTypeData.contentTypeName !== contentType.contentTypeName) {
      const existingContentType = await ContentType.findOne({ contentTypeName: contentTypeData.contentTypeName });
      if (existingContentType) {
        throw new Error('Content type name is already taken');
      }
    }

    // Validate tags if provided
    if (contentTypeData.tags) {
      const existingTag = await Tags.findOne({ tagName: contentTypeData.tags });
      if (!existingTag) {
        throw new Error(`Tag "${contentTypeData.tags}" does not exist in the database`);
      }
    }

    return await ContentType.findByIdAndUpdate(
      id, 
      {
        ...contentTypeData,
        updatedBy: userId
      }, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('updatedBy', 'firstName lastName email');
  }

  // Delete content type
  async deleteContentType(id: string): Promise<boolean> {
    const contentType = await ContentType.findByIdAndDelete(id);
    return !!contentType;
  }

  // Get content types count
  async getContentTypesCount(): Promise<number> {
    return await ContentType.countDocuments();
  }

  // Get content types by tag
  async getContentTypesByTag(tagName: string, req?: Request): Promise<IContentType[]> {
    const query: any = { tags: tagName };
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'contentType');
      Object.assign(query, accessFilter);
    }
    
    return await ContentType.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  // Get contents by content type name
  async getContentsByContentTypeName(contentTypeName: string, req?: Request): Promise<any[]> {
    // First find the content type by name
    const contentTypeQuery: any = { contentTypeName };
    
    // Apply access-based filter for content type lookup
    if (req) {
      const accessFilter = getAccessFilter(req, 'contentType');
      Object.assign(contentTypeQuery, accessFilter);
    }
    
    const contentType = await ContentType.findOne(contentTypeQuery);
    if (!contentType) {
      throw new Error('Content type not found');
    }

    // Then find all contents for this content type with access filter
    const contentsQuery: any = { contentTypeId: contentType._id };
    
    // Apply access-based filter for contents
    if (req) {
      const accessFilter = getAccessFilter(req, 'content');
      Object.assign(contentsQuery, accessFilter);
    }

    return await Contents.find(contentsQuery)
      .populate('contentTypeId', 'contentTypeName tags')
      .sort({ createdAt: -1 });
  }
}

export default new ContentTypeService(); 