<script lang="ts" setup>
interface IBaseButton {
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
  label: string;
  disabled?: boolean;
  radius?: string;
}

const {
  color = "#d38f56",
  size = "md",
  radius = "5px",
  label,
} = defineProps<IBaseButton>();
</script>

<template>
  <button
    :class="[
      'base-button',
      `base-button__${color}`,
      `base-button__${size}`,
      { 'base-button-fill_disabled': disabled },
    ]"
  >
    {{ label }}
  </button>
</template>
<style scoped lang="scss">
.base-button {
  background-color: v-bind(color);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  color: white;

  user-select: none;
  border-radius: v-bind(radius);
  border: 1px solid transparent;
  transition: all 0.3 ease-in-out;
  width: fit-content;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }


  &__xs {
    padding: 6px 9px;
  }

  &__sm {
    padding: 6px 12px;
  }

  &__md {
    padding: 8px 16px;
  }

  &__lg {
    padding: 16px 28px;
  }
}
</style>
