import { Request, Response } from 'express';
import userService, { CreateUserData, UpdateUserData, LoginData } from './user.service';

interface AuthRequest extends Request {
  user?: any;
}

export class UserController {
  // Create user
  async registerUser(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: user.userName,
          role: user.role,
          createdAt: user.createdAt
        },
        message: 'User created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }
  // Create user
  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: user.userName,
          role: user.role,
          createdAt: user.createdAt
        },
        message: 'User created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        data: users,
        message: 'Users fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          data: null,
          message: 'User not found'
        });
      }

      res.status(200).json({
        data: user,
        message: 'User fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData: UpdateUserData = req.body;
      const user = await userService.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({
          data: null,
          message: 'User not found'
        });
      }

      res.status(200).json({
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: user.userName,
          role: user.role,
          updatedAt: user.updatedAt
        },
        message: 'User updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        data: null,
        message: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({
          data: null,
          message: 'User not found'
        });
      }

      res.status(200).json({
        data: null,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }

  // Login user
  async loginUser(req: Request, res: Response) {
    try {
      const loginData: LoginData = req.body;
      const { user, token } = await userService.loginUser(loginData);
      
      res.status(200).json({
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userName: user.userName,
            role: user.role
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error: any) {
      res.status(401).json({
        data: null,
        message: error.message
      });
    }
  }

  // Get user count
  async getUserCount(req: Request, res: Response) {
    try {
      const count = await userService.getUserCount();
      
      res.status(200).json({
        data: { count },
        message: 'User count fetched successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        data: null,
        message: error.message
      });
    }
  }
}

export default new UserController(); 