import Tags, { ITags } from './tags.model';
import { getAccessFilter } from '../../utils/accessFilter';
import { Request } from 'express';

export interface CreateTagsData {
  tagName: string;
  description: string;
}

export interface UpdateTagsData {
  tagName?: string;
  description?: string;
}

export interface TagsFilterOptions {
  tagName?: string;
  fromDate?: string;
  toDate?: string;
}

export class TagsService {
  // Create tag
  async createTag(tagData: CreateTagsData, req?: Request): Promise<ITags> {
    const existingTag = await Tags.findOne({ tagName: tagData.tagName });
    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    const tagToCreate = {
      ...tagData,
      createdBy: null,
      updatedBy: null
    };

    // Set createdBy from currentUser if available
    if (req) {
      try {
        const currentUserHeader = req.headers["currentUser"] as string;
        if (currentUserHeader) {
          const currentUser = JSON.parse(currentUserHeader);
          tagToCreate.createdBy = currentUser.userId;
        }
      } catch (error) {
        console.log('Error parsing currentUser for tag creation:', error);
      }
    }

    const tag = new Tags(tagToCreate);
    return await tag.save();
  }

  // Get all tags with optional filters and access-based filtering
  async getAllTags(filters?: TagsFilterOptions, req?: Request): Promise<ITags[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'tag');
      Object.assign(query, accessFilter);
    }
    
    // Build the query based on filters
    if (filters) {
      // Tag name filter
      if (filters.tagName) {
        query.tagName = { $regex: filters.tagName, $options: 'i' };
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

    return await Tags.find(query).sort({ createdAt: -1 });
  }

  // Get tag by ID
  async getTagById(id: string): Promise<ITags | null> {
    return await Tags.findById(id);
  }

  // Update tag
  async updateTag(id: string, tagData: UpdateTagsData): Promise<ITags | null> {
    const tag = await Tags.findById(id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    // If tagName is being updated, check if it's already taken
    if (tagData.tagName && tagData.tagName !== tag.tagName) {
      const existingTag = await Tags.findOne({ tagName: tagData.tagName });
      if (existingTag) {
        throw new Error('Tag name is already taken');
      }
    }

    return await Tags.findByIdAndUpdate(
      id, 
      tagData, 
      { new: true, runValidators: true }
    );
  }

  // Delete tag
  async deleteTag(id: string): Promise<boolean> {
    const tag = await Tags.findByIdAndDelete(id);
    return !!tag;
  }

  // Get tags count
  async getTagsCount(): Promise<number> {
    return await Tags.countDocuments();
  }
}

export default new TagsService(); 