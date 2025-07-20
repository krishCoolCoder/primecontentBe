import UserRoles, { IUserRoles } from './userRoles.model';
import Tags from '../tags/tags.model';
import userAccessService from '../userAccess/userAccess.service';
import { getAccessFilter } from '../../utils/accessFilter';
import { Request } from 'express';

export interface CreateUserRolesData {
  roleName: string;
  tags?: string; // ObjectId as string - now optional
  userAccessId: string; // ObjectId as string - mandatory
}

export interface UpdateUserRolesData {
  roleName?: string;
  tags?: string; // ObjectId as string - now optional
  userAccessId?: string; // ObjectId as string
}

export interface UserRolesFilterOptions {
  roleName?: string;
  fromDate?: string;
  toDate?: string;
  tags?: string;
}

export class UserRolesService {
  // Initialize default user roles
  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      { roleName: 'SuperAdmin' },
      { roleName: 'Admin' },
      { roleName: 'User' },
      { roleName: 'Anonymous' }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await UserRoles.findOne({ roleName: roleData.roleName });
      if (!existingRole) {
        console.log(`Creating default role: ${roleData.roleName}`);
        
        // Create a temporary role first (we'll update it with userAccessId later)
        // We need to temporarily bypass the required validation for userAccessId
        const tempRole = new UserRoles({
          roleName: roleData.roleName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Save without validation to bypass required userAccessId
        const savedRole = await tempRole.save({ validateBeforeSave: false });
        
        // Create user access for the role
        let userAccess;
        if (roleData.roleName === 'SuperAdmin') {
          userAccess = await userAccessService.createSuperAdminAccess(savedRole._id.toString());
        } else {
          userAccess = await userAccessService.createUserAccess(savedRole._id.toString());
        }
        
        // Update the role with the userAccessId
        await UserRoles.findByIdAndUpdate(savedRole._id, {
          userAccessId: userAccess._id,
          updatedAt: new Date()
        });
      }
    }
  }

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

    // Validate userAccessId exists
    const existingUserAccess = await userAccessService.getUserAccessById(userRoleData.userAccessId);
    if (!existingUserAccess) {
      throw new Error('User access not found');
    }

    const userRole = new UserRoles({
      roleName: userRoleData.roleName,
      tags: userRoleData.tags || undefined,
      userAccessId: userRoleData.userAccessId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const savedRole = await userRole.save();

    return savedRole;
  }

  // Get all user roles
  async getAllUserRoles(filters?: UserRolesFilterOptions, req?: Request): Promise<IUserRoles[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'userRole');
      Object.assign(query, accessFilter);
    }
    
    // Build the query based on filters
    if (filters) {
      // Role name filter (case-insensitive)
      if (filters.roleName) {
        query.roleName = { $regex: filters.roleName, $options: 'i' };
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

      // Tags filter
      if (filters.tags) {
        query.tags = filters.tags;
      }
    }

    return await UserRoles.find(query)
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
  async getUserRolesByTag(tagId: string, req?: Request): Promise<IUserRoles[]> {
    const query: any = { tags: tagId };
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'userRole');
      Object.assign(query, accessFilter);
    }
    
    return await UserRoles.find(query)
      .populate('tags', 'tagName description')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }
}

export default new UserRolesService(); 