<template>
  <div class="admin-dashboard">
    <!-- Navbar -->
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
            <MDBDropdownToggle tag="a" class="nav-link" @click="dropdown6 = !dropdown6">
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

    <!-- Sidebar Toggle Button for Mobile -->
    <button class="btn btn-secondary d-lg-none my-3" @click="toggleSidebar">Toggle Sidebar</button>

    <!-- Sidebar and Content Layout -->
    <div class="d-flex">
      <!-- Sidebar -->
      <div :class="['sidebar', 'bg-light', 'p-6', { 'd-none': !isSidebarVisible }]" id="sidebar">
        <MDBListGroup>
          <MDBListGroupItem active href="#" @click="setActive('dashboard')">
            <MDBIcon fas icon="tachometer-alt" class="me-2" /> Dashboard
          </MDBListGroupItem>
          <MDBListGroupItem href="#" @click="setActive('Manage Resources')">
            <MDBIcon fas icon="users" class="me-2" /> Manage Resources
          </MDBListGroupItem>
          <MDBListGroupItem href="#" @click="setActive('reports')">
            <MDBIcon fas icon="chart-line" class="me-2" /> Reports
          </MDBListGroupItem>
          <MDBListGroupItem href="#" @click="setActive('settings')">
            <MDBIcon fas icon="cogs" class="me-2" /> Settings
          </MDBListGroupItem>
        </MDBListGroup>
      </div>

      <!-- Main Content Area -->
      <div class="content p-4">
        <h3>{{ activeSection }}</h3>
        <div v-if="activeSection === 'dashboard'">
          <!-- Dashboard Content -->
          <p>Welcome to the Admin Dashboard! Here you can manage users, view reports, and adjust settings.</p>
        </div>
        <div v-if="activeSection === 'Manage Resources'">
          <!-- Resources Management Table -->
          <button class="btn btn-primary mb-3" @click="openAddResourceModal">Add New Resource</button>
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Resource</th>
                  <th scope="col">Average Rating</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="resource in resources" :key="resource.id">
                  <td>{{ resource.title }}</td>
                  <td>{{ resource.description }}</td>
                  <td><a :href="resource.url" target="_blank">View Resource</a></td>
                  <td>{{ calculateAverageRating(resource) }}</td>
                  <td>
                    <button class="btn btn-warning btn-sm" @click="editResource(resource)">Edit</button>
                    <button class="btn btn-danger btn-sm" @click="deleteResource(resource.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="activeSection === 'reports'">
          <!-- Reports Content -->
          <p>View reports here.</p>
        </div>
        <div v-if="activeSection === 'settings'">
          <!-- Settings Content -->
          <p>Adjust settings here.</p>
        </div>
      </div>
    </div>

    <!-- Modal for Adding/Editing Resources -->
    <MDBModal v-model="showResourceModal" staticBackdrop>
      <MDBModalHeader class="mt-3"> <!-- Add margin-top class here -->
        <MDBModalTitle>{{ editingResource ? 'Edit Resource' : 'Add Resource' }}</MDBModalTitle>
      </MDBModalHeader>
      <MDBModalBody>
        <MDBInput v-model="resourceForm.title" label="Title" type="text" required class="mb-3" />
        <MDBInput v-model="resourceForm.description" label="Description" type="text" required class="mb-3" />
        <MDBInput v-model="resourceForm.url" label="URL" type="url" required class="mb-3" />
      </MDBModalBody>
      <MDBModalFooter>
        <MDBBtn color="secondary" @click="closeModal">Cancel</MDBBtn>
        <MDBBtn color="primary" @click="saveResource">{{ editingResource ? 'Update' : 'Add' }}</MDBBtn>
      </MDBModalFooter>
    </MDBModal>

  </div>
</template>

