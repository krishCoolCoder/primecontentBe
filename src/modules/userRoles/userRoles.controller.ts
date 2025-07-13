import { Request, Response } from 'express';
import userRolesService, { CreateUserRolesData, UpdateUserRolesData } from './userRoles.service';

export class UserRolesController {
  // Create user role
  async createUserRole(req: Request, res: Response) {
    try {
      const userRoleData: CreateUserRolesData = req.body;
      const userRole = await userRolesService.createUserRole(userRoleData);
      
      res.status(201).json({
        data: {
          id: userRole._id,
          roleName: userRole.roleName,
          tags: userRole.tags,
          isInherited: userRole.isInherited,
          inHeritedRoleRef: userRole.inHeritedRoleRef,
          createdAt: userRole.createdAt,
          createdBy: userRole.createdBy,
          updatedAt: userRole.updatedAt,
          updatedBy: userRole.updatedBy
        },
        message: 'User role created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all user roles
  async getAllUserRoles(req: Request, res: Response) {
    try {
      const userRoles = await userRolesService.getAllUserRoles();
      
      res.status(200).json({
        data: userRoles,
        message: 'User roles fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user role by ID
  async getUserRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = await userRolesService.getUserRoleById(id);
      
      if (!userRole) {
        return res.status(404).json({
          data: null,
          message: 'User role not found'
        });
      }

      res.status(200).json({
        data: userRole,
        message: 'User role fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update user role
  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRoleData: UpdateUserRolesData = req.body;
      const userRole = await userRolesService.updateUserRole(id, userRoleData);
      
      if (!userRole) {
        return res.status(404).json({
          data: null,
          message: 'User role not found'
        });
      }

      res.status(200).json({
        data: {
          id: userRole._id,
          roleName: userRole.roleName,
          tags: userRole.tags,
          isInherited: userRole.isInherited,
          inHeritedRoleRef: userRole.inHeritedRoleRef,
          createdAt: userRole.createdAt,
          createdBy: userRole.createdBy,
          updatedAt: userRole.updatedAt,
          updatedBy: userRole.updatedBy
        },
        message: 'User role updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete user role
  async deleteUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await userRolesService.deleteUserRole(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'User role not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'User role deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user roles count
  async getUserRolesCount(req: Request, res: Response) {
    try {
      const count = await userRolesService.getUserRolesCount();
      
      res.status(200).json({
        data: { count },
        message: 'User roles count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user roles by tag
  async getUserRolesByTag(req: Request, res: Response) {
    try {
      const { tagId } = req.params;
      const userRoles = await userRolesService.getUserRolesByTag(tagId);
      
      res.status(200).json({
        data: userRoles,
        message: 'User roles fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new UserRolesController(); 