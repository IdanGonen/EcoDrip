
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { MapCreate } from '../models/map';
import { prisma } from '../services/prisma';

/**
 * Controller to upload a map image, convert to base64, get dimensions, and store in DB
 * @param req Express request with multer file and userId in body
 * @param res Express response
 * @param next Express next function
 */
export const uploadMap = async (req: Request, res: Response, next: NextFunction) => {
  try {

    // Validate file upload
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate userId
    const userId = req.body.userId;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }
    // Convert image to base64
    const buffer = file.buffer;
    const base64 = buffer.toString('base64');

    // Get image dimensions using sharp
    const metadata = await sharp(buffer).metadata();
    const height = metadata.height || 0;
    const width = metadata.width || 0;

    // Prepare map data
    const mapRequest: MapCreate = {
      base64,
      height,
      width,
      userId,
    };

    // Store in DB
    const map = await prisma.map.create({
      data: {
        base64: mapRequest.base64,
        height: mapRequest.height,
        width: mapRequest.width,
        user: { connect: { id: mapRequest.userId } },
      }
    });
    return res.status(201).json(map);
  } catch (error) {

    // Log error for debugging
    console.error('Error uploading map:', error);
    return res.status(500).json({ error: 'Failed to upload map' });
  }
};