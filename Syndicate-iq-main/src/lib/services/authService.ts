/**
 * Authentication Service
 * Handles user registration and authentication using localStorage
 */

import CryptoJS from 'crypto-js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Hashed password
  salt: string; // Salt for password hashing
  createdAt: Date;
}

const PBKDF2_ITERATIONS = 10000;

/**
 * Hash a password using PBKDF2
 */
function hashPassword(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
  }).toString();
}

/**
 * Generate a random salt
 */
function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

/**
 * Verify a password against a hash
 */
function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToVerify = hashPassword(password, salt);
  return hashToVerify === hash;
}

/**
 * Validate password strength
 */
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true };
}

const STORAGE_KEY = 'syndicateiq_users';

/**
 * Get all users from storage
 */
function getUsers(): User[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    return data.map((user: User) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save users to storage
 */
function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Sign up a new user
 */
export function signUp(name: string, email: string, password: string): { success: boolean; error?: string } {
  // Validation
  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error };
  }

  // Check if user already exists
  const users = getUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // Hash password
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    salt,
    createdAt: new Date(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true };
}

/**
 * Sign in a user
 */
export function signIn(email: string, password: string): { success: boolean; error?: string; user?: User } {
  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  // Find user
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Email was wrong' };
  }

  // Check password (support both hashed and legacy plaintext passwords for migration)
  let passwordValid = false;
  if (user.passwordHash && user.salt) {
    // New hashed password
    passwordValid = verifyPassword(password, user.passwordHash, user.salt);
  } else if ((user as any).password) {
    // Legacy plaintext password (for backward compatibility)
    passwordValid = (user as any).password === password;
  }

  if (!passwordValid) {
    return { success: false, error: 'Password was wrong' };
  }

  // Set current user session
  localStorage.setItem('syndicateiq_current_user', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  return { success: true, user };
}

/**
 * Sign out current user
 */
export function signOut(): void {
  localStorage.removeItem('syndicateiq_current_user');
}

/**
 * Get current signed in user
 */
export function getCurrentUser(): { id: string; name: string; email: string } | null {
  try {
    const stored = localStorage.getItem('syndicateiq_current_user');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Check if user is signed in
 */
export function isSignedIn(): boolean {
  return getCurrentUser() !== null;
}
