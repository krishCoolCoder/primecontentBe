import mongoose, { Schema, Document } from 'mongoose';

export interface IContentField {
  fieldName: string;
  fieldType: string;
  fieldValue: any;
}

export interface IContents extends Document {
  _id: mongoose.Types.ObjectId;
  contentType: string;
  contentTypeId: mongoose.Types.ObjectId;
  contentFields: IContentField[];
  createdAt: Date;
  updatedAt: Date;
}

const contentFieldSchema = new Schema<IContentField>({
  fieldName: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  fieldType: {
    type: String,
    required: [true, 'Field type is required'],
    trim: true
  },
  fieldValue: {
    type: Schema.Types.Mixed,
    required: [true, 'Field value is required']
  }
});

const contentsSchema = new Schema<IContents>({
  contentType: {
    type: String,
    required: [true, 'Content type name is required'],
    trim: true
  },
  contentTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'ContentType',
    required: [true, 'Content type ID is required']
  },
  contentFields: {
    type: [contentFieldSchema],
    required: [true, 'Content fields are required'],
    validate: {
      validator: function(contentFields: IContentField[]) {
        return contentFields && contentFields.length > 0;
      },
      message: 'Content fields must have at least one field'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IContents>('Contents', contentsSchema); 