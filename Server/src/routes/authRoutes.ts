import { Router } from 'express';
import { register, login, getUsers } from '../controllers/authController';

const router = Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get all users (for testing purposes)
router.get('/users', getUsers);

export default router;
