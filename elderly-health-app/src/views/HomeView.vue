<template>
  <!-- Navbar -->
  <MDBNavbar expand="lg" light bg="light" container>
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
        <!-- Avatar -->
        <MDBDropdown class="nav-item" v-model="dropdown6">
          <MDBDropdownToggle tag="a" class="nav-link" @click="dropdown6 = !dropdown6">
            <img
              src="https://mdbootstrap.com/img/Photos/Avatars/img (31).webp"
              class="rounded-circle"
              height="22"
              alt=""
              loading="lazy"
            />
          </MDBDropdownToggle>
          <MDBDropdownMenu>
            <MDBDropdownItem href="#">My profile</MDBDropdownItem>
            <MDBDropdownItem href="#">Settings</MDBDropdownItem>
            <MDBDropdownItem href="#">Logout</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBNavbarNav>
    </MDBCollapse>
  </MDBNavbar>

  <!-- Header Section with Background Image -->
  <header class="bg-image text-white text-center" style="background-image: url('https://example.com/background.jpg'); background-size: cover; background-position: center; height: 80vh;">
    <div class="d-flex flex-column justify-content-center align-items-center h-100">
      <h1 class="display-4 font-weight-bold">Welcome to the Elderly Health App</h1>
      <p class="lead">Your health, our priority. Stay fit and healthy with personalized tips and support.</p>
      <MDBBtn color="primary" size="lg" class="mt-4">Get Started</MDBBtn>
    </div>
  </header>

  <!-- Introduction Section -->
  <section class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2 text-center">
        <h2>About Our App</h2>
        <p class="lead">The Elderly Health App is designed to help seniors stay healthy, active, and connected. With personalized health tips, exercise routines, and reminders, our app is your companion in maintaining a healthy lifestyle.</p>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="container mt-5">
    <div class="row text-center">
      <div class="col-md-4">
        <MDBIcon fas icon="heartbeat" size="3x" class="mb-3" />
        <h3>Health Monitoring</h3>
        <p>Track your vital signs and health metrics easily with our intuitive interface.</p>
      </div>
      <div class="col-md-4">
        <MDBIcon fas icon="running" size="3x" class="mb-3" />
        <h3>Exercise Routines</h3>
        <p>Access custom exercise plans tailored to your needs to keep you active.</p>
      </div>
      <div class="col-md-4">
        <MDBIcon fas icon="calendar-check" size="3x" class="mb-3" />
        <h3>Reminders</h3>
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
import { ref } from 'vue';

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
    const collapse1 = ref(false);
    const dropdown1 = ref(false);
    const dropdown6 = ref(false);
    return {
      collapse1,
      dropdown1,
      dropdown6
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