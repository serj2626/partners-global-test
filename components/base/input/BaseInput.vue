<script setup lang="ts">
type TInputTypes =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

interface IInputProps {
  placeholder?: string;
  error?: string;
  type?: TInputTypes;
}

const inputValue = defineModel("inputValue");
const error = defineModel("error");

const props = defineProps<IInputProps>();

const showPassword = ref(false);
</script>
<template>
  <label class="base-input">
    <input
      v-model="inputValue"
      :class="{ 'base-input__input_error': error }"
      :type="type"
      class="base-input__input"
    />
    <span v-if="!inputValue" class="base-input__placeholder">{{
      placeholder
    }}</span>
    <small v-if="error" class="base-input__error">{{ error }}</small>
  </label>
</template>
<style lang="scss" scoped>
.base-input {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__placeholder {
    position: absolute;
    color: #5c6a70;
    padding: 9px 19px 9px 11px;
  }

  &__input {
    padding: 9px 19px 9px 11px;
    cursor: auto;
    border-radius: 5px;
    transition: all .3s ease-in;
    border: 1px solid $gray;

    &:focus {
      border-color: gold;
    }
  }

  &__icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    background-color: $txt;
    opacity: 0.7;
    cursor: pointer;
  }

  &__error {
    color: rgb(255, 0, 0);
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 1.5px;
  }
}
</style>
