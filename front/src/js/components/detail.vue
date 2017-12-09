<template lang="pug">
  .detail
    p おめでとうございます 🎉
    p いい感じのお店選んどきました！
    p.shop-image(v-bind:style="'background-image:url(' + (detailData.shopImageUrl || '') + ')'")
    p.shop-name {{ detailData.shopName }}
    p.shop-address {{ detailData.shopAddress }}
    p 18:00〜 ２名様
    p
      button.btn-ikitai(v-bind:class="{ inactive: !btnState.isIkitaiBtnActive }" v-on:click="btnState.isIkitaiBtnActive ? postLike({ matchingId, userId }) : null")
        span
        span
        span 行きたい !
    p
      button.btn-reserve(v-bind:class="{ inactive: !btnState.isReserveBtnActive }" v-on:click="btnState.isReserveBtnActive ? postReservation({ matchingId, userId }) : null") お店を予約する
</template>

<script>
  import qs from 'querystring';
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  export default {
    name: 'detail',
    computed: {
      ...mapState(['matchingId', 'detailData', 'userId', 'btnState']),
      ...mapGetters([])
    },
    methods: {
      ...mapActions(['postReservation', 'postLike']),
      ...mapMutations(['setMatchingId', 'setBtnState'])
    },
    created() {
      const locationHash = (location.hash || '').replace(/^#/, '');
      const locationSearch = (location.search || '').replace(/^\?/, '');
      const locationParams = qs.parse(locationSearch);

      const isCallback = locationParams.callback === 'true';
      const isLikeCallback = isCallback && locationParams.type === '1'; // like
      const isReservationCallback = isCallback && locationParams.type === '2'; // reservation
      const matchingId = locationParams.id;
      if (!matchingId) location.href = '/';
      if (locationParams.error == 1) alert('マッチングしていないユーザーアカウントです。ログインしているアカウントを確認してください!');

      this.setMatchingId({ matchingId });
      this.$store.dispatch('getUserId')
      .then(() => {
        return this.$store.dispatch('getDetailData', { matchingId });
      })
      .then(() => {
        const userId = this.$store.state.userId;
        if (isLikeCallback) {
          this.postLike({ matchingId, userId });
        }
        else if (isReservationCallback) {
          this.postReservation({ matchingId, userId });
        }
        else if (isCallback) {
          // typeなかったらlikeを叩く
          this.postLike({ matchingId, userId });
        }
        const detailData = this.$store.state.detailData;
        const isUser1 = userId == detailData.userID1;
        const isUser2 = userId == detailData.userID2;
        // const isSelf = userId == detailData.userID1 || userId == detailData.userID2;
        // const isUser1Done = isUser1 && detailData.userStatus1;
        // const isUser2Done = isUser2 && detailData.userStatus2;
        const isSelfIkitai = (isUser1 && detailData.userStatus1) || (isUser2 && detailData.userStatus2);
        const isPartnerIkitai = (isUser1 && detailData.userStatus2) || (isUser2 && detailData.userStatus1);
        // const isEachIkitai = detailData.userStatus1 ^ detailData.userStatus2; // どちらかがいきたい
        // const isBothIkitai = detailData.userStatus1 && detailData.userStatus2; // ふたりともいきた
        console.log(detailData);
        console.log(userId, detailData.userID1, isUser1, isUser2, isSelfIkitai);
        const btnState = {
          isIkitaiBtnActive: !isSelfIkitai,
          // isReserveBtnActive: isPartnerIkitai,
          isReserveBtnActive: true,
        };
        // console.log(btnState);
        this.setBtnState({ btnState });
      });
    }
  }
</script>
