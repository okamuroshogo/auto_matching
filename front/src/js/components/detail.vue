<template lang="pug">
  .detail
    h1 auto_matching
    p ogp
    p 店の名は
    p hashtag
    p {{ sampleMessage }}
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapGetters([ 'sampleMessage' ])
    },
    methods: {
      ...mapActions([])
    }
  }
</script>
