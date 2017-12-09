<template lang="pug">
  .root
    //- h1.logo kamatte
    div.top_image
    //- div.matching_count
      p マッチング数
      p {{ matchingCount || 0 }} 件！
    div.top_twitter
      | <a class="twitter-timeline"  href="https://twitter.com/hashtag/kamatte_cc" data-widget-id="916891364859641857">#kamatte_cc のツイート</a>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    name: 'root',
    computed: {
      ...mapState(['matchingCount']),
      ...mapGetters([])
    },
    methods: {
      ...mapActions([])
    },
    created() {
      this.$store.dispatch('getMatchingCount');
    }
  }
</script>

<!-- twitter widgets -->
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
