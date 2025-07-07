import mongoose, { Schema, Document } from 'mongoose';

export interface IContentTypeField {
  fieldName: string;
  fieldType: 'String' | 'Text' | 'Number' | 'Date' | 'Boolean' | 'Array' | 'Object';
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentType extends Document {
  _id: mongoose.Types.ObjectId;
  tags?: string;
  contentTypeName: string;
  contentTypeList: IContentTypeField[];
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const contentTypeFieldSchema = new Schema<IContentTypeField>({
  fieldName: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  fieldType: {
    type: String,
    required: [true, 'Field type is required'],
    enum: ['String', 'Text', 'Number', 'Date', 'Boolean', 'Array', 'Object'],
    default: 'String'
  }
}, {
  timestamps: true
});

const contentTypeSchema = new Schema<IContentType>({
  tags: {
    type: String,
    required: false,
    trim: true
  },
  contentTypeName: {
    type: String,
    required: [true, 'Content type name is required'],
    unique: true,
    trim: true
  },
  contentTypeList: {
    type: [contentTypeFieldSchema],
    required: [true, 'Content type list is required'],
    validate: {
      validator: function(contentTypeList: IContentTypeField[]) {
        return contentTypeList && contentTypeList.length > 0;
      },
      message: 'Content type list must have at least one field'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IContentType>('ContentType', contentTypeSchema); 