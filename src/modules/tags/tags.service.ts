import Tags, { ITags } from './tags.model';

export interface CreateTagsData {
  tagName: string;
  description: string;
}

export interface UpdateTagsData {
  tagName?: string;
  description?: string;
}

export class TagsService {
  // Create tag
  async createTag(tagData: CreateTagsData): Promise<ITags> {
    const existingTag = await Tags.findOne({ tagName: tagData.tagName });
    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    const tag = new Tags(tagData);
    return await tag.save();
  }

  // Get all tags
  async getAllTags(): Promise<ITags[]> {
    return await Tags.find().sort({ createdAt: -1 });
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