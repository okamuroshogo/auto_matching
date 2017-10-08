<template lang="pug">
  .detail
    p おめでとうございます 🎉
    p
      img(v-bind:src="detailData.userImageUrl1")
      | ...
      | ♡
      | ...
      img(v-bind:src="detailData.userImageUrl2")
    p
      img(v-bind:src="detailData.shopImageUrl")
    p {{ detailData.shopName }}
    p
      a(v-bind:href="detailData.shopUrl") {{ detailData.shopUrl }}
    p {{ detailData.shopAddress }}
    p {{ detailData.shopReservationUrl }}
    p
      a.btn-reserve(href='') お店を予約する
    p #彼氏欲しい
    p と
    p #彼女ほしい人RT
    p でつながりました！！
</template>

<script>
  import qs from 'querystring';
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapState(['detailData']),
      ...mapGetters([])
    },
    methods: {
      ...mapActions([])
    },
    created() {
      const locationHash = (location.hash || '').replace(/^#/, '');
      const locationSearch = (location.search || '').replace(/^\?/, '');
      const locationParams = qs.parse(locationSearch);

      this.$store.dispatch('getDetailData', {
        id: locationParams.id
      });
    }
  }
</script>
