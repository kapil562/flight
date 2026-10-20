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
  const name = customName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveller';
  const avatar = firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true`;
  
  return {
    id: firebaseUser.uid || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    photoURL: firebaseUser.photoURL || null,
    avatar,
    role: 'traveller',
    tier: 'SkyClub Member',
    points: 500,
    provider: firebaseUser.providerData?.[0]?.providerId || 'firebase'
  };
};

export const syncUserToBackend = async (user) => {
  try {
    const res = await fetch('/api/auth/customer-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        method: user.provider || 'firebase'
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend sync warning (continuing with local session):', err);
    return null;
  }
};

export const getDemoUser = () => {
  return {
    id: 'USR-DEMO-7788',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    photoURL: null,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: 'traveller',
    tier: 'SkyClub Platinum',
    points: 1250,
    provider: 'demo'
  };
};

export const getFirebaseErrorMessage = (error) => {
  if (!error) return 'Authentication error. Please try again.';
  const code = error.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email. Please switch to "Create Account" above to register.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials or click "Forgot Password?" to reset.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please switch to "Sign In" instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g. name@example.com).';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing authentication.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site, or sign in using Email & Password below.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connectivity and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access temporarily disabled. Please reset password or try again later.';
    case 'auth/unauthorized-domain':
      return 'This web domain is not authorized in Firebase Console yet. Please add this domain to Firebase Console -> Authentication -> Settings -> Authorized domains, or sign in using Email & Password below.';
    default:
      return error.message || 'Authentication failed. Please check your credentials and try again.';
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
