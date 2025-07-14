import mongoose, { Schema, Document } from 'mongoose';

export interface IModulePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface IUserAccess extends Document {
  _id: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  content: IModulePermissions;
  contentType: IModulePermissions;
  tag: IModulePermissions;
  collections: IModulePermissions;
  user: IModulePermissions;
  userRole: IModulePermissions;
  createdAt: Date;
  updatedAt: Date;
}

const modulePermissionsSchema = new Schema<IModulePermissions>({
  canRead: {
    type: Boolean,
    default: false
  },
  canCreate: {
    type: Boolean,
    default: false
  },
  canUpdate: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  }
});

const userAccessSchema = new Schema<IUserAccess>({
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'UserRoles',
    required: [true, 'Role ID is required'],
    unique: true
  },
  content: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  },
  contentType: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  },
  tag: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  },
  collections: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  },
  user: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  },
  userRole: {
    type: modulePermissionsSchema,
    default: () => ({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    })
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserAccess>('UserAccess', userAccessSchema); 