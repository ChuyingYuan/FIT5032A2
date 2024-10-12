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
        <div class="col-md-5">
            <h2>Health Consult Appointment</h2>
            <form @submit.prevent="submitAppointment" class="mt-5">
                <h6>Name: </h6>
                <MDBInput v-model="appointmentForm.name" type="text" required class="mb-3" size="small" />
                <h6>Email: </h6>
                <MDBInput v-model="appointmentForm.email" type="email" readonly class="mb-3" />
                <h6>Phone: </h6>
                <MDBInput v-model="appointmentForm.phone" type="tel" required class="mb-3" />

                <!-- Date Picker -->
                <h6>Date: </h6>
                <Datepicker v-model="appointmentForm.date" label="Appointment Date"
                    :input-props="{ placeholder: 'Select a date' }" required class="mb-3" />

                <!-- Time Picker (only allows hour selection) -->
                <h6>Time: </h6>
                <Timepicker v-model="appointmentForm.time" label="Appointment Time" :disabled-minutes="true"
                    :minute-step="60" :hour-options="[9, 10, 11, 12, 13, 14, 15, 16, 17]" format="HH:00" required
                    class="mb-3" />

                <MDBBtn type="submit" color="primary" block>Book Appointment</MDBBtn>
            </form>

            <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
        </div>
        <div class="col-md-2"></div>

        <!-- Booking Table Section -->
        <div class="col-md-5">
            <h2>Your Current Bookings</h2>
            <div v-if="appointments.length === 0">
                <p>No appointments found.</p>
            </div>
            <div v-else class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="appointment in appointments" :key="appointment.id">
                            <!-- Format the date to dd/mm/yyyy -->
                            <td>{{ formatDate(appointment.date) }}</td>
                            <!-- Display only the hour -->
                            <td>{{ formatTime(appointment.time) }}</td>
                            <td>{{ appointment.status }}</td>
                            <td><button class="btn btn-danger btn-sm"
                                    @click="deleteAppointment(appointment.id)">Cancel</button></td>
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
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
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

        const formatDate = (date) => {
            // Handle Firestore Timestamp or ISO string formats
            if (date.seconds) {
                // If the date is a Firestore Timestamp, convert it to a JS Date object
                const jsDate = new Date(date.seconds * 1000);
                return jsDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } else if (typeof date === 'string') {
                // If the date is an ISO string, convert it to a JS Date object
                const jsDate = new Date(date);
                return jsDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } else {
                return 'Invalid Date';  // Fallback for incorrect formats
            }
        };


        const formatTime = (time) => {
            // Extract and display the hour from the time
            return `${time.HH}:00`;
        };

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
                    status: 'created', // New field: status
                };

                // Call the Firebase Cloud Function
                const response = await fetch('https://us-central1-fit5032a2-83d10.cloudfunctions.net/bookAppointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(appointmentData),
                });

                const result = await response.json();

                if (response.ok) {
                    successMessage.value = 'Appointment booked successfully!';
                    appointmentData.id = result.appointmentData.id; // Store the Firestore document ID returned by Cloud Function
                    errorMessage.value = '';
                    fetchUserAppointments();  // Refresh the booking list after appointment is booked
                } else {
                    throw new Error(result.message || 'Failed to book the appointment.');
                }
            } catch (error) {
                errorMessage.value = error.message;
                successMessage.value = '';
            }
        };


        const fetchUserAppointments = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                // Query appointments for the current user
                const q = query(collection(db, 'appointments'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);

                appointments.value = querySnapshot.docs.map(doc => ({
                    id: doc.id,  // Firestore document ID
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Failed to fetch appointments:', error);
            }
        };
        const deleteAppointment = async (appointmentId) => {
            try {
                const appointmentDocRef = doc(db, 'appointments', appointmentId);

                // Attempt to get the document from Firestore before deletion
                const appointmentSnapshot = await getDoc(appointmentDocRef);

                if (appointmentSnapshot.exists()) {
                    await deleteDoc(appointmentDocRef);
                    appointments.value = appointments.value.filter(app => app.id !== appointmentId);
                    successMessage.value = 'Appointment cancelled successfully!';
                } else {
                    console.error('Appointment not found, cannot delete');
                }
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
            formatDate,
            formatTime,
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