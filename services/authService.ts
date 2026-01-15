import { User } from '../models/UserModel';

// API Service for backend calls
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}

export class AuthService {
  // Fonction de login qui interagit avec la base de données
  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log(`Attempting login for email: ${email}`);
      
      // Make login API call
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      const user = response.user;
      
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Pour la simulation, on suppose que le mot de passe est "password"
      // En production, on utiliserait bcrypt.compare
      if (password === 'password') {
        // Mettre à jour le champ updated_at
        // Pour simplifier, on ne met pas à jour ici car on ne veut pas modifier l'utilisateur
        
        console.log(`Successfully logged in user: ${user.email}`);
        
        return { 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            password_hash: '',
            role: user.role,
            created_at: new Date(user.created_at),
            updated_at: new Date(user.updated_at || user.created_at)
          }
        };
      } else {
        console.log(`Invalid password for user: ${email}`);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  // Fonction d'enregistrement qui crée un nouvel utilisateur dans la base de données
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      console.log(`Attempting registration for email: ${email}`);
      
      // Check if user already exists via API
      try {
        const response = await apiCall('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: 'temp' })
        });
        
        if (response.success) {
          return { success: false, error: 'Email already exists' };
        }
      } catch (error) {
        // If login fails, the user doesn't exist, so we can continue with registration
      }
      
      // The check is already done above in the try/catch block
      // If we reach here, the email doesn't exist, so we can proceed with registration
      
      // Pour la simulation, on crée un hash de mot de passe factice
      // En production, on utiliserait bcrypt.hash
      const passwordHash = '$2b$10$abcdefghijklmnopqrstuvwxyz'; // Hash factice
      
      // Créer le nouvel utilisateur dans IndexedDB
      const userData = {
        email,
        name,
        password_hash: passwordHash,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Make registration API call
      const response = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      
      const userId = response.userId;
      
      console.log(`Successfully registered new user: ${email}, userId: ${userId}`);
      
      return { success: true, userId: userId };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  }
}
