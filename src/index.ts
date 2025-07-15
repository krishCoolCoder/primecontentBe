import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './modules/user/user.route';
import tagsRoutes from './modules/tags/tags.route';
import contentTypeRoutes from './modules/contentType/contentType.route';
import contentsRoutes from './modules/contents/contents.route';
import userRolesRoutes from './modules/userRoles/userRoles.route';
import userAccessRoutes from './modules/userAccess/userAccess.route';
import collectionRoutes from './modules/collection/collection.route';
import userRolesService from './modules/userRoles/userRoles.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tasktodouser:tasktodouser@tasktodo.ir517qa.mongodb.net/primecontent')
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Initialize default user roles
    try {
      await userRolesService.initializeDefaultRoles();
      console.log('Default user roles initialized');
    } catch (error) {
      console.error('Error initializing default roles:', error);
    }
  })
  .catch((error: any) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/userRole', userRolesRoutes);
app.use('/api/userAccess', userAccessRoutes);
app.use('/collection', collectionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    data: { status: 'OK', timestamp: new Date().toISOString() },
    message: 'Server is running successfully'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    data: null,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    data: null,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 