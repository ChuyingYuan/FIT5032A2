<template>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-4 offset-md-4">
                <h1 class="text-center" style="margin-top: 20%;">Sign Up</h1>
                <form @submit.prevent="handleSignup" style="margin-top: 10%;">
                    <!-- 2 column grid layout with text inputs for the first and last names -->
                    <MDBRow class="mb-4">
                        <MDBCol>
                            <MDBInput type="text" label="First name" id="form3FirstName" v-model="form3FirstName" required />
                        </MDBCol>
                        <MDBCol>
                            <MDBInput type="text" label="Last name" id="form3LastName" v-model="form3LastName" required />
                        </MDBCol>
                    </MDBRow>
                    <!-- Email input -->
                    <MDBInput type="email" label="Email address" id="form3Email" v-model="form3Email" wrapperClass="mb-4" required />
                    <!-- Password input -->
                    <MDBInput type="password" label="Password" id="form3Password" v-model="form3Password" wrapperClass="mb-4" required />

                    <!-- Checkbox -->
                    <MDBCheckbox label="Remember me" id="form3SubscribeCheck" v-model="form3SubscribeCheck" wrapperClass="d-flex justify-content-center mb-4" />

                    <!-- Submit button -->
                    <MDBBtn type="submit" color="primary" block class="mb-4"> Sign up </MDBBtn>

                    <!-- Register buttons -->
                    <div class="text-center">
                        <p>or sign up with:</p>
                        <MDBBtn color="secondary" floating class="mx-1">
                            <MDBIcon iconStyle="fab" icon="facebook-f" />
                        </MDBBtn>

                        <MDBBtn color="secondary" floating class="mx-1">
                            <MDBIcon iconStyle="fab" icon="google" />
                        </MDBBtn>

                        <MDBBtn color="secondary" floating class="mx-1">
                            <MDBIcon iconStyle="fab" icon="twitter" />
                        </MDBBtn>

                        <MDBBtn color="secondary" floating class="mx-1">
                            <MDBIcon iconStyle="fab" icon="github" />
                        </MDBBtn>
                    </div>
                </form>

                <!-- Alert Notifications -->
                <div v-if="showSuccess" class="alert alert-success" role="alert" style="margin-top: 10%;">
                    Signup successful! Redirecting to login...
                </div>
                <div v-if="showError" class="alert alert-danger" role="alert">
                    Signup failed: {{ errorMessage }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { signup } from '../composables/auth';  // Ensure this is the correct path
import {
    MDBRow,
    MDBCol,
    MDBInput,
    MDBCheckbox,
    MDBBtn,
    MDBIcon
} from "mdb-vue-ui-kit";
import { ref } from "vue";
import { useRouter } from 'vue-router';

export default {
    components: {
        MDBRow,
        MDBCol,
        MDBInput,
        MDBCheckbox,
        MDBBtn,
        MDBIcon
    },
    setup() {
        const router = useRouter();  // Get the router instance

        const form3FirstName = ref("");
        const form3LastName = ref("");
        const form3Email = ref("");
        const form3Password = ref("");
        const form3SubscribeCheck = ref(true);

        const showSuccess = ref(false);
        const showError = ref(false);
        const errorMessage = ref("");

        const handleSignup = async () => {
            try {
                // Sign up the user with Firebase Authentication
                await signup(form3Email.value, form3Password.value, "user", form3FirstName.value, form3LastName.value);
                showSuccess.value = true;

                // Redirect after a short delay
                setTimeout(() => {
                    router.push('/login');  // Redirect to the login page after successful signup
                }, 2000);

            } catch (error) {
                // Show error message
                showError.value = true;
                errorMessage.value = error.message;

                // Hide the error message after a few seconds
                setTimeout(() => {
                    showError.value = false;
                }, 3000);
            }
        };

        return {
            form3FirstName,
            form3LastName,
            form3Email,
            form3Password,
            form3SubscribeCheck,
            handleSignup,
            showSuccess,
            showError,
            errorMessage
        };
    },
};
</script>
