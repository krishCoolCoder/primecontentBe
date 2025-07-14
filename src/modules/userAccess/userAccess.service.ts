import UserAccess, { IUserAccess, IModulePermissions } from './userAccess.model';

export interface UpdateUserAccessData {
  content?: IModulePermissions;
  contentType?: IModulePermissions;
  tag?: IModulePermissions;
  collections?: IModulePermissions;
  user?: IModulePermissions;
  userRole?: IModulePermissions;
}

export class UserAccessService {
  // Create user access for a role
  async createUserAccess(roleId: string): Promise<IUserAccess> {
    // Check if user access already exists for this role
    const existingAccess = await UserAccess.findOne({ roleId });
    if (existingAccess) {
      return existingAccess;
    }

    const userAccess = new UserAccess({
      roleId,
      content: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      contentType: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      tag: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      collections: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      user: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      userRole: {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      }
    });
    return await userAccess.save();
  }

  // Get all user access records
  async getAllUserAccess(): Promise<IUserAccess[]> {
    return await UserAccess.find()
      .populate('roleId', 'roleName')
      .sort({ createdAt: -1 });
  }

  // Get user access by ID
  async getUserAccessById(id: string): Promise<IUserAccess | null> {
    return await UserAccess.findById(id)
      .populate('roleId', 'roleName');
  }

  // Get user access by role ID
  async getUserAccessByRoleId(roleId: string): Promise<IUserAccess | null> {
    return await UserAccess.findOne({ roleId })
      .populate('roleId', 'roleName');
  }

  // Update user access
  async updateUserAccess(id: string, updateData: UpdateUserAccessData): Promise<IUserAccess | null> {
    const userAccess = await UserAccess.findById(id);
    if (!userAccess) {
      throw new Error('User access not found');
    }

    return await UserAccess.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('roleId', 'roleName');
  }

  // Delete user access
  async deleteUserAccess(id: string): Promise<boolean> {
    const userAccess = await UserAccess.findByIdAndDelete(id);
    return !!userAccess;
  }

  // Get user access count
  async getUserAccessCount(): Promise<number> {
    return await UserAccess.countDocuments();
  }

  // Create default access for SuperAdmin role
  async createSuperAdminAccess(roleId: string): Promise<IUserAccess> {
    const existingAccess = await UserAccess.findOne({ roleId });
    if (existingAccess) {
      return existingAccess;
    }

    const userAccess = new UserAccess({
      roleId,
      content: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      contentType: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      tag: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      collections: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      user: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      userRole: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      }
    });
    return await userAccess.save();
  }
}

export default new UserAccessService(); 