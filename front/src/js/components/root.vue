<template lang="pug">
  .root
    //- h1.logo kamatte
    div.top_image
    //- div.matching_count
      p マッチング数
      p {{ matchingCount || 0 }} 件！
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
    }
  }
</script>
