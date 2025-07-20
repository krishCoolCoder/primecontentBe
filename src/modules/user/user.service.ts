import User, { IUser } from './user.model';
import UserAccess from '../userAccess/userAccess.model';
import { getAccessFilter } from '../../utils/accessFilter';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName?: string;
  role?: string;
  userRoleId: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  userName?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserFilterOptions {
  userRole?: string;
  userName?: string;
  email?: string;
  fromDate?: string;
  toDate?: string;
}

export class UserService {
  // Create user
  async createUser(userData: CreateUserData): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new User(userData);
    return await user.save();
  }

  // Get all users with optional filters and access-based filtering
  async getAllUsers(filters?: UserFilterOptions, req?: Request): Promise<IUser[]> {
    const query: any = {};
    
    // Apply access-based filter first
    if (req) {
      const accessFilter = getAccessFilter(req, 'user');
      Object.assign(query, accessFilter);
    }
    
    // Build the query based on filters
    if (filters) {
      // User role filter
      if (filters.userRole) {
        // Need to populate and filter - this is more complex with access filter
        // For now, we'll apply role filter separately
      }

      // User name filter - search in firstName and lastName
      if (filters.userName) {
        query.$or = [
          { firstName: { $regex: filters.userName, $options: 'i' } },
          { lastName: { $regex: filters.userName, $options: 'i' } }
        ];
      }

      // Email filter
      if (filters.email) {
        query.email = { $regex: filters.email, $options: 'i' };
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
    }

    return await User.find(query, '-password').sort({ createdAt: -1 });
  }

  // Get user by ID
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id, '-password');
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<IUser | null> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If email is being updated, check if it's already taken
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Email is already taken');
      }
    }

    return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
  }

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    const user = await User.findByIdAndDelete(id);
    return !!user;
  }

  // Login user
  async loginUser(loginData: LoginData): Promise<{ user: IUser; token: string; userRole: any; userAccess?: any }> {
    const user = await User.findOne({ email: loginData.email }).populate('userRoleId');
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
  
    const userRole = (user as any).userRoleId;

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: userRole?.roleName || 'anonymous',
        userRoleId: user.userRoleId
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    const result: { user: IUser; token: string; userRole: any; userAccess?: any } = {
      user,
      token,
      userRole: userRole
    };

    // Always query userAccess by roleId for all users
    if (userRole && userRole._id) {
      const userAccess = await UserAccess.findOne({ roleId: userRole._id });
      if (userAccess) {
        result.userAccess = userAccess;
      }
    }

    return result;
  }

  // Get user count
  async getUserCount(): Promise<number> {
    return await User.countDocuments();
  }
}

export default new UserService(); 