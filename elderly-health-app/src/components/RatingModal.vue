<template>
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <h3>Rate this Resource</h3>
        <StarRating v-model="localRating" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitRating">Submit</button>
          <button class="btn btn-secondary" @click="close">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import StarRating from './StarRating.vue';
  
  export default {
    components: {
      StarRating,
    },
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
      initialRating: {
        type: Number,
        default: 0,
      },
    },
    emits: ['close', 'submit'],
    data() {
      return {
        localRating: this.initialRating, // To keep a local copy of the rating
      };
    },
    methods: {
      close() {
        this.$emit('close');
      },
      submitRating() {
        this.$emit('submit', this.localRating);
        this.close();
      },
    },
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
  }
  
  .modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  </style>
  