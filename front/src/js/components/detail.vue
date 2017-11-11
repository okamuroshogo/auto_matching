<template lang="pug">
  .detail
    p おめでとうございます 🎉
    p いい感じのお店選んどきました！
    p.shop-image(v-bind:style="'background-image:url(' + detailData.shopImageUrl + ')'")
    p.shop-name {{ detailData.shopName }}
    p.shop-address {{ detailData.shopAddress }}
    p 18:00〜 ２名様
    p(v-if="detailData.userStatus1")
      button.btn-reserve(v-on:click="postReservation({ matchingId, userId })") 行きたい !
    p(v-else-if="detailData.userStatus2")
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
        const userId = this.$store.state.userId;
        if (isCallback) {
          this.postReservation({ matchingId, userId });
          Promise.reject();
        }
        const isSelf = userId == detailData.userID1 || userId == detailData.userID2;
        // const isSelf = detailData.userStatus1 && userId == detailData.userID1;
        if (detailData.userStatus1 && detailData.userStatus2) {
          // ふたりとも押してる
        }
        else if (detailData.userStatus1 ^ detailData.userStatus2) {
          // どちらかが押してる
        }
      });
      this.$store.dispatch('getDetailData', {
        matchingId,
      });
    }
  }
</script>
