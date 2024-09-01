<template>
  <!-- Navbar -->
  <MDBNavbar expand="lg" light bg="light" container class="fixed-top">
    <MDBNavbarBrand href="#">Elderly Health App</MDBNavbarBrand>
    <MDBNavbarToggler @click="collapse1 = !collapse1" target="#navbarSupportedContent"></MDBNavbarToggler>
    <MDBCollapse v-model="collapse1" id="navbarSupportedContent">
      <MDBNavbarNav class="mb-2 mb-lg-0">
        <MDBNavbarItem to="#" active>Home</MDBNavbarItem>
        <MDBNavbarItem href="#">Features</MDBNavbarItem>
        <MDBNavbarItem href="#">Contact</MDBNavbarItem>
        <MDBNavbarItem href="#">About</MDBNavbarItem>
      </MDBNavbarNav>
      <MDBNavbarNav right>
        <div v-if="isLoggedIn">
          <!-- Avatar -->
          <MDBDropdown class="nav-item" v-model="dropdown6">
            <MDBDropdownToggle tag="a" class="nav-link" @click="dropdown6 = !dropdown6">
              <img :src="userPhotoURL || 'https://mdbootstrap.com/img/Photos/Avatars/img (31).webp'"
                class="rounded-circle" height="22" alt="User Avatar" loading="lazy" />
            </MDBDropdownToggle>
            <MDBDropdownMenu>
              <MDBDropdownItem href="#" @click="logout">Logout</MDBDropdownItem>
            </MDBDropdownMenu>
          </MDBDropdown>
        </div>
        <div v-else>
          <MDBBtn color="primary" @click="$router.push('/login')">Login</MDBBtn>
        </div>
      </MDBNavbarNav>
    </MDBCollapse>
  </MDBNavbar>

  <!-- Header Section with Background Image -->
  <header class="bg-image text-black text-center"
    style="background-image: url('../src/assets/img/homebgimage.jpg'); background-size: cover; background-position: center; height: 100vh;">
    <div class="d-flex flex-column justify-content-center align-items-center h-100">
      <h1 class="display-4 font-weight-bold" style="color: black;">Welcome to the Elderly Health App</h1>
      <p class="lead" style="color: black;">Your health, our priority. Stay fit and healthy with personalized tips and
        support.</p>
      <MDBBtn color="primary" size="lg" class="mt-4">Get Started With Explore Health Resources</MDBBtn>
    </div>
  </header>

  <!-- Introduction Section -->
  <section class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2 text-center">
        <h2>About Our App</h2>
        <p class="lead">The Elderly Health App is designed to help seniors stay healthy, active, and connected. With
          personalized health tips, exercise routines, and reminders, our app is your companion in maintaining a healthy
          lifestyle.</p>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="container mt-5" style="margin-bottom: 5%;">
    <div class="row text-center">
      <div class="col-md-3">
        <MDBIcon fas icon="stethoscope" size="3x" class="mb-3" />
        <h3>Health Consult Appointments</h3>
        <p>Updated to reflect the purpose of managing and monitoring well-being.</p>
      </div>
      <div class="col-md-3 clickable" style="cursor: pointer;" @click="$router.push('/health-resources')">
        <MDBIcon fas icon="book-open" size="3x" class="mb-3" />
        <h3>Health Resources</h3>
        <p>Updated to reflect the purpose of managing and monitoring well-being.</p>
      </div>
      <div class="col-md-3">
        <MDBIcon fas icon="map-marked-alt" size="3x" class="mb-3" />
        <h3>Health Department Map</h3>
        <p>Access custom exercise plans tailored to your needs to keep you active.</p>
      </div>
      <div class="col-md-3">
        <MDBIcon fas icon="calendar-alt" size="3x" class="mb-3" />
        <h3>Events</h3>
        <p>Set reminders for medication, appointments, and more to stay on track.</p>
      </div>
    </div>
  </section>
</template>

<script>
import {
  MDBBtn,
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBCollapse,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBIcon
} from 'mdb-vue-ui-kit';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase'; // Ensure you import the Firebase auth instance
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default {
  components: {
    MDBBtn,
    MDBNavbar,
    MDBNavbarToggler,
    MDBNavbarBrand,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBCollapse,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBIcon
  },
  setup() {
    const router = useRouter();
    const collapse1 = ref(false);
    const dropdown6 = ref(false);
    const isLoggedIn = ref(false);
    const userPhotoURL = ref('');

    // Monitor authentication state
    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          isLoggedIn.value = true;
          userPhotoURL.value = user.photoURL;
        } else {
          isLoggedIn.value = false;
          userPhotoURL.value = '';
        }
      });
    });

    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error.message);
      }
    };

    return {
      collapse1,
      dropdown6,
      isLoggedIn,
      userPhotoURL,
      logout
    };
  }
};
</script>

<style scoped>
.bg-image {
  background: no-repeat center center fixed;
  background-size: cover;
}

header h1 {
  color: #fff;
  font-size: 3.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

header p {
  color: #fff;
  font-size: 1.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

section h2 {
  margin-bottom: 2rem;
  font-weight: bold;
}

section p.lead {
  font-size: 1.25rem;
  margin-bottom: 3rem;
}

section h3 {
  margin-top: 1.5rem;
  font-weight: bold;
}
</style>
