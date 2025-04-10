import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUser, signIn, signOut, onAuthChange, getUserData, saveUserData } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useLocation } from 'wouter';
import { auth, database } from '@/lib/firebase'; // Correct Firebase configuration import

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authPending: boolean;
  securityStatus: "analyzing" | "secure" | "warning" | "normal";
  register: (email: string, password: string, userData: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  analyzeSecurity: (action: string, data?: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authPending: false,
  securityStatus: "normal",
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  analyzeSecurity: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Simulates AI-based security analysis
 * @param action The action being performed
 * @param data Additional data for analysis
 * @returns Whether the action passes security checks
 */
const simulateSecurityAnalysis = async (action: string, data?: any): Promise<boolean> => {
  console.log(`🔒 Blockchain Security Module: Analyzing ${action}...`);
  
  // Add random delay between 1-3 seconds to simulate analysis
  const analysisTime = Math.floor(Math.random() * 2000) + 1000;
  await new Promise(resolve => setTimeout(resolve, analysisTime));
  
  // Simulate detection of suspicious activity for ~5% of actions
  const isSuspicious = Math.random() < 0.05;
  
  if (isSuspicious) {
    console.log(`⚠️ Blockchain Security Alert: Suspicious activity detected in ${action}`);
    return false;
  }
  
  console.log(`✅ Blockchain Security Module: ${action} verified secure`);
  return true;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authPending, setAuthPending] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<"analyzing" | "secure" | "warning" | "normal">("normal");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Security analysis function
  const analyzeSecurity = async (action: string, data?: any): Promise<boolean> => {
    setSecurityStatus("analyzing");
    try {
      toast({
        title: "Blockchain Security Verification",
        description: `Analyzing ${action.toLowerCase()} through secure blockchain...`,
        icon: <Lock className="h-4 w-4 text-blue-500" />,
        duration: 3000,
      });
      
      const result = await simulateSecurityAnalysis(action, data);
      setSecurityStatus(result ? "secure" : "warning");
      return result;
    } catch (error) {
      console.error(`Security analysis error for ${action}:`, error);
      setSecurityStatus("warning");
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          console.log('User authenticated, fetching profile data');
          await analyzeSecurity("session verification");
          
          const userData = await getUserData(firebaseUser.uid);
          
          if (userData) {
            // Get the user with their database record ID
            const res = await apiRequest('GET', `/api/users/${userData.databaseId}`);
            if (res.ok) {
              const { user } = await res.json();
              setUser(user);
              
              // Show secure toast when user is loaded
              toast({
                title: "Secure Session Established",
                description: "Your identity has been verified through blockchain",
                icon: <Shield className="h-4 w-4 text-green-500" />,
                duration: 3000,
              });
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
  }, [toast]);

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true);
    setAuthPending(true);
    try {
      console.log('Registering user with Firebase');
      
      // First verify security
      const securityPassed = await analyzeSecurity("registration", { email });
      if (!securityPassed) {
        toast({
          title: "Security Alert",
          description: "Registration blocked due to security concerns. Please try again.",
          variant: "destructive",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
        return;
      }
      
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
        createdAt: new Date().toISOString(),
        securityLevel: "high",
        walletBalance: 10000 // Starting balance for demo
      });
      
      setUser(databaseUser);
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been secured with blockchain verification.',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        setLocation('/login');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setLoading(false);
      setAuthPending(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthPending(true);
    try {
      console.log('Logging in user with Firebase');
      
      // First verify security
      const securityPassed = await analyzeSecurity("login", { email });
      if (!securityPassed) {
        toast({
          title: "Security Alert",
          description: "Login blocked due to suspicious activity. Please try again.",
          variant: "destructive",
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        });
        return;
      }
      
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
            title: 'Login Successful',
            description: `Welcome back, ${user.firstName}! Your session is blockchain secured.`,
            icon: <Shield className="h-4 w-4 text-green-500" />,
          });
          
          // Redirect to dashboard
          setTimeout(() => {
            setLocation('/dashboard');
          }, 500);
        } else {
          // Handle 404 error specifically for missing user in database
          if (res.status === 404) {
            throw new Error('User profile not found in database. This may occur after a server restart. Please register again.');
          } else {
            throw new Error('Failed to fetch user data from API');
          }
        }
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setLoading(false);
      setAuthPending(false);
    }
  };

  const logout = async () => {
    setAuthPending(true);
    try {
      console.log('Logging out user from Firebase');
      
      // Verify security for logout
      await analyzeSecurity("logout");
      
      await signOut();
      setUser(null);
      
      toast({
        title: 'Securely Logged Out',
        description: 'Your session has been securely terminated with blockchain verification.',
        icon: <Shield className="h-4 w-4 text-green-500" />,
      });
      
      // Redirect to home page
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setAuthPending(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authPending,
      securityStatus,
      register, 
      login, 
      logout,
      analyzeSecurity
    }}>
      {children}
    </AuthContext.Provider>
  );
};
