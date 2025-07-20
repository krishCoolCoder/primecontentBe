import UserAccess, { IUserAccess, IModulePermissions } from './userAccess.model';
import { getAccessFilter } from '../../utils/accessFilter';
import { Request } from 'express';

export interface CreateUserAccessData {
  roleId: string;
  content?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  contentType?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  tag?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  collections?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  user?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  userRole?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
}

export interface UpdateUserAccessData {
  content?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  contentType?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  tag?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  collections?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  user?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  userRole?: {
    canViewAll?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
}

export class UserAccessService {
  // Create user access manually (via API)
  async createUserAccessManually(data: CreateUserAccessData): Promise<IUserAccess> {
    // Check if user access already exists for this role
    const existingAccess = await UserAccess.findOne({ roleId: data.roleId });
    if (existingAccess) {
      throw new Error('User access already exists for this role');
    }

    const userAccess = new UserAccess({
      roleId: data.roleId,
      content: {
        canViewAll: data.content?.canViewAll || false,
        canRead: data.content?.canRead || false,
        canCreate: data.content?.canCreate || false,
        canUpdate: data.content?.canUpdate || false,
        canDelete: data.content?.canDelete || false
      },
      contentType: {
        canViewAll: data.contentType?.canViewAll || false,
        canRead: data.contentType?.canRead || false,
        canCreate: data.contentType?.canCreate || false,
        canUpdate: data.contentType?.canUpdate || false,
        canDelete: data.contentType?.canDelete || false
      },
      tag: {
        canViewAll: data.tag?.canViewAll || false,
        canRead: data.tag?.canRead || false,
        canCreate: data.tag?.canCreate || false,
        canUpdate: data.tag?.canUpdate || false,
        canDelete: data.tag?.canDelete || false
      },
      collections: {
        canViewAll: data.collections?.canViewAll || false,
        canRead: data.collections?.canRead || false,
        canCreate: data.collections?.canCreate || false,
        canUpdate: data.collections?.canUpdate || false,
        canDelete: data.collections?.canDelete || false
      },
      user: {
        canViewAll: data.user?.canViewAll || false,
        canRead: data.user?.canRead || false,
        canCreate: data.user?.canCreate || false,
        canUpdate: data.user?.canUpdate || false,
        canDelete: data.user?.canDelete || false
      },
      userRole: {
        canViewAll: data.userRole?.canViewAll || false,
        canRead: data.userRole?.canRead || false,
        canCreate: data.userRole?.canCreate || false,
        canUpdate: data.userRole?.canUpdate || false,
        canDelete: data.userRole?.canDelete || false
      }
    });
    return await userAccess.save();
  }

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
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      contentType: {
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      tag: {
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      collections: {
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      user: {
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      },
      userRole: {
        canViewAll: false,
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false
      }
    });
    return await userAccess.save();
  }

  // Get all user access records
  async getAllUserAccess(req?: Request): Promise<IUserAccess[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'user');
      Object.assign(query, accessFilter);
    }
    
    return await UserAccess.find(query)
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
        canViewAll: true,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      contentType: {
        canViewAll: true,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      tag: {
        canViewAll: true,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      collections: {
        canViewAll: true,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      user: {
        canViewAll: true,
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      },
      userRole: {
        canViewAll: true,
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