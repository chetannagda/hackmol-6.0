import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  query, 
  orderByChild, 
  limitToLast, 
  onValue, 
  update,
  orderByKey,
  equalTo,
  remove
} from "firebase/database";

// Firebase configuration with your credentials
const firebaseConfig = {
  apiKey: "AIzaSyAxMC1m885flbWNESU6EMdGi-3VuPcyXcM",
  authDomain: "hackmol-4be8a.firebaseapp.com",
  projectId: "hackmol-4be8a",
  storageBucket: "hackmol-4be8a.firebasestorage.app",
  messagingSenderId: "1051733608050",
  appId: "1:1051733608050:web:3019061d727189112e24eb",
  measurementId: "G-Y3WWZVX2FN",
  databaseURL: "https://hackmol-4be8a-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Console log for debugging environment variables
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "API_KEY_SET" : "API_KEY_NOT_SET",
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication functions
export const createUser = async (email: string, password: string) => {
  try {
    console.log("Creating user in Firebase Auth");
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Signing in user with Firebase Auth");
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    console.log("Signing out user from Firebase Auth");
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Database functions
export const saveUserData = async (uid: string, userData: any) => {
  try {
    console.log(`Storing user data in Firebase Database for UID: ${uid}`);
    console.log('User Data:', userData);
    await set(ref(database, `users/${uid}`), userData);
    console.log('User data successfully stored.');
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

export const saveTransaction = async (transaction: any) => {
  try {
    console.log("Storing transaction in Firebase Database");
    const transactionRef = push(ref(database, 'transactions'));
    await set(transactionRef, {
      ...transaction,
      timestamp: Date.now()
    });
    return transactionRef.key;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
};

export const getUserData = async (uid: string) => {
  try {
    console.log(`Fetching user data from Firebase Database for UID: ${uid}`);
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      console.log('User data found:', snapshot.val());
      return snapshot.val();
    } else {
      console.log('No user data found.');
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const getUserTransactions = async (uid: string, limit: number = 10) => {
  try {
    console.log("Fetching user transactions from Firebase Database");
    const transactionsRef = query(
      ref(database, 'transactions'),
      orderByChild('userId'),
      limitToLast(limit)
    );
    const snapshot = await get(transactionsRef);
    const transactions: any[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const transaction = childSnapshot.val();
        if (transaction.senderId === uid || transaction.receiverId === uid) {
          transactions.push({
            id: childSnapshot.key,
            ...transaction
          });
        }
      });
    }
    return transactions;
  } catch (error) {
    console.error("Error getting user transactions:", error);
    throw error;
  }
};

// Real-time notification functions

/**
 * Create a payment verification code and save it to Firebase
 * @param senderUid Sender Firebase UID
 * @param receiverUid Receiver Firebase UID
 * @param amount Payment amount
 * @param paymentType Payment type (UPI, BANK, INTERNATIONAL)
 * @returns Verification code
 */
export const createPaymentVerification = async (
  senderUid: string, 
  receiverUid: string,
  amount: number,
  paymentType: 'UPI' | 'BANK' | 'INTERNATIONAL'
) => {
  try {
    console.log("Creating payment verification in Firebase");
    
    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const verificationRef = push(ref(database, 'payment_verifications'));
    await set(verificationRef, {
      senderUid,
      receiverUid,
      amount,
      paymentType,
      verificationCode,
      status: 'PENDING',
      createdAt: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes expiry
    });
    
    // Also create a notification for the receiver
    await createNotification(receiverUid, {
      type: 'PAYMENT_REQUEST',
      title: 'Payment Verification',
      message: `You have a pending payment verification of ${amount.toFixed(2)} via ${paymentType}`,
      verificationCode,
      amount,
      senderUid,
      paymentType,
      createdAt: Date.now(),
      isRead: false,
    });
    
    return verificationCode;
  } catch (error) {
    console.error("Error creating payment verification:", error);
    throw error;
  }
};

/**
 * Verify a payment code
 * @param code Verification code
 * @param receiverUid Receiver's UID to verify
 * @returns Whether verification was successful
 */
export const verifyPaymentCode = async (code: string, receiverUid: string) => {
  try {
    console.log("Verifying payment code in Firebase");
    
    // Query verification by code
    const verificationsRef = query(
      ref(database, 'payment_verifications'),
      orderByChild('verificationCode'),
      equalTo(code)
    );
    
    const snapshot = await get(verificationsRef);
    
    if (!snapshot.exists()) {
      return { success: false, message: 'Invalid verification code' };
    }
    
    let verificationId: string | null = null;
    let verification: any = null;
    
    snapshot.forEach((childSnapshot) => {
      verificationId = childSnapshot.key;
      verification = childSnapshot.val();
    });
    
    if (!verification) {
      return { success: false, message: 'Verification not found' };
    }
    
    if (verification.receiverUid !== receiverUid) {
      return { success: false, message: 'This code is not valid for your account' };
    }
    
    if (verification.status !== 'PENDING') {
      return { success: false, message: 'This code has already been used' };
    }
    
    if (verification.expiresAt < Date.now()) {
      return { success: false, message: 'This code has expired' };
    }
    
    // Update the verification status
    if (verificationId) {
      await update(ref(database, `payment_verifications/${verificationId}`), {
        status: 'VERIFIED',
        verifiedAt: Date.now()
      });
      
      // Create notification for the sender
      await createNotification(verification.senderUid, {
        type: 'PAYMENT_VERIFIED',
        title: 'Payment Verified',
        message: `Your payment of ${verification.amount.toFixed(2)} was verified successfully`,
        amount: verification.amount,
        paymentType: verification.paymentType,
        createdAt: Date.now(),
        isRead: false,
      });
    }
    
    return { 
      success: true, 
      message: 'Verification successful', 
      data: verification 
    };
  } catch (error) {
    console.error("Error verifying payment code:", error);
    throw error;
  }
};

/**
 * Create a notification for a user
 * @param uid User UID
 * @param notification Notification data
 * @returns Notification ID
 */
export const createNotification = async (uid: string, notification: any) => {
  try {
    const notificationRef = push(ref(database, `notifications/${uid}`));
    await set(notificationRef, notification);
    return notificationRef.key;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get user notifications
 * @param uid User UID
 * @param limit Maximum number of notifications to return
 * @returns Array of notifications
 */
export const getUserNotifications = async (uid: string, limit: number = 20) => {
  try {
    const notificationsRef = query(
      ref(database, `notifications/${uid}`),
      orderByChild('createdAt'),
      limitToLast(limit)
    );
    
    const snapshot = await get(notificationsRef);
    const notifications: any[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Sort by createdAt in descending order (newest first)
    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Subscribe to user notifications in real-time
 * @param uid User UID
 * @param callback Function to call when notifications change
 * @returns Unsubscribe function
 */
export const subscribeToNotifications = (uid: string, callback: (notifications: any[]) => void) => {
  const notificationsRef = query(
    ref(database, `notifications/${uid}`),
    orderByChild('createdAt')
  );
  
  // Set up the real-time listener
  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    const notifications: any[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Sort by createdAt in descending order (newest first)
    callback(notifications.sort((a, b) => b.createdAt - a.createdAt));
  });
  
  return unsubscribe;
};

/**
 * Mark a notification as read
 * @param uid User UID
 * @param notificationId Notification ID
 */
export const markNotificationAsRead = async (uid: string, notificationId: string) => {
  try {
    await update(ref(database, `notifications/${uid}/${notificationId}`), {
      isRead: true
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export { auth, database };
