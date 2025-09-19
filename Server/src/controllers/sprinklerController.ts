import { Request, Response } from 'express';
import { SprinklerCreate, SprinklerUpdate } from '../models/map';
import { prisma } from '../services/prisma';

/**
 * Add a new sprinkler to a map
 */
export const addSprinkler = async (req: Request, res: Response) => {
  try {
    const { mapId } = req.params;
    const { userId, label, xRatio, yRatio, active, flowRate, metadata } =
      req.body;

    if (
      !xRatio ||
      !yRatio ||
      xRatio < 0 ||
      xRatio > 1 ||
      yRatio < 0 ||
      yRatio > 1
    ) {
      return res
        .status(400)
        .json({ error: 'xRatio and yRatio must be between 0 and 1' });
    }

    // Verify map ownership
    const map = await prisma.mapImage.findFirst({
      where: { id: mapId, ownerId: userId },
    });

    if (!map) {
      return res.status(404).json({ error: 'Map not found or access denied' });
    }

    const sprinklerData: SprinklerCreate = {
      mapId,
      label: label || null,
      xRatio: parseFloat(xRatio),
      yRatio: parseFloat(yRatio),
      active: active !== undefined ? active : true,
      flowRate: flowRate ? parseFloat(flowRate) : undefined,
      metadata: metadata || null,
    };

    const sprinkler = await prisma.sprinkler.create({
      data: sprinklerData,
      include: {
        map: {
          select: { id: true, title: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Sprinkler added successfully',
      data: sprinkler,
    });
  } catch (error) {
    console.error('Error adding sprinkler:', error);
    return res.status(500).json({ error: 'Failed to add sprinkler' });
  }
};

/**
 * Get all sprinklers for a specific map
 */
export const getMapSprinklers = async (req: Request, res: Response) => {
  try {
    const { mapId } = req.params;
    const { userId } = req.body;

    // Verify map ownership
    const map = await prisma.mapImage.findFirst({
      where: { id: mapId, ownerId: userId },
    });

    if (!map) {
      return res.status(404).json({ error: 'Map not found or access denied' });
    }

    const sprinklers = await prisma.sprinkler.findMany({
      where: { mapId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: sprinklers,
    });
  } catch (error) {
    console.error('Error fetching sprinklers:', error);
    return res.status(500).json({ error: 'Failed to fetch sprinklers' });
  }
};

/**
 * Update a sprinkler
 */
export const updateSprinkler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, label, xRatio, yRatio, active, flowRate, metadata } =
      req.body;

    // Verify ownership through map
    const sprinkler = await prisma.sprinkler.findUnique({
      where: { id },
      include: {
        map: { select: { ownerId: true } },
      },
    });

    if (!sprinkler || sprinkler.map.ownerId !== userId) {
      return res
        .status(404)
        .json({ error: 'Sprinkler not found or access denied' });
    }

    // Validate ratios if provided
    if (
      (xRatio !== undefined && (xRatio < 0 || xRatio > 1)) ||
      (yRatio !== undefined && (yRatio < 0 || yRatio > 1))
    ) {
      return res
        .status(400)
        .json({ error: 'xRatio and yRatio must be between 0 and 1' });
    }

    const updateData: SprinklerUpdate = {};

    if (label !== undefined) updateData.label = label || null;
    if (xRatio !== undefined) updateData.xRatio = parseFloat(xRatio);
    if (yRatio !== undefined) updateData.yRatio = parseFloat(yRatio);
    if (active !== undefined) updateData.active = active;
    if (flowRate !== undefined)
      updateData.flowRate = flowRate ? parseFloat(flowRate) : undefined;
    if (metadata !== undefined) updateData.metadata = metadata || null;

    const updatedSprinkler = await prisma.sprinkler.update({
      where: { id },
      data: updateData,
      include: {
        map: {
          select: { id: true, title: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Sprinkler updated successfully',
      data: updatedSprinkler,
    });
  } catch (error) {
    console.error('Error updating sprinkler:', error);
    return res.status(500).json({ error: 'Failed to update sprinkler' });
  }
};

/**
 * Delete a sprinkler
 */
export const deleteSprinkler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Verify ownership through map
    const sprinkler = await prisma.sprinkler.findUnique({
      where: { id },
      include: {
        map: { select: { ownerId: true } },
      },
    });

    if (!sprinkler || sprinkler.map.ownerId !== userId) {
      return res
        .status(404)
        .json({ error: 'Sprinkler not found or access denied' });
    }

    await prisma.sprinkler.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Sprinkler deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sprinkler:', error);
    return res.status(500).json({ error: 'Failed to delete sprinkler' });
  }
};
