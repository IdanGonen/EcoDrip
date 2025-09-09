// Map model interface for Prisma entity
export interface Map {
	map_key: string;
	base64: string;
	height: number;
	width: number;
	userId?: string;
}

// Interface for creating a new map (without map_key)
export interface MapCreate {
	base64: string;
	height: number;
	width: number;
	userId: string;
}
