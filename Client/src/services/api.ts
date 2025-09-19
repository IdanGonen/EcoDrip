const API_BASE_URL = "http://localhost:3000/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Frontend data types for maps and sprinklers
export interface MapImage {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  imageUrl: string;
  uploadedAt: string;
  ownerId: string;
  sprinklers: Sprinkler[];
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Sprinkler {
  id: string;
  mapId: string;
  label?: string;
  xRatio: number;
  yRatio: number;
  active: boolean;
  flowRate?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MapUploadData {
  title: string;
  description?: string;
  ownerId: string;
}

export interface SprinklerCreateData {
  userId: string;
  label?: string;
  xRatio: number;
  yRatio: number;
  active?: boolean;
  flowRate?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SprinklerUpdateData {
  userId: string;
  label?: string;
  xRatio?: number;
  yRatio?: number;
  active?: boolean;
  flowRate?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function login(loginData: LoginData): Promise<ApiResponse<User>> {
  return makeRequest<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}

export async function register(
  registerData: RegisterData
): Promise<ApiResponse<User>> {
  return makeRequest<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(registerData),
  });
}

export async function getUsers(): Promise<ApiResponse> {
  return makeRequest("/auth/users");
}

// Request body types
interface GetRequestOptions {
  data?: {
    userId?: string;
    [key: string]: unknown;
  };
  headers?: Record<string, string>;
}

interface PostRequestOptions {
  headers?: Record<string, string>;
}

interface PutRequestOptions {
  headers?: Record<string, string>;
}

interface DeleteRequestOptions {
  data?: {
    userId?: string;
    [key: string]: unknown;
  };
  headers?: Record<string, string>;
}

// Request data types
type PostData = FormData | Record<string, unknown> | undefined;
type PutData = Record<string, unknown> | undefined;

// Modern API client for making requests with different HTTP methods
export const api = {
  get: async <T>(
    endpoint: string,
    options: GetRequestOptions = {}
  ): Promise<{ data: ApiResponse<T> }> => {
    const requestOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // GET requests should not have a body - data should be in query parameters
    // The endpoint should already include query parameters if needed

    const result = await makeRequest<T>(endpoint, requestOptions);
    return { data: result };
  },

  post: async <T>(
    endpoint: string,
    data?: PostData,
    options: PostRequestOptions = {}
  ): Promise<{ data: ApiResponse<T> }> => {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (data instanceof FormData) {
      // Remove Content-Type for FormData, browser will set it with boundary
      // const { headers, ...rest } = requestOptions;
      requestOptions.headers = options.headers || {};
      requestOptions.body = data;
    } else if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    const result = await makeRequest<T>(endpoint, requestOptions);
    return { data: result };
  },

  put: async <T>(
    endpoint: string,
    data?: PutData,
    options: PutRequestOptions = {}
  ): Promise<{ data: ApiResponse<T> }> => {
    const requestOptions: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    const result = await makeRequest<T>(endpoint, requestOptions);
    return { data: result };
  },

  delete: async <T>(
    endpoint: string,
    options: DeleteRequestOptions = {}
  ): Promise<{ data: ApiResponse<T> }> => {
    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // For DELETE requests with data, send it as body
    if (options.data) {
      requestOptions.body = JSON.stringify(options.data);
    }

    const result = await makeRequest<T>(endpoint, requestOptions);
    return { data: result };
  },
};
