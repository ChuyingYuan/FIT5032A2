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
                        <th scope="col">Title</th>
                        <th scope="col">Description</th>
                        <th scope="col">Resource</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="resource in paginatedResources" :key="resource.id">
                        <td>{{ resource.title }}</td>
                        <td>{{ resource.description }}</td>
                        <td>
                            <a :href="resource.url" target="_blank">View Resource</a>
                            <br>
                            <template v-if="isLoggedIn">
                                <!-- Actions based on the filter -->
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
import { db, auth } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
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
        const isModalVisible = ref(false);
        const selectedResourceId = ref(null);
        const currentRating = ref(0);

        const fetchResources = async () => {
            try {
                // Use the public URL of your S3 file
                const response = await fetch('https://5032a2.s3.ap-southeast-2.amazonaws.com/resources.json');

                if (!response.ok) {
                    throw new Error('Failed to fetch resources from S3.');
                }

                resources.value = await response.json(); // Parse and store the data
            } catch (error) {
                console.error('Failed to fetch resources from S3:', error);
                showFeedbackMessage('Failed to fetch resources.');
            }
        };


        const fetchUserResources = async () => {
            if (!userId.value) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', userId.value));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    savedResourceIds.value = userData.savedResources || [];
                    readResourceIds.value = userData.readResources || [];
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        onMounted(() => {
            fetchResources();

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    isLoggedIn.value = true;
                    userId.value = user.uid;
                    fetchUserResources();
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

        const totalFilteredResources = computed(() => filteredResources.value.length);
        const totalPages = computed(() => Math.ceil(totalFilteredResources.value / rowsPerPage.value));

        const paginatedResources = computed(() => {
            const start = (currentPage.value - 1) * rowsPerPage.value;
            const end = start + rowsPerPage.value;
            return filteredResources.value.slice(start, end);
        });

        const currentPageStart = computed(() => (currentPage.value - 1) * rowsPerPage.value + 1);
        const currentPageEnd = computed(() => Math.min(currentPageStart.value + rowsPerPage.value - 1, totalFilteredResources.value));

        const updatePagination = () => {
            currentPage.value = 1;
        };

        const previousPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--;
            }
        };

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++;
            }
        };

        const handleSearch = () => {
            currentPage.value = 1;
        };

        const setFilter = (filter) => {
            activeFilter.value = filter;
            currentPage.value = 1;
        };

        const saveResource = async (resourceId) => {
            if (!userId.value) {
                console.error('User not logged in.');
                return;
            }

            try {
                const userRef = doc(db, 'users', userId.value);
                await updateDoc(userRef, {
                    savedResources: arrayUnion(resourceId)
                });
                savedResourceIds.value.push(resourceId);
                showFeedbackMessage('Resource saved successfully!');
            } catch (error) {
                showFeedbackMessage('Failed to save resource.');
                console.error('Failed to save resource:', error);
            }
        };

        const unsaveResource = async (resourceId) => {
            if (!userId.value) {
                console.error('User not logged in.');
                return;
            }

            try {
                const userRef = doc(db, 'users', userId.value);
                await updateDoc(userRef, {
                    savedResources: arrayRemove(resourceId)
                });
                savedResourceIds.value = savedResourceIds.value.filter(id => id !== resourceId);
                showFeedbackMessage('Resource unsaved successfully!');
            } catch (error) {
                showFeedbackMessage('Failed to unsave resource.');
                console.error('Failed to unsave resource:', error);
            }
        };

        const markAsRead = async (resourceId) => {
            if (!userId.value) {
                console.error('User not logged in.');
                return;
            }

            try {
                const userRef = doc(db, 'users', userId.value);
                await updateDoc(userRef, {
                    readResources: arrayUnion(resourceId)
                });
                readResourceIds.value.push(resourceId);
                showFeedbackMessage('Resource marked as read!');
            } catch (error) {
                showFeedbackMessage('Failed to mark resource as read.');
                console.error('Failed to mark resource as read:', error);
            }
        };

        const openModal = (resourceId) => {
            const resource = resources.value.find(r => r.id === resourceId);
            if (resource) {
                selectedResourceId.value = resourceId;
                currentRating.value = resource.userRatings.find(r => r.userId === userId.value)?.rating || 0;
                isModalVisible.value = true;
            }
        };

        const handleSubmitRating = (rating) => {
            if (!selectedResourceId.value) return;

            updateRating(selectedResourceId.value, rating);
            isModalVisible.value = false;
        };

        const updateRating = async (resourceId, rating) => {
            if (!userId.value) {
                console.error('User not logged in.');
                return;
            }

            const resource = resources.value.find(r => r.id === resourceId);
            if (!resource) {
                console.error('Resource not found.');
                return;
            }

            try {
                const existingRatingIndex = resource.userRatings.findIndex(r => r.userId === userId.value);

                if (existingRatingIndex !== -1) {
                    resource.userRatings[existingRatingIndex].rating = rating;
                } else {
                    resource.userRatings.push({
                        userId: userId.value,
                        rating: rating
                    });
                }

                // Send the update request to API Gateway
                const response = await fetch('https://b1pzvf0mhl.execute-api.ap-southeast-2.amazonaws.com/default/5032a2resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        resourceId,
                        userId: userId.value,
                        rating
                    })
                });

                if (response.status === 200) {
                    showFeedbackMessage('Rating updated successfully!');
                } else {
                    showFeedbackMessage('Failed to update rating.');
                    console.error('Failed to update rating:', await response.text());
                }
            } catch (error) {
                showFeedbackMessage('Failed to update rating.');
                console.error('Failed to update rating:', error);
            }
        };


        const showFeedbackMessage = (message) => {
            feedbackMessage.value = message;
            setTimeout(() => {
                feedbackMessage.value = '';
            }, 3000);
        };

        return {
            resources,
            rowsPerPage,
            currentPage,
            searchQuery,
            perPageOptions,
            paginatedResources,
            filteredResources,
            totalResources,
            totalFilteredResources,
            totalPages,
            currentPageStart,
            currentPageEnd,
            updatePagination,
            previousPage,
            nextPage,
            handleSearch,
            saveResource,
            unsaveResource,
            markAsRead,
            isLoggedIn,
            feedbackMessage,
            activeFilter,
            setFilter,
            savedResourceIds,
            readResourceIds,
            updateRating,
            isModalVisible,
            openModal,
            handleSubmitRating,
            selectedResourceId,
            currentRating
        };
    }
};
</script>