<template lang="pug">
  .detail
    p おめでとうございます :tada:
    p 写真はーと写真
    p 店の写真
    p 店の名は
    p 店の住所
    p
      a.btn-reserve(href='') お店を予約する
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
