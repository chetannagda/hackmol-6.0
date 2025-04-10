import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication functions
export const createUser = async (email, password) => {
  try {
    console.log("Creating user in Firebase Auth");
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const signIn = async (email, password) => {
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

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Database functions
export const saveUserData = async (uid, userData) => {
  try {
    console.log(`Storing user data in Firebase Database for UID: ${uid}`);
    await set(ref(database, `users/${uid}`), userData);
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

export const getUserData = async (uid) => {
  try {
    console.log(`Fetching user data from Firebase Database for UID: ${uid}`);
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Create a verification record
export const createPaymentVerification = async (senderId, receiverId, amount, paymentType) => {
  try {
    const verificationRef = ref(database, `verifications/${Date.now()}`);
    const verificationData = {
      senderId,
      receiverId,
      amount,
      paymentType,
      createdAt: Date.now(),
      status: 'pending',
      expiresAt: Date.now() + 60 * 10 * 1000, // 10 minutes expiry
      code: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
    };
    
    await set(verificationRef, verificationData);
    return { success: true, verificationId: verificationRef.key, code: verificationData.code };
  } catch (error) {
    console.error("Error creating payment verification:", error);
    return { success: false, error };
  }
};

// Verify a payment code
export const verifyPaymentCode = async (code, receiverId) => {
  try {
    // Get all verifications
    const verificationsRef = ref(database, 'verifications');
    const snapshot = await get(verificationsRef);
    
    if (!snapshot.exists()) {
      return { success: false, message: "No verification requests found" };
    }
    
    let matchedVerification = null;
    
    // Find the matching verification
    snapshot.forEach((childSnapshot) => {
      const verification = childSnapshot.val();
      // Check if code matches and verification is for this receiver
      if (verification.code === code && verification.receiverId === receiverId) {
        matchedVerification = { ...verification, id: childSnapshot.key };
      }
    });
    
    if (!matchedVerification) {
      return { success: false, message: "Invalid verification code" };
    }
    
    // Check if expired
    if (matchedVerification.expiresAt < Date.now()) {
      return { success: false, message: "Verification code has expired" };
    }
    
    // Update verification status
    await update(ref(database, `verifications/${matchedVerification.id}`), {
      status: 'verified',
      verifiedAt: Date.now()
    });
    
    return { success: true, verification: matchedVerification };
  } catch (error) {
    console.error("Error verifying payment code:", error);
    return { success: false, error };
  }
};

// Send money between users
export const sendMoney = async (senderId, receiverId, amount, note = "") => {
  try {
    const timestamp = Date.now();
    const transactionId = `txn_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Get sender and receiver data
    const senderSnapshot = await get(ref(database, `users/${senderId}`));
    const receiverSnapshot = await get(ref(database, `users/${receiverId}`));
    
    if (!senderSnapshot.exists() || !receiverSnapshot.exists()) {
      throw new Error("User not found");
    }
    
    const sender = senderSnapshot.val();
    const receiver = receiverSnapshot.val();
    
    // Check for sufficient balance
    const senderBalance = sender.walletBalance || 0;
    if (senderBalance < amount) {
      throw new Error("Insufficient balance");
    }
    
    // Update sender's balance
    await update(ref(database, `users/${senderId}`), {
      walletBalance: senderBalance - amount
    });
    
    // Update receiver's balance
    const receiverBalance = receiver.walletBalance || 0;
    await update(ref(database, `users/${receiverId}`), {
      walletBalance: receiverBalance + amount
    });
    
    // Record transaction
    await set(ref(database, `transactions/${transactionId}`), {
      senderId,
      receiverId,
      amount,
      note,
      type: "UPI",
      status: "completed",
      createdAt: timestamp
    });
    
    return {
      success: true,
      transactionId,
      message: "Payment successful"
    };
  } catch (error) {
    console.error("Error sending money:", error);
    throw error;
  }
};

/**
 * Get user notifications
 * @param {string} uid - User UID
 * @param {number} limit - Maximum number of notifications to return
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (uid, limit = 20) => {
  try {
    const notificationsRef = query(
      ref(database, `notifications/${uid}`),
      orderByChild('createdAt'),
      limitToLast(limit)
    );
    
    const snapshot = await get(notificationsRef);
    const notifications = [];
    
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
 * @param {string} uid - User UID
 * @param {Function} callback - Function to call when notifications change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (uid, callback) => {
  const notificationsRef = query(
    ref(database, `notifications/${uid}`),
    orderByChild('createdAt')
  );
  
  // Set up the real-time listener
  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    const notifications = [];
    
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
 * @param {string} uid - User UID
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (uid, notificationId) => {
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

/**
 * Create a notification for a user
 * @param {string} uid - User UID
 * @param {Object} notification - Notification data
 * @returns {Promise<string|null>} Notification ID
 */
export const createNotification = async (uid, notification) => {
  try {
    const notificationRef = push(ref(database, `notifications/${uid}`));
    await set(notificationRef, notification);
    return notificationRef.key;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Make sure database is NOT included in this list
export { auth, ref, get, update, query, orderByChild, limitToLast, onValue, remove, orderByKey, equalTo, push };