import { Router } from 'express';
import {
  addSprinkler,
  getMapSprinklers,
  updateSprinkler,
  deleteSprinkler
} from '../controllers/sprinklerController';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

// Add sprinkler to a map
router.post('/maps/:mapId/sprinklers', authenticateUser, addSprinkler);

// Get all sprinklers for a map
router.get('/maps/:mapId/sprinklers', authenticateUser, getMapSprinklers);

// Update a specific sprinkler
router.put('/sprinklers/:id', authenticateUser, updateSprinkler);

// Delete a specific sprinkler
router.delete('/sprinklers/:id', authenticateUser, deleteSprinkler);

export default router;