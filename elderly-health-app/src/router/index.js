import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import HealthResources from '../views/HealthResources.vue';
import UserProfile from '../views/UserProfile.vue';
import LoginView from '../views/LoginView.vue';
import SignUp from '@/views/SignUp.vue';
import AdminDashboard from '../views/AdminDashboard.vue'; // Import AdminDashboard view
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Define routes
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/health-resources', name: 'HealthResources', component: HealthResources },
  { path: '/profile', name: 'UserProfile', component: UserProfile },
  { path: '/login', name: 'LoginView', component: LoginView },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { 
    path: '/admin-dashboard', 
    name: 'AdminDashboard', 
    component: AdminDashboard, 
    meta: { requiresAdmin: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue')
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Helper function to check user role
const checkUserRole = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Retrieve user role from Firestore
          const roleDoc = await getDoc(doc(db, 'users', user.uid));
          const userRole = roleDoc.exists() ? roleDoc.data().role : 'user';
          resolve(userRole);
        } catch (error) {
          console.error('Failed to retrieve user role:', error);
          resolve('user'); // Default to 'user' on error
        }
      } else {
        resolve(null); // User is not logged in
      }
      unsubscribe(); // Unsubscribe from onAuthStateChanged listener
    });
  });
};

// Navigation guard to check admin role
router.beforeEach(async (to, from, next) => {
  // If the route requires admin access
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const userRole = await checkUserRole();

    if (userRole === 'admin') {
      next(); // Allow access if the user is an admin
    } else if (userRole === 'user' || userRole === null) {
      next({ name: 'home' }); // Redirect to home if not an admin or not logged in
    }
  } else {
    next(); // Continue to next route if no admin access is required
  }
});

export default router;
