<template lang="pug">
  .detail
    h1 kamatte
    p ogp
    p 店の名は
    p hashtag
    p {{ sampleMessage }}
</template>

<script>
  import qs from 'querystring';
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapGetters([])
    },
    methods: {
      ...mapActions([])
    },
    created() {
      const locationHash = (location.hash || '').replace(/^#/, '');
      const locationSearch = (location.search || '').replace(/^\?/, '');
      const locationParams = qs.parse(locationSearch);

      this.$store.dispatch('getDetail', {
        token: locationParams.token
      });
    }
  }
</script>
