import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  subscribeToNotifications, 
  getUserNotifications, 
  markNotificationAsRead,
  auth
} from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: number;
  isRead: boolean;
  [key: string]: any; // Additional fields like verificationCode, amount, etc.
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  refreshNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      if (!auth.currentUser) return;
      
      await markNotificationAsRead(auth.currentUser.uid, notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to refresh notifications
  const refreshNotifications = async () => {
    try {
      if (!auth.currentUser) return;
      
      setLoading(true);
      const notifs = await getUserNotifications(auth.currentUser.uid);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setLoading(false);
    }
  };

  // Set up real-time notifications
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupNotifications = async () => {
      if (!auth.currentUser) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        // Initial fetch
        const initialNotifs = await getUserNotifications(auth.currentUser.uid);
        setNotifications(initialNotifs);
        setUnreadCount(initialNotifs.filter(n => !n.isRead).length);
        
        // Subscribe to real-time updates
        unsubscribe = subscribeToNotifications(auth.currentUser.uid, (notifs) => {
          setNotifications(notifs);
          
          // Check for new notifications
          const newUnreadCount = notifs.filter(n => !n.isRead).length;
          
          // If there are new unread notifications, show a toast
          if (newUnreadCount > unreadCount) {
            const newestNotif = notifs.find(n => !n.isRead);
            if (newestNotif) {
              // Show different toast based on notification type
              if (newestNotif.type === 'PAYMENT_REQUEST') {
                toast({
                  title: 'Payment Verification Required',
                  description: newestNotif.message,
                  icon: <Bell className="h-4 w-4 text-blue-500" />,
                  duration: 5000,
                });
              } else if (newestNotif.type === 'PAYMENT_VERIFIED') {
                toast({
                  title: 'Payment Verified',
                  description: newestNotif.message,
                  icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                  duration: 5000,
                });
              } else {
                toast({
                  title: newestNotif.title,
                  description: newestNotif.message,
                  icon: <Bell className="h-4 w-4 text-blue-500" />,
                  duration: 5000,
                });
              }
            }
          }
          
          setUnreadCount(newUnreadCount);
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    setupNotifications();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, toast, unreadCount]);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        loading,
        markAsRead,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};