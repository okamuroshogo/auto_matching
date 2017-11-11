<template lang="pug">
  .detail
    p {{ userId }}
    p
      button.btn-reserve(v-on:click="postReservation({userId})") お店を予約する

    p おめでとうございます 🎉
    p いい感じのお店選んどきました！
    p.shop-image(v-bind:style="'background-image:url(' + detailData.shopImageUrl + ')'")
    //- p
    //-   img(v-bind:src="detailData.shopImageUrl")
    p.shop-name {{ detailData.shopName }}
    p.shop-address {{ detailData.shopAddress }}
    p 18:00〜 ２名様
    p
      a.btn-reserve(v-bind:href="'/twitter_session/' + detailData.id") お店を予約する
    p.notice ※外部ページへ飛びます
    //- p
    //-   img(v-bind:src="detailData.userImageUrl1")
    //-   | ...
    //-   | ♡
    //-   | ...
    //-   img(v-bind:src="detailData.userImageUrl2")
    //- p
    //-   a(v-bind:href="detailData.shopUrl") {{ detailData.shopUrl }}
    //- p {{ detailData.shopReservationUrl }}
    //- p #彼氏欲しい
    //- p と
    //- p #彼女ほしい人RT
    //- p でつながりました！！
</template>

<script>
  import qs from 'querystring';
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapState(['detailData', 'userId']),
      ...mapGetters([])
    },
    methods: {
      ...mapActions(['postReservation'])
    },
    created() {
      const locationHash = (location.hash || '').replace(/^#/, '');
      const locationSearch = (location.search || '').replace(/^\?/, '');
      const locationParams = qs.parse(locationSearch);

      const matchingId = locationParams.id;
      if (!matchingId) location.href = '/';
      if (locationParams.error == 1) alert('マッチングしていないユーザーアカウントです。ログインしているアカウントを確認してください!');

      this.$store.dispatch('getUserId').then(() => {
        this.$store.dispatch('getUserStatus', {
          matchingId: matchingId,
          userId: this.$store.state.userId,
        });
      });
      this.$store.dispatch('getDetailData', {
        matchingId: matchingId,
      });
    }
  }
</script>
