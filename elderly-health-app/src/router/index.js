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

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/health-resources', component: HealthResources },
  { path: '/profile', component: UserProfile },
  { path: '/login', component: LoginView },
  { path: '/signup', component: SignUp },
  { 
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard, 
    meta: { requiresAdmin: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation Guard to check admin role
router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (user) {
      const roleDoc = await getDoc(doc(db, 'roles', user.uid));
      const userRole = roleDoc.exists() ? roleDoc.data().role : 'user';
      if (userRole === 'admin') {
        next();
      } else {
        next({ name: 'home' }); // Redirect to home if not admin
      }
    } else {
      next({ name: 'home' }); // Redirect to home if not logged in
    }
  } else {
    next(); // Make sure to always call next()
  }
});

export default router;
