<template lang="pug">
  .root
    //- h1.logo kamatte
    div.top_image
    div.kamatte_tittle
      p.text-title かまってちゃんのためのマッチングサービス
      p kamatteは、twitter上のかまってちゃんを
        br
        | 
        span.text-explain-bold 勝手にマッチングして、お店の手配まで
        | するwebサービスです

    div.kamatte_tweet
      button.btn-tweet
        a(href="https://twitter.com/intent/tweet?text=この文言をランダムに変えたい")
        span かまってツイートする
    div.howto

    div.kamatte_tweet
      button.btn-tweet
        a(href="https://twitter.com/intent/tweet?text=この文言をランダムに変えたい")
        span かまってツイートする

    div.matching_count
      p これまでのマッチング数 
        span.text-count-bold {{ matchingCount || 0 }} 
        | 件 

    div.top_twitter
      | <a class="twitter-timeline" href="https://twitter.com/kamatte_cc?ref_src=twsrc%5Etfw" data-show-replies="true">マッチング中</a>
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
    },
    mounted() {
      if (window.twttr) {
        // twitter widgetsの再読み込み
        twttr.widgets.load();
      }
    }
  }
</script>
