<template>
    <div>
        <div class="map-container" ref="map"></div>
        <input v-model="searchQuery" type="text" placeholder="Search for health department..."
            @input="filterDepartments" />
    </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import healthDepartmentsData from "@/assets/health_departments.json"; // Your JSON file

export default {
    data() {
        return {
            map: null,
            markers: [],
            departments: healthDepartmentsData.departments,
            filteredDepartments: healthDepartmentsData.departments,
            currentLocationMarker: null,
            searchQuery: "",
        };
    },
    mounted() {
        this.initializeMap();
        this.addMarkers();
        this.getCurrentLocation();
    },
    methods: {
        initializeMap() {
            this.map = L.map(this.$refs.map).setView([-37.8136, 144.9631], 12); // Melbourne center

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            }).addTo(this.map);
        },
        addMarkers() {
            this.filteredDepartments.forEach((department) => {
                const marker = L.marker([department.coordinates.latitude, department.coordinates.longitude])
                    .addTo(this.map)
                    .bindPopup(`<b>${department.name}</b><br>${department.address}`);
                this.markers.push(marker);
            });
        },
        getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    this.currentLocationMarker = L.marker([latitude, longitude], {
                        icon: L.icon({
                            iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
                            iconSize: [38, 95],
                            iconAnchor: [22, 94],
                            popupAnchor: [-3, -76],
                        }),
                    })
                        .addTo(this.map)
                        .bindPopup("Your current location")
                        .openPopup();

                    this.map.setView([latitude, longitude], 13);
                });
            }
        },
        filterDepartments() {
            // Remove existing markers
            this.markers.forEach((marker) => this.map.removeLayer(marker));
            this.markers = [];

            // Filter and add markers
            this.filteredDepartments = this.departments.filter((department) =>
                department.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            this.addMarkers();
        },
    },
};
</script>

<style>
.map-container {
    width: 100%;
    height: 500px;
}
</style>