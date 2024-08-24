// src/composables/auth.js
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const user = ref(null);
const role = ref(null);

const checkAuthState = () => {
  onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      user.value = authUser;

      // Fetch user role from Firestore
      const roleDoc = await getDoc(doc(db, 'roles', authUser.uid));
      role.value = roleDoc.exists() ? roleDoc.data().role : 'guest';
    } else {
      user.value = null;
      role.value = 'guest';
    }
  });
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login failed', error);
  }
};

const signup = async (email, password, userRole, firstName, lastName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      role: userRole,
      firstName: firstName,
      lastName: lastName,
      email: email,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Sign-up failed', error);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed', error);
  }
};

onMounted(checkAuthState);

export { user, role, login, signup, logout };
