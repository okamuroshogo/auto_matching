<template lang="pug">
  .root
    h1 kamatte
    p 本日のマッチング数
    p {{ matchingCount }} 件！
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'root',
    computed: {
      ...mapGetters([ 'matchingCount' ])
    },
    methods: {
      ...mapActions([])
    }
  }
</script>
