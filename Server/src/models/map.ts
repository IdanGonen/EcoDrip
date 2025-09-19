// MapImage model interface for Prisma entity
export interface MapImage {
	id: string;
	title: string;
	description?: string;
	imagePath: string;
	uploadedAt: Date;
	ownerId: string;
}

// Interface for creating a new map
export interface MapImageCreate {
	title: string;
	description?: string;
	imagePath: string;
	ownerId: string;
}

// Interface for updating a map
export interface MapImageUpdate {
	title?: string;
	description?: string;
}

// Sprinkler model interface
export interface Sprinkler {
	id: string;
	mapId: string;
	label?: string;
	xRatio: number;
	yRatio: number;
	active: boolean;
	flowRate?: number;
	metadata?: any;
	createdAt: Date;
}

// Interface for creating a new sprinkler
export interface SprinklerCreate {
	mapId: string;
	label?: string;
	xRatio: number;
	yRatio: number;
	active?: boolean;
	flowRate?: number;
	metadata?: any;
}

// Interface for updating a sprinkler
export interface SprinklerUpdate {
	label?: string;
	xRatio?: number;
	yRatio?: number;
	active?: boolean;
	flowRate?: number;
	metadata?: any;
}
