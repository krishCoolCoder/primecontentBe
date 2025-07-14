import { Request, Response } from 'express';
import userAccessService, { UpdateUserAccessData } from './userAccess.service';

export class UserAccessController {
  // Get all user access records
  async getAllUserAccess(req: Request, res: Response) {
    try {
      const userAccessList = await userAccessService.getAllUserAccess();
      
      res.status(200).json({
        data: userAccessList,
        message: 'User access records fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user access by ID
  async getUserAccessById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userAccess = await userAccessService.getUserAccessById(id);
      
      if (!userAccess) {
        return res.status(404).json({
          data: null,
          message: 'User access not found'
        });
      }

      res.status(200).json({
        data: userAccess,
        message: 'User access fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user access by role ID
  async getUserAccessByRoleId(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const userAccess = await userAccessService.getUserAccessByRoleId(roleId);
      
      if (!userAccess) {
        return res.status(404).json({
          data: null,
          message: 'User access not found for this role'
        });
      }

      res.status(200).json({
        data: userAccess,
        message: 'User access fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update user access
  async updateUserAccess(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateUserAccessData = req.body;
      const userAccess = await userAccessService.updateUserAccess(id, updateData);
      
      if (!userAccess) {
        return res.status(404).json({
          data: null,
          message: 'User access not found'
        });
      }

      res.status(200).json({
        data: userAccess,
        message: 'User access updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user access count
  async getUserAccessCount(req: Request, res: Response) {
    try {
      const count = await userAccessService.getUserAccessCount();
      
      res.status(200).json({
        data: { count },
        message: 'User access count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new UserAccessController(); 