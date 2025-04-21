import { User, UserRole } from '../types';
import { users, saveUsers } from './staticData';

interface SignUpCredentials {
  email: string;
  password: string;
  role: UserRole;
  location?: { lat: number; lng: number };
}

interface SignInCredentials {
  email: string;
  password: string;
}

export const auth = {
  signUp: async (credentials: SignUpCredentials): Promise<{ user: User | null; error: Error | null }> => {
    const existingUser = users.find(user => user.email === credentials.email);
    if (existingUser) {
      return { user: null, error: new Error('User already exists') };
    }
    
    const newUser: User = {
      id: (users.length + 1).toString(),
      email: credentials.email,
      password: credentials.password,
      role: credentials.role,
      points: 0,
      createdAt: new Date().toISOString(),
      location: credentials.location,
    };
    
    users.push(newUser);
    saveUsers();
    
    localStorage.setItem('session', JSON.stringify({ user: newUser }));
    window.dispatchEvent(new Event('storage'));
    
    return { user: newUser, error: null };
  },

  signIn: async (credentials: SignInCredentials): Promise<{ user: User | null; error: Error | null }> => {
    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      return { user: null, error: new Error('Invalid credentials') };
    }
    
    localStorage.setItem('session', JSON.stringify({ user }));
    window.dispatchEvent(new Event('storage'));
    
    return { user, error: null };
  },

  guestLogin: async (): Promise<void> => {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@example.com',
      password: '',
      role: 'guest',
      points: 0,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('session', JSON.stringify({ user: guestUser }));
    window.dispatchEvent(new Event('storage'));
  },

  signOut: async (): Promise<void> => {
    localStorage.removeItem('session');
    window.dispatchEvent(new Event('storage'));
  },

  getSession: (): { user: User } | null => {
    const session = localStorage.getItem('session');
    if (!session) return null;
    
    const parsedSession = JSON.parse(session);
    // Get the latest user data from users array
    const currentUser = users.find(u => u.id === parsedSession.user.id);
    return currentUser ? { user: currentUser } : null;
  },

  onAuthStateChange: (callback: (session: { user: User } | null) => void) => {
    const handleStorageChange = () => {
      const session = auth.getSession();
      callback(session);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return {
      unsubscribe: () => {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }
};