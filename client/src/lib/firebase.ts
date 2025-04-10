import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from "firebase/auth";
import { getDatabase, ref, set, push, get, query, orderByChild, limitToLast } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

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
    console.log("Storing user data in Firebase Database");
    await set(ref(database, `users/${uid}`), userData);
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
    console.log("Fetching user data from Firebase Database");
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

export { auth, database };
