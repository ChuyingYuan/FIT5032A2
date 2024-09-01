<template>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-4 offset-md-4">
                <h1 class="text-center" style="margin-top: 20%;">Sign Up</h1>

                <div v-if="errorMessage" class="alert alert-danger text-center" role="alert" style="margin-top: 5%;">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleSignup" style="margin-top: 10%;">
                    <!-- 2 column grid layout with text inputs for the first and last names -->
                    <MDBRow class="mb-4">
                        <MDBCol>
                            <MDBInput type="text" label="First name" id="form3FirstName" v-model="form3FirstName"
                                @input="validateFirstName" required />
                            <div v-if="firstNameError" class="text-danger">{{ firstNameError }}</div>
                        </MDBCol>
                        <MDBCol>
                            <MDBInput type="text" label="Last name" id="form3LastName" v-model="form3LastName"
                                @input="validateLastName" required />
                            <div v-if="lastNameError" class="text-danger">{{ lastNameError }}</div>
                        </MDBCol>
                    </MDBRow>
                    <!-- Email input -->
                    <MDBInput type="email" label="Email address" id="form3Email" v-model="form3Email"
                        @input="validateEmail" wrapperClass="mb-4" required />
                    <div v-if="emailError" class="text-danger">{{ emailError }}</div>

                    <!-- Password input -->
                    <MDBInput type="password" label="Password" id="form3Password" v-model="form3Password"
                        @input="validatePassword" wrapperClass="mb-4" required />
                    <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>

                    <!-- Checkbox -->
                    <MDBCheckbox label="Remember me" id="form3SubscribeCheck" v-model="form3SubscribeCheck"
                        wrapperClass="d-flex justify-content-center mb-4" />

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
        const form3FirstName = ref("");
        const form3LastName = ref("");
        const form3Email = ref("");
        const form3Password = ref("");
        const form3SubscribeCheck = ref(true);

        const showSuccess = ref(false);
        const showError = ref(false);
        const errorMessage = ref("");

        const firstNameError = ref("");
        const lastNameError = ref("");
        const emailError = ref("");
        const passwordError = ref("");

        // Validation methods
        const validateFirstName = () => {
            firstNameError.value = form3FirstName.value.length < 3 ? "First name must be at least 3 characters." : "";
        };

        const validateLastName = () => {
            lastNameError.value = form3LastName.value.length < 3 ? "Last name must be at least 3 characters." : "";
        };

        const validateEmail = () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            emailError.value = !emailPattern.test(form3Email.value) ? "Invalid email format." : "";
        };

        const validatePassword = () => {
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            passwordError.value = !passwordPattern.test(form3Password.value)
                ? "Password must be at least 8 characters, include one uppercase letter, one lowercase letter, and one number."
                : "";
        };

        const handleSignup = async () => {
            validateFirstName();
            validateLastName();
            validateEmail();
            validatePassword();

            // If there are any validation errors, do not proceed with signup
            if (firstNameError.value || lastNameError.value || emailError.value || passwordError.value) {
                showError.value = true;
                return;
            }

            try {
                await signup(form3Email.value, form3Password.value, "user", form3FirstName.value, form3LastName.value);
            } catch (error) {
                showError.value = true;
                errorMessage.value = error.message;
                form3FirstName.value = "";
                form3LastName.value = "";
                form3Email.value = "";
                form3Password.value = "";
                form3SubscribeCheck.value = true;
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
            errorMessage,
            firstNameError,
            lastNameError,
            emailError,
            passwordError,
            validateFirstName,
            validateLastName,
            validateEmail,
            validatePassword
        };
    },
};
</script>