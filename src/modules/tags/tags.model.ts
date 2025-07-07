import mongoose, { Schema, Document } from 'mongoose';

export interface ITags extends Document {
  _id: mongoose.Types.ObjectId;
  tagName: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagsSchema = new Schema<ITags>({
  tagName: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ITags>('Tags', tagsSchema); 