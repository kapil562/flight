import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDm6CDe0g05MeUz9iAXAl1HQ1qmdgPsUuU",
  authDomain: "flight-f4835.firebaseapp.com",
  projectId: "flight-f4835",
  storageBucket: "flight-f4835.firebasestorage.app",
  messagingSenderId: "916728836584",
  appId: "1:916728836584:web:8d4c99c86279b09ed4345d",
  measurementId: "G-VLYPCG4H1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  app, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
};
