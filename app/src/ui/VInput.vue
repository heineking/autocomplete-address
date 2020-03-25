<template>
  <div class="control">
    <div class="control__element">
      <input
        v-model="internalValue"
        :class="{ filled, active }"
        :list="list.id"
        :type="type"
        :id="id"
        @focus="onFocus"
        @blur="onBlur"
      />
      <label :for="id" class="control__label">{{label}}</label>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  name: 'VInput',
  props: {
    value: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: 'text',
    },
    options: {
      type: Array,
      required: false,
      default: () => [],
      validator: (xs: string[]) => xs.every((x) => typeof x === 'string'),
    },
  },
})
export default class VInput extends Vue {
  private readonly value!: string;
  private readonly name!: string;
  private readonly options!: string[];

  private active: boolean = false;

  private get internalValue(): string {
    return this.value;
  }

  private set internalValue(value: string) {
    this.$emit('input', value);
  }

  private get label(): string {
    return this
      .name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\w\S*/g, (s) => s[0].toUpperCase() + s.slice(1).toLowerCase());
  }

  private get id(): string {
    return this.name;
  }

  private get list(): { id: string | null, options: string[] } {
    return {
      id: this.options.length ? `${this.name}_list` : null,
      options: this.options,
    };
  }

  private get filled(): boolean {
    return this.internalValue !== '';
  }

  private onFocus(): void {
    this.active = true;
  }

  private onBlur(): void {
    this.active = false;
  }
}
</script>
<style lang="scss" scoped>
.control {
  margin: 1rem 0;
  width: 100%;

  &__element {
    position: relative;

    input {
      border: 1px solid #888;
      color: #333;
      font-size: 1.25rem;
      height: 3rem;
      padding: 0.5rem;
      width: 100%;

      &.active, &.filled {
        + label {
          background: #fff;
          color: #3c7abe;
          font-size: 1rem;
          padding: 0 0.25rem;
          top: 0;
          transform: translateY(-50%);
        }
      }

      &:focus {
        outline: 1px solid #3c7abe;
      }
    }

    label {
      color: #888;
      cursor: text;
      font-size: 1.25rem;
      left: 0.5rem;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>