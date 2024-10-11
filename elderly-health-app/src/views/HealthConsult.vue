<template>
    <MDBNavbar expand="lg" light bg="light" container class="fixed-top" style="margin-bottom:4%">
        <MDBNavbarBrand href="#">Elderly Health App</MDBNavbarBrand>
        <MDBNavbarToggler @click="collapse1 = !collapse1" target="#navbarSupportedContent"></MDBNavbarToggler>
        <MDBCollapse v-model="collapse1" id="navbarSupportedContent">
            <MDBNavbarNav class="mb-2 mb-lg-0">
                <MDBNavbarItem to="/" active>Home</MDBNavbarItem>
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

    <div class="container" style="margin-top: 4%;">
        <h2>Health Consult Appointment</h2>
        <form @submit.prevent="submitAppointment">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <MDBInput v-model="appointmentForm.name" label="Full Name" type="text" required class="mb-3"
                    size="small" />
                <MDBInput v-model="appointmentForm.email" label="Email" type="email" required class="mb-3" />
                <MDBInput v-model="appointmentForm.phone" label="Phone Number" type="tel" required class="mb-3" />

                <!-- Date Picker -->
                <Datepicker v-model="appointmentForm.date" label="Appointment Date"
                    :input-props="{ placeholder: 'Select a date' }" required class="mb-3" />

                <!-- Time Picker (only allows hour selection) -->
                <Timepicker v-model="appointmentForm.time" label="Appointment Time" :disabled-minutes="() => true"
                    :hour-options="[9, 10, 11, 12, 13, 14, 15, 16, 17]" format="HH:mm" required class="mb-3" />

                <MDBBtn type="submit" color="primary" block>Book Appointment</MDBBtn>
            </div>
            <div class="col-md-4"></div>
        </form>

        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
</template>

<script>
import { ref } from 'vue';
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

        const submitAppointment = async () => {
            try {
                const appointmentData = { ...appointmentForm.value, id: Date.now() }; // Add unique ID
                const response = await fetch('https://<your-api-gateway-endpoint>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(appointmentData)
                });

                if (response.ok) {
                    successMessage.value = 'Appointment booked successfully!';
                    errorMessage.value = '';
                    // Clear the form
                    appointmentForm.value = {
                        name: '',
                        email: '',
                        phone: '',
                        date: null,
                        time: null
                    };
                } else {
                    throw new Error('Failed to book the appointment.');
                }
            } catch (error) {
                errorMessage.value = error.message;
                successMessage.value = '';
            }
        };

        return {
            appointmentForm,
            submitAppointment,
            successMessage,
            errorMessage
        };
    }
};
</script>

<style scoped>
/* Additional styling if needed */
</style>
