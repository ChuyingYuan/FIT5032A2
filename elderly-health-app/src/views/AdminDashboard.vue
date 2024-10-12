<template>
  <MDBNavbar expand="lg" light bg="light" container class="fixed-top">
    <MDBNavbarBrand href="#">Admin Dashboard</MDBNavbarBrand>
    <MDBNavbarToggler @click="collapse1 = !collapse1" target="#navbarSupportedContent"></MDBNavbarToggler>
    <MDBCollapse v-model="collapse1" id="navbarSupportedContent">
      <MDBNavbarNav class="mb-2 mb-lg-0">
        <MDBNavbarItem href="/">Home</MDBNavbarItem>
        <MDBNavbarItem href="/features">Features</MDBNavbarItem>
        <MDBNavbarItem href="/contact">Contact</MDBNavbarItem>
        <MDBNavbarItem href="/about">About</MDBNavbarItem>
      </MDBNavbarNav>
      <MDBNavbarNav right>
        <MDBDropdown class="nav-item" v-model="dropdown6">
          <MDBDropdownToggle tag="a" class="nav-link" @click.stop="dropdown6 = !dropdown6">
            <img :src="userPhotoURL || 'https://mdbootstrap.com/img/Photos/Avatars/img (31).webp'"
              class="rounded-circle" height="22" alt="User Avatar" loading="lazy" />
          </MDBDropdownToggle>
          <MDBDropdownMenu>
            <MDBDropdownItem href="#" @click="logout">Logout</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBNavbarNav>
    </MDBCollapse>
  </MDBNavbar>

  <div class="container mt-8 d-flex">
    <!-- Appointment Form Section -->
    <div class="col-md-6">
      <h2>Health Consult Appointment</h2>
      <form @submit.prevent="submitAppointment">
        <MDBInput v-model="appointmentForm.name" label="Full Name" type="text" required class="mb-3" size="small" />
        <MDBInput v-model="appointmentForm.email" label="Email" type="email" readonly class="mb-3" />
        <MDBInput v-model="appointmentForm.phone" label="Phone Number" type="tel" required class="mb-3" />

        <!-- Date Picker -->
        <Datepicker v-model="appointmentForm.date" label="Appointment Date"
          :input-props="{ placeholder: 'Select a date' }" required class="mb-3" />

        <!-- Time Picker (only allows hour selection) -->
        <Timepicker v-model="appointmentForm.time" label="Appointment Time" :disabled-minutes="true" :minute-step="60"
          :hour-options="[9, 10, 11, 12, 13, 14, 15, 16, 17]" format="HH:00" required class="mb-3" />

        <MDBBtn type="submit" color="primary" block>Book Appointment</MDBBtn>
      </form>

      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>

    <!-- Booking Table Section -->
    <div class="col-md-6">
      <h3>Your Current Bookings</h3>
      <div v-if="appointments.length === 0">
        <p>No appointments found.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Time</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in appointments" :key="appointment.id">
              <td>{{ appointment.date }}</td>
              <td>{{ appointment.time }}</td>
              <td><button class="btn btn-danger btn-sm" @click="deleteAppointment(appointment.id)">Cancel</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase'; // Add Firestore reference
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Datepicker from 'vue3-datepicker';  // Import Datepicker
import Timepicker from 'vue3-timepicker';  // Import Timepicker
import 'vue3-timepicker/dist/VueTimepicker.css'; // Import CSS for Timepicker

import {
  MDBInput,
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
} from "mdb-vue-ui-kit";

export default {
  components: {
    MDBInput,
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
    Datepicker,
    Timepicker,  // Register the Timepicker component
  },
  setup() {
    const appointmentForm = ref({
      name: '',
      email: '',
      phone: '',
      date: null,
      time: null
    });
    const successMessage = ref('');
    const errorMessage = ref('');
    const appointments = ref([]);  // Store user's bookings

    // Function to handle the appointment submission
    const submitAppointment = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('You need to be logged in to book an appointment.');
        }

        const userId = user.uid;
        const appointmentData = {
          ...appointmentForm.value,
          userId,
          id: Date.now(),
        };

        const response = await fetch('https://us-central1-fit5032a2-83d10.cloudfunctions.net/bookAppointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
          successMessage.value = 'Appointment booked successfully!';
          errorMessage.value = '';
          fetchUserAppointments();  // Refresh the booking list after appointment is booked
        } else {
          throw new Error('Failed to book the appointment.');
        }
      } catch (error) {
        errorMessage.value = error.message;
        successMessage.value = '';
      }
    };

    // Function to fetch current user's appointments from Firestore
    const fetchUserAppointments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'appointments'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        appointments.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    // Function to delete an appointment
    const deleteAppointment = async (appointmentId) => {
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        appointments.value = appointments.value.filter(app => app.id !== appointmentId);
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    };

    // Capture the logged-in user's email and fetch appointments on mount
    onMounted(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          appointmentForm.value.email = user.email;
          fetchUserAppointments();
        }
      });
    });

    return {
      appointmentForm,
      submitAppointment,
      successMessage,
      errorMessage,
      appointments,
      deleteAppointment,
    };
  }
};
</script>

<style scoped>
.container {
  margin-top: 80px;
  /* Adjust this value to match the height of the navbar */
}
</style>
