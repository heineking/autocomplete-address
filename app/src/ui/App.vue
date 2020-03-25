<template>
  <div class="app">
    <h2>Shipping Address</h2>
    <address-form />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import AddressForm from './AddressForm.vue';

@Component({
  name: 'App',
  components: {
    AddressForm,
  },
})
export default class App extends Vue {
}
</script>
<style lang="scss">
</style>