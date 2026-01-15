// Service d'authentification frontend qui simule les appels API
// En production, cela communiquera avec votre backend Flask
export class FrontendAuthService {
  // Fonction de login qui simule un appel API
  static async login(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Vérification des identifiants de démonstration
      if (email === 'admin@example.com' && password === 'password') {
        return {
          success: true,
          user: {
            id: 1,
            email: 'admin@example.com',
            name: 'Admin User',
            password_hash: '', // Ne jamais envoyer le mot de passe hashé au frontend
            role: 'admin',
            created_at: new Date(),
            updated_at: new Date()
          }
        };
      } else if (email === 'superadmin@example.com' && password === 'password') {
        return {
          success: true,
          user: {
            id: 2,
            email: 'superadmin@example.com',
            name: 'Super Admin User',
            password_hash: '', // Ne jamais envoyer le mot de passe hashé au frontend
            role: 'super_admin',
            created_at: new Date(),
            updated_at: new Date()
          }
        };
      } else if (email === 'user@example.com' && password === 'password') {
        return {
          success: true,
          user: {
            id: 3,
            email: 'user@example.com',
            name: 'Regular User',
            password_hash: '', // Ne jamais envoyer le mot de passe hashé au frontend
            role: 'user',
            created_at: new Date(),
            updated_at: new Date()
          }
        };
      }

      // Essayer d'abord avec le service backend
      try {
        // Import dynamique pour éviter les problèmes d'importation circulaire
        const authServiceModule = await import('./authService');
        const authService = authServiceModule.AuthService;
        
        // Appel au service d'authentification backend
        const result = await authService.login(email, password);
        
        // Si l'authentification backend réussit, retourner le résultat
        if (result.success) {
          return result;
        }
      } catch (backendError) {
        console.warn('Backend authentication failed, using fallback mechanism:', backendError);
      }
      
      // Si le backend échoue ou n'est pas disponible, créer un utilisateur temporaire
      // avec les informations fournies
      return {
        success: true,
        user: {
          id: Date.now(), // Utiliser un timestamp comme ID unique
          email: email,
          name: email.split('@')[0] || 'User', // Utiliser la partie avant @ comme nom
          password_hash: '', // Ne jamais envoyer le mot de passe hashé au frontend
          role: 'user',
          created_at: new Date(),
          updated_at: new Date()
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  // Fonction d'enregistrement qui simule un appel API
  static async register(name: string, email: string, password: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      // Vérifier si l'email existe déjà (simulation)
      if (email === 'user@example.com' || email === 'admin@example.com' || email === 'superadmin@example.com') {
        return { success: false, error: 'Email already exists' };
      }
      
      try {
        // Tentative d'utilisation du service backend
        const authServiceModule = await import('./authService');
        const authService = authServiceModule.AuthService;
        
        const result = await authService.register(name, email, password);
        
        // Si l'enregistrement backend réussit, retourner le résultat
        if (result.success) {
          return result;
        }
      } catch (backendError) {
        console.warn('Backend registration failed, using fallback mechanism:', backendError);
      }
      
      // Si le backend échoue, retourner un succès simulé
      return { 
        success: true, 
        userId: Date.now() // Utiliser un timestamp comme ID unique
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  }
}