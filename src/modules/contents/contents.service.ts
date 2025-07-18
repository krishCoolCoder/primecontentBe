import Contents, { IContents, IContentField } from './contents.model';
import ContentType from '../contentType/contentType.model';

export interface CreateContentsData {
  contentType: string;
  contentTypeId: string;
  contentFields: IContentField[];
}

export interface UpdateContentsData {
  contentFields: IContentField[];
}

export interface ContentsFilterOptions {
  contentType?: string;
  fromDate?: string;
  toDate?: string;
}

export class ContentsService {
  // Create content
  async createContent(contentData: CreateContentsData): Promise<IContents> {
    // Validate content type exists
    const contentType = await ContentType.findById(contentData.contentTypeId);
    if (!contentType) {
      throw new Error('Content type not found');
    }

    // Validate content type name matches
    if (contentType.contentTypeName !== contentData.contentType) {
      throw new Error(`Content type name "${contentData.contentType}" does not match the content type ID`);
    }

    // Validate and process content fields
    const validatedFields = this.validateAndProcessFields(contentData.contentFields, contentType.contentTypeList);

    const content = new Contents({
      contentType: contentData.contentType,
      contentTypeId: contentData.contentTypeId,
      contentFields: validatedFields
    });
    return await content.save();
  }

  // Get all contents with optional filters
  async getAllContents(filters?: ContentsFilterOptions): Promise<IContents[]> {
    const query: any = {};
    
    // Build the query based on filters
    if (filters) {
      // Content type filter
      if (filters.contentType) {
        query.contentType = { $regex: filters.contentType, $options: 'i' };
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

    return await Contents.find(query)
      .populate('contentTypeId', 'contentTypeName tags')
      .sort({ createdAt: -1 });
  }

  // Get content by ID
  async getContentById(id: string): Promise<IContents | null> {
    return await Contents.findById(id)
      .populate('contentTypeId', 'contentTypeName tags');
  }

  // Get contents by content type
  async getContentsByContentType(contentTypeId: string): Promise<IContents[]> {
    return await Contents.find({ contentTypeId })
      .populate('contentTypeId', 'contentTypeName tags')
      .sort({ createdAt: -1 });
  }

  // Update content
  async updateContent(id: string, contentData: UpdateContentsData): Promise<IContents | null> {
    const content = await Contents.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    // Get the content type to validate fields
    const contentType = await ContentType.findById(content.contentTypeId);
    if (!contentType) {
      throw new Error('Associated content type not found');
    }

    // Validate and process content fields
    const validatedFields = this.validateAndProcessFields(contentData.contentFields, contentType.contentTypeList);

    return await Contents.findByIdAndUpdate(
      id, 
      { contentFields: validatedFields }, 
      { new: true, runValidators: true }
    ).populate('contentTypeId', 'contentTypeName tags');
  }

  // Delete content
  async deleteContent(id: string): Promise<boolean> {
    const content = await Contents.findByIdAndDelete(id);
    return !!content;
  }

  // Get contents count
  async getContentsCount(): Promise<number> {
    return await Contents.countDocuments();
  }

  // Get contents count by content type
  async getContentsCountByContentType(contentTypeId: string): Promise<number> {
    return await Contents.countDocuments({ contentTypeId });
  }

  // Validate and process content fields
  private validateAndProcessFields(contentFields: IContentField[], contentTypeList: any[]): IContentField[] {
    const validatedFields: IContentField[] = [];

    // Create a map of expected fields from content type
    const expectedFieldsMap = new Map();
    contentTypeList.forEach(field => {
      expectedFieldsMap.set(field.fieldName, field.fieldType);
    });

    // Process each content field
    contentFields.forEach(field => {
      const expectedFieldType = expectedFieldsMap.get(field.fieldName);
      
      if (expectedFieldType) {
        // Field exists in content type, validate and process value
        const processedValue = this.processFieldValue(field.fieldValue, expectedFieldType);
        validatedFields.push({
          fieldName: field.fieldName,
          fieldType: expectedFieldType,
          fieldValue: processedValue
        });
      } else {
        // Field doesn't exist in content type, skip it
        console.warn(`Field "${field.fieldName}" not found in content type definition`);
      }
    });

    // Add missing fields with default values
    contentTypeList.forEach(expectedField => {
      const existingField = validatedFields.find(field => field.fieldName === expectedField.fieldName);
      if (!existingField) {
        const defaultValue = this.getDefaultValue(expectedField.fieldType);
        validatedFields.push({
          fieldName: expectedField.fieldName,
          fieldType: expectedField.fieldType,
          fieldValue: defaultValue
        });
      }
    });

    return validatedFields;
  }

  // Process field value based on field type
  private processFieldValue(value: any, fieldType: string): any {
    switch (fieldType) {
      case 'String':
        return typeof value === 'string' ? value : '';
      case 'Text':
        return typeof value === 'string' ? value : '';
      case 'Number':
        return typeof value === 'number' && !isNaN(value) ? value : 0;
      case 'Date':
        return value instanceof Date ? value : new Date();
      case 'Boolean':
        return typeof value === 'boolean' ? value : null;
      case 'Array':
        return Array.isArray(value) ? value : [];
      case 'Object':
        return typeof value === 'object' && value !== null ? value : {};
      default:
        return value;
    }
  }

  // Get default value for field type
  private getDefaultValue(fieldType: string): any {
    switch (fieldType) {
      case 'String':
      case 'Text':
        return '';
      case 'Number':
        return 0;
      case 'Date':
        return new Date();
      case 'Boolean':
        return null;
      case 'Array':
        return [];
      case 'Object':
        return {};
      default:
        return '';
    }
  }
}

export default new ContentsService(); 