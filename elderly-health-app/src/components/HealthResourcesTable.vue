<template>
    <div class="health-resources-table">
        <h2>Health Resources</h2>

        <!-- Filter and Search Bar -->
        <div class="d-flex justify-content-between mb-3">
            <!-- Filter Buttons -->
            <div class="btn-group" role="group" aria-label="Filter">
                <button type="button" class="btn btn-primary" :class="{ active: activeFilter === 'all' }"
                    @click="setFilter('all')">All</button>
                <button type="button" class="btn btn-primary" :class="{ active: activeFilter === 'saved' }"
                    @click="setFilter('saved')">Saved</button>
                <button type="button" class="btn btn-primary" :class="{ active: activeFilter === 'read' }"
                    @click="setFilter('read')">Read</button>
            </div>
            <input type="text" v-model="searchQuery" class="form-control w-25" placeholder="Search..."
                @input="handleSearch" />
        </div>

        <!-- Feedback Message -->
        <div v-if="feedbackMessage" class="alert alert-info" role="alert">
            {{ feedbackMessage }}
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">
                            <button class="btn btn-link" @click="toggleSort('title')">Title
                                <span v-if="sortKey === 'title'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                            </button>
                        </th>
                        <th scope="col">Description</th>
                        <th scope="col">Resource</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="resource in sortedResources" :key="resource.id">
                        <td>{{ resource.title }}</td>
                        <td>{{ resource.description }}</td>
                        <td>
                            <a :href="resource.url" target="_blank">View Resource</a>
                            <br>
                            <template v-if="isLoggedIn">
                                <template v-if="activeFilter === 'saved'">
                                    <a href="#" class="ml-2" @click.prevent="unsaveResource(resource.id)">Unsave</a>
                                </template>
                                <template v-else-if="activeFilter === 'read'">
                                    <a href="#" class="ml-2" @click="openModal(resource.id)">Give Rating</a>
                                </template>
                                <template v-else>
                                    <a href="#" class="ml-2"
                                        @click.prevent="savedResourceIds.includes(resource.id) ? unsaveResource(resource.id) : saveResource(resource.id)"
                                        :style="savedResourceIds.includes(resource.id) ? 'color:red' : ''">
                                        {{ savedResourceIds.includes(resource.id) ? 'Unsave' : 'Save' }}
                                    </a>
                                    <br>
                                    <a href="#" class="ml-2" @click.prevent="markAsRead(resource.id)">Mark as read</a>
                                </template>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <RatingModal :visible="isModalVisible" :initialRating="currentRating" @close="isModalVisible = false"
            @submit="handleSubmitRating" />

        <!-- Pagination Controls -->
        <div class="pagination-controls d-flex justify-content-between align-items-center mt-3">
            <div>
                <span>Rows per page:</span>
                <select v-model="rowsPerPage" @change="updatePagination">
                    <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
                </select>
            </div>
            <div>
                <span>{{ currentPageStart }} - {{ currentPageEnd }} of {{ totalFilteredResources }}</span>
                <button class="btn btn-sm btn-outline-secondary" @click="previousPage" :disabled="currentPage === 1">
                    ‹
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="nextPage"
                    :disabled="currentPage >= totalPages">
                    ›
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import RatingModal from './RatingModal.vue';

export default {
    components: {
        RatingModal,
    },
    setup() {
        const resources = ref([]);
        const rowsPerPage = ref(10);
        const currentPage = ref(1);
        const searchQuery = ref("");
        const perPageOptions = [5, 10, 15, 20];
        const isLoggedIn = ref(false);
        const userId = ref(null);
        const feedbackMessage = ref('');
        const activeFilter = ref('all');
        const savedResourceIds = ref([]);
        const readResourceIds = ref([]);


        // Sorting state
        const sortKey = ref('title'); // Default sort by title
        const sortOrder = ref('asc'); // Ascending by default

        const fetchResources = async () => {
            try {
                const response = await fetch('https://5032a2.s3.ap-southeast-2.amazonaws.com/resources.json');
                if (!response.ok) throw new Error('Failed to fetch resources from S3.');
                resources.value = await response.json();
            } catch (error) {
                console.error('Failed to fetch resources from S3:', error);
                feedbackMessage('Failed to fetch resources.');
            }
        };

        onMounted(() => {
            fetchResources();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    isLoggedIn.value = true;
                    userId.value = user.uid;
                } else {
                    isLoggedIn.value = false;
                    userId.value = null;
                }
            });
        });

        const totalResources = computed(() => resources.value.length);

        const filteredResources = computed(() => {
            let filtered = resources.value;
            if (activeFilter.value === 'saved') {
                filtered = filtered.filter(resource => savedResourceIds.value.includes(resource.id));
            } else if (activeFilter.value === 'read') {
                filtered = filtered.filter(resource => readResourceIds.value.includes(resource.id));
            }

            if (searchQuery.value) {
                filtered = filtered.filter(resource =>
                    resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                    resource.description.toLowerCase().includes(searchQuery.value.toLowerCase())
                );
            }
            return filtered;
        });

        const sortedResources = computed(() => {
            return [...filteredResources.value].sort((a, b) => {
                let modifier = sortOrder.value === 'asc' ? 1 : -1;
                if (a[sortKey.value].toLowerCase() < b[sortKey.value].toLowerCase()) return -1 * modifier;
                if (a[sortKey.value].toLowerCase() > b[sortKey.value].toLowerCase()) return 1 * modifier;
                return 0;
            });
        });

        const totalFilteredResources = computed(() => sortedResources.value.length);
        const totalPages = computed(() => Math.ceil(totalFilteredResources.value / rowsPerPage.value));

        const paginatedResources = computed(() => {
            const start = (currentPage.value - 1) * rowsPerPage.value;
            const end = start + rowsPerPage.value;
            return sortedResources.value.slice(start, end);
        });

        const currentPageStart = computed(() => (currentPage.value - 1) * rowsPerPage.value + 1);
        const currentPageEnd = computed(() => Math.min(currentPageStart.value + rowsPerPage.value - 1, totalFilteredResources.value));

        const updatePagination = () => currentPage.value = 1;

        const previousPage = () => currentPage.value > 1 && currentPage.value--;
        const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;

        const handleSearch = () => currentPage.value = 1;

        const toggleSort = (key) => {
            if (sortKey.value === key) {
                sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'; // Toggle order
            } else {
                sortKey.value = key;
                sortOrder.value = 'asc'; // Default to ascending when new key is chosen
            }
        };

        return {
            resources,
            rowsPerPage,
            currentPage,
            searchQuery,
            perPageOptions,
            paginatedResources,
            totalResources,
            totalFilteredResources,
            totalPages,
            currentPageStart,
            currentPageEnd,
            updatePagination,
            previousPage,
            nextPage,
            handleSearch,
            isLoggedIn,
            feedbackMessage,
            activeFilter,
            sortedResources,
            toggleSort,
            sortKey,
            sortOrder
        };
    }
};
</script>
