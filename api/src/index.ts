import './env'; // Must be first to load environment variables
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createBackofficeUser, changePassword, getBackofficeUsers, updateBackofficeUser, deleteBackofficeUser } from './controllers/users';
import { createMember, uploadMiddleware } from './controllers/members';
import { verifyToken, requireAdmin } from './middleware/auth';
import { verifyAppCheck } from './middleware/appcheck';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(verifyAppCheck);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Rodactiva API Server');
});

// Protected User Routes
app.get('/api/users', verifyToken, requireAdmin, getBackofficeUsers);
app.post('/api/users', verifyToken, requireAdmin, createBackofficeUser);
app.put('/api/users/:uid', verifyToken, requireAdmin, updateBackofficeUser);
app.delete('/api/users/:uid', verifyToken, requireAdmin, deleteBackofficeUser);
app.post('/api/users/change-password', verifyToken, changePassword);

// Public Members Route (App Check protected)
app.post('/api/members', uploadMiddleware, createMember);

// Gallery Routes
import { getGalleries, createGallery, updateGallery, deleteGallery, uploadImage, uploadGalleryMiddleware } from './controllers/gallery';

app.get('/api/gallery', getGalleries);
app.post('/api/gallery', verifyToken, requireAdmin, createGallery);
app.put('/api/gallery/:id', verifyToken, requireAdmin, updateGallery);
app.delete('/api/gallery/:id', verifyToken, requireAdmin, deleteGallery);
app.post('/api/gallery/upload', verifyToken, requireAdmin, uploadGalleryMiddleware, uploadImage);

app.listen(port, () => {
  console.log(`Server running at ${process.env.VITE_API_URL}`);
});
