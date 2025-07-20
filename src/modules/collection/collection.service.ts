import Collection, { ICollection, IFilter } from './collection.model';
import ContentType from '../contentType/contentType.model';
import Contents from '../contents/contents.model';
import { getAccessFilter } from '../../utils/accessFilter';
import { Request } from 'express';

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

export interface CollectionFilterOptions {
  collectionName?: string;
  fromDate?: string;
  toDate?: string;
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
  async getAllCollections(filters?: CollectionFilterOptions, req?: Request): Promise<ICollection[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'collections');
      Object.assign(query, accessFilter);
    }
    
    // Build the query based on filters
    if (filters) {
      // Collection name filter
      if (filters.collectionName) {
        query.collectionName = { $regex: filters.collectionName, $options: 'i' };
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

    return await Collection.find(query)
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
  async getCollectionContents(collectionName: string, queryParams: any, req?: Request): Promise<any> {
    // Get collection by name with access filter
    const collectionQuery: any = { collectionName };
    
    // Apply access-based filter for collection lookup
    if (req) {
      const accessFilter = getAccessFilter(req, 'collections');
      Object.assign(collectionQuery, accessFilter);
    }
    
    const collection = await Collection.findOne(collectionQuery)
      .populate('contentTypeId');
    
    if (!collection) {
      throw new Error('Collection not found');
    }

    console.log('Collection filters:', JSON.stringify(collection.filters, null, 2));
    console.log('Query parameters:', queryParams);

    // Validate mandatory filters
    const mandatoryFilters = collection.filters.filter(filter => filter.isMandatory);
    for (const mandatoryFilter of mandatoryFilters) {
      if (!queryParams[mandatoryFilter.filterName]) {
        throw new Error(`Mandatory filter '${mandatoryFilter.filterName}' is required`);
      }
    }

    // If we have filter criteria, we need to use aggregation
    const hasFilterParams = collection.filters.some(filter => queryParams[filter.filterName]);
    
    if (collection.filters.length > 0 && hasFilterParams) {
      const matchConditions: any[] = [
        { contentTypeId: collection.contentTypeId._id }
      ];
      
      // Apply access-based filter for contents
      if (req) {
        const contentAccessFilter = getAccessFilter(req, 'content');
        if (Object.keys(contentAccessFilter).length > 0) {
          matchConditions.push(contentAccessFilter);
        }
      }

      // Add filter conditions
      for (const filter of collection.filters) {
        const filterValue = queryParams[filter.filterName];
        if (filterValue) {
          console.log(`Applying filter: ${filter.filterName} = ${filterValue} on field: ${filter.fieldName}`);
          matchConditions.push({
            contentFields: {
              $elemMatch: {
                fieldName: { $regex: `^${filter.fieldName}$`, $options: 'i' },
                fieldValue: { $regex: filterValue, $options: 'i' }
              }
            }
          });
        }
      }

      console.log('Match conditions:', JSON.stringify(matchConditions, null, 2));

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

      console.log(`Found ${contents.length} contents after filtering`);
      return contents;
    } else {
      // No filters applied, return all contents for this content type with access filter
      const contentsQuery: any = { contentTypeId: collection.contentTypeId._id };
      
      // Apply access-based filter for contents
      if (req) {
        const contentAccessFilter = getAccessFilter(req, 'content');
        Object.assign(contentsQuery, contentAccessFilter);
      }
      
      return await Contents.find(contentsQuery)
        .populate('contentTypeId', 'contentTypeName')
        .sort({ createdAt: -1 });
    }
  }
}

export default new CollectionService(); 