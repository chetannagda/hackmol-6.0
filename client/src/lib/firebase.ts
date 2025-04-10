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
