<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-4 offset-md-4">
        <h1 class="text-center" style="margin-top: 20%;">Login</h1>

        <!-- Display login failed message -->
        <div v-if="errorMessage" class="alert alert-danger text-center" role="alert" style="margin-top: 5%;">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" style="margin-top: 10%;">
          <MDBInput type="email" label="Email address" id="form2Email" v-model="form2Email" wrapperClass="mb-4"
            required />
          <MDBInput type="password" label="Password" id="form2Password" v-model="form2Password" wrapperClass="mb-4"
            required />
          <MDBRow class="mb-4">
            <MDBCol class="d-flex justify-content-center">
              <!-- Checkbox -->
              <MDBCheckbox label="Remember me" id="form2LoginCheck" v-model="form2LoginCheck"
                wrapperClass="mb-3 mb-md-0" />
            </MDBCol>
            <MDBCol>
              <!-- Simple link -->
              <a href="#!">Forgot password?</a>
            </MDBCol>
          </MDBRow>
          <!-- Submit button -->
          <MDBBtn type="submit" color="primary" block> Sign in </MDBBtn>

          <!-- Register buttons -->
          <div class="text-center" style="margin-bottom: 20%;">
            <p>Not a member? <router-link to="/signup">Register</router-link></p>
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
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../composables/auth';
import {
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCheckbox,
  MDBBtn,
  MDBIcon,
} from "mdb-vue-ui-kit";
import { ref } from "vue";
import DOMPurify from 'dompurify';  // Import DOMPurify

export default {
  components: {
    MDBRow,
    MDBCol,
    MDBInput,
    MDBCheckbox,
    MDBBtn,
    MDBIcon,
  },
  setup() {
    const form2Email = ref("");
    const form2Password = ref("");
    const form2LoginCheck = ref(true);
    const errorMessage = ref(""); // State to store error message

    const sanitizeInput = (input) => {
      return DOMPurify.sanitize(input);
    };

    const handleLogin = async () => {
      try {
        // Sanitize inputs before using them
        const sanitizedEmail = sanitizeInput(form2Email.value);
        const sanitizedPassword = sanitizeInput(form2Password.value);

        await login(sanitizedEmail, sanitizedPassword);
      } catch (error) {
        // Display the error message and stay on the login page
        errorMessage.value = "Invalid email or password. Please try again.";
        console.error("Login failed:", error.message);
      }
    };

    return {
      form2Email,
      form2Password,
      form2LoginCheck,
      errorMessage,
      handleLogin,
    };
  },
};
</script>
