import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './modules/user/user.route';
import tagsRoutes from './modules/tags/tags.route';
import contentTypeRoutes from './modules/contentType/contentType.route';
import contentsRoutes from './modules/contents/contents.route';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
//   credentials: true
// }));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or use your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tasktodouser:tasktodouser@tasktodo.ir517qa.mongodb.net/primecontent')
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error: any) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/contents', contentsRoutes);

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