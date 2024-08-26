<template>
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Only users with the admin role can access this page.</p>
      
    </div>
  </template>
  
  <script>

  export default {
    components: {

    },
    setup() {
      // You can add any admin-specific logic here
    }
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 2rem;
  }
  
  h1 {
    margin-bottom: 1rem;
    color: #333;
  }
  </style>
  