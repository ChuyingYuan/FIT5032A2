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
    <div class="container mt-5">
        <HealthResourcesTable />
    </div>
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
} from 'mdb-vue-ui-kit';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase'; // Ensure you import the Firebase auth instance
import { onAuthStateChanged, signOut } from 'firebase/auth';
import HealthResourcesTable from '@/components/HealthResourcesTable.vue';

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
        HealthResourcesTable
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
        const resources = ref([]);
        const columns = ref([
            { label: 'Title', field: 'title', sortable: true },
            { label: 'Description', field: 'description', sortable: true },
            { label: 'Resource', field: 'url', sortable: false }
        ]);

        const fetchResources = async () => {
            try {
                const response = await fetch('/resources.json');
                resources.value = await response.json();
            } catch (error) {
                console.error('Failed to fetch resources:', error);
            }
        };

        onMounted(fetchResources);

        return {
            collapse1,
            dropdown6,
            isLoggedIn,
            userPhotoURL,
            logout,
            resources,
            columns
        };
    }
};
</script>

<style scoped>
.health-resources-table {
    padding: 20px;
}

h2 {
    margin-bottom: 20px;
}
</style>