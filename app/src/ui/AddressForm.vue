<template>
  <div class="address-form">
    <div>
      <label for="engine">Engine</label>
      <select id="engine" v-model="engine">
        <option value="es">ES</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">Sqlite</option>
      </select>
    </div>
    <v-input name="firstName" v-model="address.firstName" />
    <v-input name="lastName" v-model="address.lastName" />
    <v-street
      v-model="address.street"
      :addresses="addresses"
      @autocomplete="onAutoComplete"
    />
    <v-input name="unit" v-model="address.unit" />
    <v-input name="city" v-model="address.city" />
    <v-input name="postcode" v-model="address.postcode" />
    <v-input name="state" v-model="address.state" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import VInput from './VInput.vue';
import VStreet from './VStreet.vue';

import { getAddresses } from './getAddresses';

import { Address, ShippingAddress } from '../types';
import { CancelationToken, debounce } from '../utils';

@Component({
  components: {
    VInput,
    VStreet,
  },
})
export default class AddressForm extends Vue {
  private currentRequestCancellationToken: (message?: string) => void = (() => {/*noop*/});
  private engine: 'sqlite' | 'mysql' | 'es' = 'sqlite';
  private address: ShippingAddress = {
    firstName: '',
    lastName: '',
    street: '',
    unit: '',
    city: '',
    postcode: '',
    state: '',
  };

  private addresses: Address[] = [];

  private get searchParams(): { number: string, street: string } | null {
    const match = /\s*(\S+)\s+(.+)$/.exec(this.address.street);
    if (match) {
      const [full, $number, street] = match;
      return { number: $number, street };
    }
    return null;
  }

  private get queryString(): string | null {
    if (this.searchParams === null) {
      return null;
    }
    const searchQuery = Object
      .entries(this.searchParams)
      .reduce((s, kv) => `${s}${(s ? '&' : '')}${kv[0]}=${kv[1]}`, '');
    
    return `${searchQuery}&engine=${this.engine}`;
  }

  public created(): void {
    this.$watch(() => this.queryString, this.requestOptions);

    document.addEventListener('keyup', this.onSwitchEngine);
  }

  private requestOptions = debounce(async (queryString: string | null): Promise<void> => {
    this.currentRequestCancellationToken();

    if (queryString === null) {
      this.addresses.splice(0, this.addresses.length);
      this.currentRequestCancellationToken = () => {/*noop*/};
      return;
    }

    const { task, cancel } = getAddresses(queryString);

    task
      .then((addresses) => {
        this.addresses.splice(0, this.addresses.length, ...addresses);
      })
      .catch((reason) => {
        if (!(reason instanceof CancelationToken)) {
          throw reason;
        }
      });

    this.currentRequestCancellationToken = cancel;
  }, 150);

  private onAutoComplete(address: Address) {
    const { number: $number, street, unit, region, city, postcode } = address;
    const shippingAddress: Partial<ShippingAddress> = {
      city,
      postcode,
      unit,
      state: region,
      street: `${$number} ${street}`,
    };
    Object.assign(this.address, shippingAddress);
  }

  private onSwitchEngine(event: KeyboardEvent) {
    const { key, altKey } = event;
    if (altKey === false || ['E', 'S', 'M'].includes(key) === false) {
      return;
    }

    switch (key) {
      case 'E':
        this.engine = 'es';
      case 'S':
        this.engine = 'sqlite';
      case 'M':
        this.engine = 'mysql';
    }
  }
}
</script>
<style lang="scss">
.address-form {
  width: 100%;
}
</style>