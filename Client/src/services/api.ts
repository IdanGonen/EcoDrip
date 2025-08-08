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
