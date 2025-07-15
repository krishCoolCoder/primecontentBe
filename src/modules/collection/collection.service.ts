import Collection, { ICollection, IFilter } from './collection.model';
import ContentType from '../contentType/contentType.model';
import Contents from '../contents/contents.model';

export interface CreateCollectionData {
  collectionName: string;
  api: string;
  contentTypeId: string;
  filters?: IFilter[];
}

export interface UpdateCollectionData {
  collectionName?: string;
  api?: string;
  contentTypeId?: string;
  filters?: IFilter[];
}

export class CollectionService {
  // Create collection
  async createCollection(collectionData: CreateCollectionData): Promise<ICollection> {
    // Check if collection name already exists
    const existingCollection = await Collection.findOne({ collectionName: collectionData.collectionName });
    if (existingCollection) {
      throw new Error('Collection with this name already exists');
    }

    // Validate content type exists
    const contentType = await ContentType.findById(collectionData.contentTypeId);
    if (!contentType) {
      throw new Error('Content type not found');
    }

    const collection = new Collection({
      collectionName: collectionData.collectionName,
      api: collectionData.api,
      contentTypeId: collectionData.contentTypeId,
      filters: collectionData.filters || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return await collection.save();
  }

  // Get all collections
  async getAllCollections(): Promise<ICollection[]> {
    return await Collection.find()
      .populate('contentTypeId', 'contentTypeName')
      .populate({ path: 'createdBy', select: 'firstName lastName email' })
      .populate({ path: 'updatedBy', select: 'firstName lastName email' })
      .sort({ createdAt: -1 });
  }

  // Get collection by ID
  async getCollectionById(id: string): Promise<ICollection | null> {
    return await Collection.findById(id)
      .populate('contentTypeId', 'contentTypeName')
      .populate({ path: 'createdBy', select: 'firstName lastName email' })
      .populate({ path: 'updatedBy', select: 'firstName lastName email' });
  }

  // Get collection by name
  async getCollectionByName(collectionName: string): Promise<ICollection | null> {
    return await Collection.findOne({ collectionName })
      .populate('contentTypeId', 'contentTypeName')
      .populate({ path: 'createdBy', select: 'firstName lastName email' })
      .populate({ path: 'updatedBy', select: 'firstName lastName email' });
  }

  // Update collection
  async updateCollection(id: string, collectionData: UpdateCollectionData): Promise<ICollection | null> {
    const collection = await Collection.findById(id);
    if (!collection) {
      throw new Error('Collection not found');
    }

    // If collection name is being updated, check if it's already taken
    if (collectionData.collectionName && collectionData.collectionName !== collection.collectionName) {
      const existingCollection = await Collection.findOne({ collectionName: collectionData.collectionName });
      if (existingCollection) {
        throw new Error('Collection name is already taken');
      }
    }

    // Validate content type if provided
    if (collectionData.contentTypeId) {
      const contentType = await ContentType.findById(collectionData.contentTypeId);
      if (!contentType) {
        throw new Error('Content type not found');
      }
    }

    return await Collection.findByIdAndUpdate(
      id,
      {
        ...collectionData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('contentTypeId', 'contentTypeName')
     .populate({ path: 'createdBy', select: 'firstName lastName email' })
     .populate({ path: 'updatedBy', select: 'firstName lastName email' });
  }

  // Delete collection
  async deleteCollection(id: string): Promise<boolean> {
    const collection = await Collection.findByIdAndDelete(id);
    return !!collection;
  }

  // Get collection count
  async getCollectionCount(): Promise<number> {
    return await Collection.countDocuments();
  }

  // Get collection contents with filtering
  async getCollectionContents(collectionName: string, queryParams: any): Promise<any> {
    // Get collection by name
    const collection = await Collection.findOne({ collectionName })
      .populate('contentTypeId');
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    // Validate mandatory filters
    const mandatoryFilters = collection.filters.filter(filter => filter.isMandatory);
    for (const mandatoryFilter of mandatoryFilters) {
      if (!queryParams[mandatoryFilter.filterName]) {
        throw new Error(`Mandatory filter '${mandatoryFilter.filterName}' is required`);
      }
    }

    // Build query for contents
    const contentsQuery: any = {
      contentTypeId: collection.contentTypeId._id
    };

    // Apply filters
    for (const filter of collection.filters) {
      const filterValue = queryParams[filter.filterName];
      if (filterValue) {
        // Find the field in contentFields array
        contentsQuery[`contentFields.fieldName`] = filter.fieldName;
        contentsQuery[`contentFields.fieldValue`] = filterValue;
      }
    }

    // If we have filter criteria, we need to use aggregation
    if (collection.filters.length > 0 && Object.keys(queryParams).length > 0) {
      const matchConditions: any[] = [
        { contentTypeId: collection.contentTypeId._id }
      ];

      // Add filter conditions
      for (const filter of collection.filters) {
        const filterValue = queryParams[filter.filterName];
        if (filterValue) {
          matchConditions.push({
            contentFields: {
              $elemMatch: {
                fieldName: filter.fieldName,
                fieldValue: filterValue
              }
            }
          });
        }
      }

      const contents = await Contents.aggregate([
        {
          $match: {
            $and: matchConditions
          }
        },
        {
          $lookup: {
            from: 'contenttypes',
            localField: 'contentTypeId',
            foreignField: '_id',
            as: 'contentType'
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      return contents;
    } else {
      // No filters applied, return all contents for this content type
      return await Contents.find({ contentTypeId: collection.contentTypeId._id })
        .populate('contentTypeId', 'contentTypeName')
        .sort({ createdAt: -1 });
    }
  }
}

export default new CollectionService(); 