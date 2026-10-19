import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  updateProfile 
} from '../firebase';

export const formatFirebaseUser = (firebaseUser, customName = '') => {
  return {
    id: firebaseUser.uid,
    name: customName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveller',
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || null,
    role: 'traveller',
    tier: 'SkyClub Member',
    points: 500
  };
};

export const getFirebaseErrorMessage = (error) => {
  if (!error) return 'Authentication error. Please try again.';
  const code = error.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to many failed attempts. Try again in a few minutes or reset password.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Please add this domain in Firebase Auth Settings > Authorized Domains.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
};
