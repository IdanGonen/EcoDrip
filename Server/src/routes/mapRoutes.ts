import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  uploadMap,
  getUserMaps,
  getMapById,
  updateMap,
  deleteMap
} from '../controllers/mapConroller';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

// Configure multer for file uploads to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/maps'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload new map
router.post('/upload', upload.single('image'), authenticateUser, uploadMap);

// Get all maps for user
router.get('/', authenticateUser, getUserMaps);

// Get specific map by ID
router.get('/:id', authenticateUser, getMapById);

// Update map metadata
router.put('/:id', authenticateUser, updateMap);

// Delete map
router.delete('/:id', authenticateUser, deleteMap);

export default router;