<template lang="pug">
  .detail(v-on:click="changeSampleName") {{ sampleMessage }}
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapGetters([ 'sampleMessage' ])
    },
    methods: {
      ...mapActions([ 'changeSampleName' ])
    }
  }
</script>
