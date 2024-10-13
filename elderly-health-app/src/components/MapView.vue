<template>
    <div>
        <!-- Search bar and results -->
        <div class="search-container" style="margin-top: 40px;">
            <input v-model="searchQuery" type="text" placeholder="Search for health department..."
                @input="filterDepartments" />
            <ul v-if="filteredDepartments.length" class="search-results">
                <li v-for="(department, index) in filteredDepartments" :key="index" @click="navigateTo(department)">
                    {{ department.name }} - {{ department.address }}
                </li>
            </ul>
        </div>
        <!-- Map -->
        <div class="map-container" ref="map"></div>
    </div>
</template>

<script>
import healthDepartmentsData from "@/assets/health_departments.json"; // Your JSON file

export default {
    data() {
        return {
            map: null,
            markers: [],
            departments: healthDepartmentsData.departments,
            filteredDepartments: healthDepartmentsData.departments,
            currentLocationMarker: null,
            currentLocation: null,
            searchQuery: "",
            directionsService: null,
            directionsRenderer: null,
        };
    },
    mounted() {
        this.loadGoogleMaps();
    },
    methods: {
        loadGoogleMaps() {
            const googleMapsScript = document.createElement("script");
            googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCcHRP1LuHgNdfTGGKBjdaxF1dTSnHD4kw&callback=initMap`;
            googleMapsScript.async = true;
            googleMapsScript.defer = true;
            window.initMap = this.initializeMap;
            document.head.appendChild(googleMapsScript);
        },
        initializeMap() {
            this.map = new google.maps.Map(this.$refs.map, {
                center: { lat: -37.8136, lng: 144.9631 }, // Melbourne center
                zoom: 12,
            });

            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer();
            this.directionsRenderer.setMap(this.map);

            this.getCurrentLocation();
            this.addMarkers();
        },
        addMarkers() {
            this.filteredDepartments.forEach((department) => {
                const marker = new google.maps.Marker({
                    position: {
                        lat: department.coordinates.latitude,
                        lng: department.coordinates.longitude,
                    },
                    map: this.map,
                    title: department.name,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                      <div>
                        <b>${department.name}</b><br>${department.address}<br>
                        <button onclick="window.navigateTo(${department.coordinates.latitude}, ${department.coordinates.longitude})">Route</button>
                      </div>
                    `,
                });

                marker.addListener("click", () => {
                    infoWindow.open(this.map, marker);
                });

                this.markers.push(marker);
            });

            // Make the navigateTo function available globally so the button can trigger it
            window.navigateTo = (lat, lng) => {
                this.navigateToCoordinates(lat, lng);
            };
        },
        getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    this.currentLocation = { lat: latitude, lng: longitude };

                    this.currentLocationMarker = new google.maps.Marker({
                        position: this.currentLocation,
                        map: this.map,
                        title: "Your current location",
                        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    });

                    this.map.setCenter(this.currentLocation);
                });
            }
        },
        filterDepartments() {
            // Clear existing markers
            this.markers.forEach((marker) => marker.setMap(null));
            this.markers = [];

            // Filter and add markers
            this.filteredDepartments = this.departments.filter((department) =>
                department.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            this.addMarkers();
        },
        navigateToCoordinates(lat, lng) {
            if (!this.currentLocation) {
                alert("Current location not found!");
                return;
            }

            const request = {
                origin: this.currentLocation,
                destination: { lat, lng },
                travelMode: google.maps.TravelMode.DRIVING, // Can also be WALKING, BICYCLING, etc.
            };

            this.directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    this.directionsRenderer.setDirections(result);
                } else {
                    console.error("Directions request failed due to", status);
                }
            });
        },
    },
};
</script>

<style>
.map-container {
    width: 100%;
    height: 500px;
}

.search-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: 60%;
}

.search-container input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
}

.search-results {
    list-style-type: none;
    background-color: white;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 5px;
    padding-left: 0;
}

.search-results li {
    padding: 10px;
    cursor: pointer;
}

.search-results li:hover {
    background-color: #f0f0f0;
}
</style>
