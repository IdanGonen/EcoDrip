import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma';
import { User } from '@prisma/client';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;

// User creation with email uniqueness check
export async function createUser(userData: CreateUserData): Promise<User> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      isAdmin: userData.isAdmin || false,
    },
  });

  return newUser;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

// Validate user password
export async function validatePassword(
  user: User,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, user.password);
}

// Get all users without passwords
export async function getUsers(): Promise<UserWithoutPassword[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
}

// Get user by ID without password
export async function getUserById(
  id: string,
): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
