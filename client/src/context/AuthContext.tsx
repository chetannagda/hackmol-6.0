import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUser, signIn, signOut, onAuthChange, getUserData, saveUserData } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, userData: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          console.log('User authenticated, fetching profile data');
          const userData = await getUserData(firebaseUser.uid);
          
          if (userData) {
            // Get the user with their database record ID
            const res = await apiRequest('GET', `/api/users/${userData.databaseId}`);
            if (res.ok) {
              const { user } = await res.json();
              setUser(user);
            } else {
              throw new Error('Failed to fetch user data from API');
            }
          } else {
            console.log('No user data found in Firebase');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        console.log('No authenticated user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      console.log('Registering user with Firebase');
      
      // First create user in our database
      // Make sure we include the required confirmPassword and agreeToTerms fields
      const apiRes = await apiRequest('POST', '/api/register', {
        ...userData,
        confirmPassword: userData.confirmPassword || userData.password,
        agreeToTerms: userData.agreeToTerms === undefined ? true : userData.agreeToTerms
      });
      
      if (!apiRes.ok) {
        const error = await apiRes.json();
        throw new Error(error.message || 'Failed to register user');
      }
      
      const apiData = await apiRes.json();
      const databaseUser = apiData.user;
      
      // Then create the user in Firebase Auth
      const firebaseAuth = await createUser(email, password);
      
      // Store the user data in Firebase Realtime Database with reference to our database ID
      await saveUserData(firebaseAuth.user.uid, {
        email: firebaseAuth.user.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        databaseId: databaseUser.id,
        createdAt: new Date().toISOString()
      });
      
      setUser(databaseUser);
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Logging in user with Firebase');
      
      // Authenticate with Firebase
      const firebaseAuth = await signIn(email, password);
      
      // Get the user data from Firebase
      const userData = await getUserData(firebaseAuth.user.uid);
      
      if (userData && userData.databaseId) {
        // Get the user with their database record ID
        const res = await apiRequest('GET', `/api/users/${userData.databaseId}`);
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${user.firstName}!`,
          });
        } else {
          throw new Error('Failed to fetch user data from API');
        }
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user from Firebase');
      await signOut();
      setUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
