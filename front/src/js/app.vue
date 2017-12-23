<template lang="pug">
  div#app
    router-view
    app-footer
</template>

<script>
  import AppFooter from './components/_app-footer.vue';

  export default {
    name: 'App',
    components: {
      AppFooter
    },
  };
</script>
