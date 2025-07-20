import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRoles extends Document {
  _id: mongoose.Types.ObjectId;
  roleName: string;
  tags?: mongoose.Types.ObjectId;
  userAccessId: mongoose.Types.ObjectId;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId | null;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId | null;
}

const userRolesSchema = new Schema<IUserRoles>({
  roleName: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  tags: {
    type: Schema.Types.ObjectId,
    ref: 'Tags',
    required: false
  },
  userAccessId: {
    type: Schema.Types.ObjectId,
    ref: 'UserAccess',
    required: [true, 'User access ID is required']
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
});

// Update the updatedAt field before saving on update
userRolesSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model<IUserRoles>('UserRoles', userRolesSchema); 