import { Request, Response, NextFunction } from 'express';
import { MapImageCreate, MapImageUpdate } from '../models/map';
import { prisma } from '../services/prisma';
import fs from 'fs/promises';
import path from 'path';

/**
 * Upload a new map image
 */
export const uploadMap = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, ownerId } = req.body;

    if (!title || !ownerId) {
      return res.status(400).json({ error: 'Title and ownerId are required' });
    }

    // Validate file type (redundant since multer filter handles this, but keeping for safety)
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    // Validate file size (redundant since multer handles this, but keeping for safety)
    if (file.size > 10 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: 'File size must be less than 10MB' });
    }

    // Store relative path to the file
    const imagePath = `uploads/maps/${file.filename}`;

    const mapData: MapImageCreate = {
      title,
      description: description || null,
      imagePath,
      ownerId,
    };

    const map = await prisma.mapImage.create({
      data: mapData,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        sprinklers: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Map uploaded successfully',
      data: map,
    });
  } catch (error) {
    console.error('Error uploading map:', error);
    return res.status(500).json({ error: 'Failed to upload map' });
  }
};

/**
 * Get all maps for authenticated user
 */
export const getUserMaps = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const maps = await prisma.mapImage.findMany({
      where: { ownerId: userId },
      include: {
        sprinklers: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Transform the data to include full image URLs
    const mapsWithImageUrls = maps.map((map) => ({
      ...map,
      imageUrl: `${req.protocol}://${req.get('host')}/${map.imagePath}`,
    }));

    return res.status(200).json({
      success: true,
      data: mapsWithImageUrls,
    });
  } catch (error) {
    console.error('Error fetching user maps:', error);
    return res.status(500).json({ error: 'Failed to fetch maps' });
  }
};

/**
 * Get specific map by ID
 */
export const getMapById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const map = await prisma.mapImage.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        sprinklers: {
          orderBy: { createdAt: 'asc' },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Add full image URL to response
    const mapWithImageUrl = {
      ...map,
      imageUrl: `${req.protocol}://${req.get('host')}/${map.imagePath}`,
    };

    return res.status(200).json({
      success: true,
      data: mapWithImageUrl,
    });
  } catch (error) {
    console.error('Error fetching map:', error);
    return res.status(500).json({ error: 'Failed to fetch map' });
  }
};

/**
 * Update map metadata
 */
export const updateMap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updateData: MapImageUpdate = {
      title,
      description: description || null,
    };

    const map = await prisma.mapImage.updateMany({
      where: {
        id,
        ownerId: userId,
      },
      data: updateData,
    });

    if (map.count === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    const updatedMap = await prisma.mapImage.findUnique({
      where: { id },
      include: {
        sprinklers: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Map updated successfully',
      data: updatedMap,
    });
  } catch (error) {
    console.error('Error updating map:', error);
    return res.status(500).json({ error: 'Failed to update map' });
  }
};

/**
 * Delete map and all its sprinklers
 */
export const deleteMap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // First, find the map to get the image path
    const mapToDelete = await prisma.mapImage.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!mapToDelete) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Delete the map from database (cascading will delete sprinklers)
    const deletedMap = await prisma.mapImage.deleteMany({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (deletedMap.count === 0) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Delete the physical file
    try {
      const fullPath = path.join(__dirname, '../../', mapToDelete.imagePath);
      await fs.unlink(fullPath);
    } catch (fileError) {
      console.error(`Error deleting file ${mapToDelete.imagePath}:`, fileError);
      // Don't fail the request if file deletion fails, as the database record is already deleted
    }

    return res.status(200).json({
      success: true,
      message: 'Map deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting map:', error);
    return res.status(500).json({ error: 'Failed to delete map' });
  }
};