<script>
import {
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
  MDBListGroup,
  MDBListGroupItem,
  MDBIcon,
  MDBModal,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBInput,
  MDBBtn
} from 'mdb-vue-ui-kit';
import { ref, onMounted } from 'vue';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default {
  components: {
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
    MDBListGroup,
    MDBListGroupItem,
    MDBIcon,
    MDBModal,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBInput,
    MDBBtn
  },
  setup() {
    const collapse1 = ref(false);
    const dropdown6 = ref(false);
    const userPhotoURL = ref('');
    const activeSection = ref('dashboard');
    const resources = ref([]);
    const showResourceModal = ref(false);
    const editingResource = ref(null);
    const resourceForm = ref({ title: '', description: '', url: '' });
    const isSidebarVisible = ref(true); // Visibility for the sidebar

    // Fetch resources from AWS S3
    const fetchResources = async () => {
      try {
        const response = await fetch('https://5032a2.s3.ap-southeast-2.amazonaws.com/resources.json');
        if (!response.ok) throw new Error('Failed to fetch resources from S3.');
        resources.value = await response.json();
      } catch (error) {
        console.error('Failed to fetch resources from S3:', error);
      }
    };

    onMounted(() => {
      fetchResources();
    });

    // Calculate average rating for a resource
    const calculateAverageRating = (resource) => {
      if (!resource.userRatings || resource.userRatings.length === 0) return 'N/A';
      const total = resource.userRatings.reduce((sum, rating) => sum + rating.rating, 0);
      return (total / resource.userRatings.length).toFixed(2);
    };

    // Function to handle section change
    const setActive = (section) => {
      activeSection.value = section;
    };

    // Toggle Sidebar visibility for mobile
    const toggleSidebar = () => {
      isSidebarVisible.value = !isSidebarVisible.value;
    };

    const openAddResourceModal = () => {
      editingResource.value = null;
      resourceForm.value = { title: '', description: '', url: '' };
      showResourceModal.value = true;
    };

    const editResource = (resource) => {
      editingResource.value = resource;
      resourceForm.value = { ...resource };
      showResourceModal.value = true;
    };

    const saveResource = async () => {
      try {
        if (!resourceForm.value.title || !resourceForm.value.description || !resourceForm.value.url) {
          console.error('Please fill in all fields.');
          return;
        }

        const newResource = { 
          id: `resource-${Date.now()}`, // Generating a unique ID using current timestamp
          title: resourceForm.value.title, 
          description: resourceForm.value.description, 
          url: resourceForm.value.url, 
          userRatings: [] // Initialize with an empty user ratings array
        };

        // Add the new resource to the resources array
        resources.value.push(newResource);

        // Update the resources in S3
        await updateResourcesOnS3();

        closeModal();
        fetchResources(); // Refresh the list after adding
      } catch (error) {
        console.error('Failed to save resource:', error);
      }
    };

    const updateResourcesOnS3 = async () => {
      try {
        const response = await fetch('https://b1pzvf0mhl.execute-api.ap-southeast-2.amazonaws.com/default/5032a2resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resources.value) // Send updated resources list to the backend
        });

        if (!response.ok) {
          console.error('Failed to update resources in S3:', await response.text());
        }
      } catch (error) {
        console.error('Error updating resources in S3:', error);
      }
    };

    const deleteResource = async (id) => {
      try {
        resources.value = resources.value.filter(resource => resource.id !== id);
        await updateResourcesOnS3();
        fetchResources();
      } catch (error) {
        console.error('Failed to delete resource:', error);
      }
    };

    const closeModal = () => {
      showResourceModal.value = false;
      editingResource.value = null;
      resourceForm.value = { title: '', description: '', url: '' };
    };

    const logout = async () => {
      try {
        await signOut(auth);
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout failed:', error.message);
      }
    };

    return {
      collapse1,
      dropdown6,
      userPhotoURL,
      activeSection,
      resources,
      showResourceModal,
      editingResource,
      resourceForm,
      isSidebarVisible,
      setActive,
      fetchResources,
      editResource,
      saveResource,
      deleteResource,
      closeModal,
      calculateAverageRating,
      toggleSidebar,
      logout,
      openAddResourceModal
    };
  }
};
</script>


<style scoped>
.admin-dashboard {
  margin-top: 70px;
  /* Adjust the margin-top to account for the fixed navbar */
}

.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 70px;
  /* Adjust for fixed navbar height */
  left: 0;
  transition: transform 0.3s ease-in-out;
}

.d-none {
  display: none !important;
}

.content {
  margin-left: 250px;
  padding-top: 20px;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .d-flex {
    flex-direction: column;
  }

  .content {
    margin-left: 0;
  }
}
</style>
