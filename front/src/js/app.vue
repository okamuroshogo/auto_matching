<template lang="pug">
  div#app
    router-view
    appFooter
</template>

<script>
  import Footer from './components/_footer.vue';

  export default {
    name: 'App',
    components: {
      appFooter: Footer
    },
  };
</script>
