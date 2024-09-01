<template>
    <div class="star-rating">
      <span
        v-for="star in 5"
        :key="star"
        class="star"
        :class="{ active: star <= rating }"
        @click="setRating(star)"
      >
        ★
      </span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      modelValue: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      rating: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        },
      },
    },
    methods: {
      setRating(star) {
        if (!this.readonly) {
          this.rating = star;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .star-rating {
    display: inline-block;
  }
  
  .star {
    cursor: pointer;
    font-size: 1.5em;
    color: #ddd;
    transition: color 0.2s;
  }
  
  .star.active {
    color: gold;
  }
  
  .star:hover {
    color: gold;
  }
  </style>
  