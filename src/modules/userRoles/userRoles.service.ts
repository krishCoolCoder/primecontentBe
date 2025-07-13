import UserRoles, { IUserRoles } from './userRoles.model';
import Tags from '../tags/tags.model';

export interface CreateUserRolesData {
  roleName: string;
  tags?: string; // ObjectId as string - now optional
  isInherited?: boolean;
  inHeritedRoleRef?: string; // ObjectId as string
}

export interface UpdateUserRolesData {
  roleName?: string;
  tags?: string; // ObjectId as string - now optional
  isInherited?: boolean;
  inHeritedRoleRef?: string; // ObjectId as string
}

export class UserRolesService {
  // Create user role
  async createUserRole(userRoleData: CreateUserRolesData): Promise<IUserRoles> {
    // Check if role name already exists
    const existingUserRole = await UserRoles.findOne({ roleName: userRoleData.roleName });
    if (existingUserRole) {
      throw new Error('User role with this name already exists');
    }

    // Validate tags if provided (now optional)
    if (userRoleData.tags) {
      const existingTag = await Tags.findById(userRoleData.tags);
      if (!existingTag) {
        throw new Error('Tag not found');
      }
    }

    const userRole = new UserRoles({
      roleName: userRoleData.roleName,
      tags: userRoleData.tags || undefined,
      isInherited: userRoleData.isInherited || false,
      inHeritedRoleRef: userRoleData.inHeritedRoleRef || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await userRole.save();
  }

  // Get all user roles
  async getAllUserRoles(): Promise<IUserRoles[]> {
    return await UserRoles.find()
      .populate('tags', 'tagName description')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  // Get user role by ID
  async getUserRoleById(id: string): Promise<IUserRoles | null> {
    return await UserRoles.findById(id)
      .populate('tags', 'tagName description')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  // Update user role
  async updateUserRole(id: string, userRoleData: UpdateUserRolesData): Promise<IUserRoles | null> {
    const userRole = await UserRoles.findById(id);
    if (!userRole) {
      throw new Error('User role not found');
    }

    // If role name is being updated, check if it's already taken
    if (userRoleData.roleName && userRoleData.roleName !== userRole.roleName) {
      const existingUserRole = await UserRoles.findOne({ roleName: userRoleData.roleName });
      if (existingUserRole) {
        throw new Error('Role name is already taken');
      }
    }

    // Validate tags if provided (now optional)
    if (userRoleData.tags) {
      const existingTag = await Tags.findById(userRoleData.tags);
      if (!existingTag) {
        throw new Error('Tag not found');
      }
    }

    return await UserRoles.findByIdAndUpdate(
      id, 
      {
        ...userRoleData,
        updatedAt: new Date()
      }, 
      { new: true, runValidators: true }
    ).populate('tags', 'tagName description')
     .populate('createdBy', 'firstName lastName email')
     .populate('updatedBy', 'firstName lastName email');
  }

  // Delete user role
  async deleteUserRole(id: string): Promise<boolean> {
    const userRole = await UserRoles.findByIdAndDelete(id);
    return !!userRole;
  }

  // Get user roles count
  async getUserRolesCount(): Promise<number> {
    return await UserRoles.countDocuments();
  }

  // Get user roles by tag
  async getUserRolesByTag(tagId: string): Promise<IUserRoles[]> {
    return await UserRoles.find({ tags: tagId })
      .populate('tags', 'tagName description')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }
}

export default new UserRolesService(); 