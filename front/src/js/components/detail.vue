<template lang="pug">
  .detail
    p おめでとうございます 🎉
    p いい感じのお店選んどきました！
    p.shop-image(v-bind:style="'background-image:url(' + detailData.shopImageUrl + ')'")
    p.shop-name {{ detailData.shopName }}
    p.shop-address {{ detailData.shopAddress }}
    p 18:00〜 ２名様
    p
      button.btn-reserve(v-on:click="postReservation({ matchingId, userId })") お店を予約する
</template>

<script>
  import qs from 'querystring';
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapState(['matchingId', 'detailData', 'userId']),
      ...mapGetters([])
    },
    methods: {
      ...mapActions(['postReservation']),
      ...mapMutations(['setMatchingId'])
    },
    created() {
      const locationHash = (location.hash || '').replace(/^#/, '');
      const locationSearch = (location.search || '').replace(/^\?/, '');
      const locationParams = qs.parse(locationSearch);

      const isCallback = locationParams.callback === 'true';
      const matchingId = locationParams.id;
      if (!matchingId) location.href = '/';
      if (locationParams.error == 1) alert('マッチングしていないユーザーアカウントです。ログインしているアカウントを確認してください!');

      this.setMatchingId({ matchingId });
      this.$store.dispatch('getUserId').then(() => {
        if (isCallback) {
          this.postReservation({ matchingId, userId });
          Promise.reject();
        }
      });
      this.$store.dispatch('getDetailData', {
        matchingId,
      });
    }
  }
</script>
