<template lang="pug">
  .root
    h1.logo kamatte
    p マッチング数
    p {{ matchingCount || 0 }} 件！
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
