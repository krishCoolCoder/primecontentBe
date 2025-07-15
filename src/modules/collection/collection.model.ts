import mongoose, { Schema, Document } from 'mongoose';

export interface IFilter {
  fieldName: string;
  filterName: string;
  isMandatory: boolean;
}

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  collectionName: string;
  api: string;
  contentTypeId: mongoose.Types.ObjectId;
  filters: IFilter[];
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId | null;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId | null;
}

const filterSchema = new Schema<IFilter>({
  fieldName: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  filterName: {
    type: String,
    required: [true, 'Filter name is required'],
    trim: true
  },
  isMandatory: {
    type: Boolean,
    default: false
  }
});

const collectionSchema = new Schema<ICollection>({
  collectionName: {
    type: String,
    required: [true, 'Collection name is required'],
    unique: true,
    trim: true
  },
  api: {
    type: String,
    required: [true, 'API URL is required'],
    trim: true
  },
  contentTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'ContentType',
    required: [true, 'Content type ID is required']
  },
  filters: {
    type: [filterSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: false // We're handling timestamps manually
});

export default mongoose.model<ICollection>('Collection', collectionSchema); 