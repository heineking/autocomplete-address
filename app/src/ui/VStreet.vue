<template>
  <div class="v-street" ref="vstreet">
    <v-input
      name="street"
      v-model="internalValue"
      @focusin.native="onInputFocus"
      @keydown.native="onKeyDown"
    />
    <ul
      class="options"
      ref="options"
      v-show="active"
      @keyup.enter="onAddressSelect"
    >
      <li
        class="option"
        v-for="({ value, text }, index) in options"
        :key="index"
      >
        <input
          class="sr-only option__control"
          type="radio"
          name="addressOption"
          v-model="selectedId"
          :id="`addressOptions[${index}]`"
          :value="value"
          @keyup.enter="onAddressSelect"
          tabindex="-1"
        />
        <label class="option__label" :for="`addressOptions[${index}]`">
          <span class="icon fas fa-map-marker-alt"></span>
          <span class="text">{{text}}</span>
        </label>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import VInput from './VInput.vue';
import { Address } from '../types';

@Component({
  name: 'VStreet',
  components: {
    VInput,
  },
  props: {
    addresses: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
})
export default class AddressOptions extends Vue {
  private readonly value!: string;
  private readonly addresses!: Address[];

  private selectedId: number = -1;
  private active: boolean = false;

  private get internalValue(): string {
    return this.value;
  }

  private set internalValue(value: string) {
    this.$emit('input', value);
  }

  private get internalAddresses(): Address[] {
    return [...this.addresses]
      .sort((a, b) => a.street < b.street ? -1 : a.street > b.street ? 1 : 0)
  }

  private get selectedAddress(): Address | undefined {
    return this.addresses.find((a) => a.id === this.selectedId);
  }

  private get selectedElement(): HTMLInputElement {
    const input = document.querySelector(`input[type="radio"][value="${this.selectedId}"]`) as HTMLInputElement | null;
    return input || new HTMLInputElement();
  }

  private get options(): Array<{ value: number, text: string }> {
    return this
      .internalAddresses
      .map((address) => {
        const { id: value, number: $number, street, unit, city, region, postcode } = address;
        const text =  `${$number} ${street}${unit ? `, ${unit}` : ''}, ${city} ${region} ${postcode}`;
        return { value, text };
      });
  }

  public created(): void {
    this.$watch(() => this.selectedAddress, (address) => {
      if (!address) {
        this.selectedId = -1;
      }
    });
  }

  private focusAddressOptions(): void {
    if (this.internalAddresses.length === 0 || this.active === false) {
      return;
    }
    this.selectedId = this.internalAddresses[0].id;
    this.selectedElement.focus();
  }

  private onInputFocus(): void {
    this.active = true;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.keyCode === 40) {
      this.focusAddressOptions();
    } else if (e.keyCode === 9) {
      this.active = false;
    }
  }

  private onAddressSelect(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement && this.selectedAddress) {
      this.$emit('autocomplete', {...this.selectedAddress});
      this.active = false;
    }
  }
}
</script>
<style lang="scss">
.v-street {
  position: relative;
}

.options {
  background: #fff;
  list-style: none;
  margin: 0;
  margin-top: -1rem;
  padding: 0;
  position: absolute;
  width: 100%;
  z-index: 999;

  .option {
    &__label {
      border: 1px solid #3c7abe;
      color: #333;
      display: flex;
      padding: 0.5rem;

      .icon {
        color: #3c7abe;
        line-height: 2rem;
        margin: auto 0;
        text-align: center;
        width: 2rem;
      }

      .text {
        margin: auto 0;
      }
    }

    input:checked + label {
      background: #ecf2f9;
    }
  }
}
</style>