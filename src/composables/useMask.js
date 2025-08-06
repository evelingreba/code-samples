import { Mask } from 'maska';

export const useMask = (mask, value, options) => {
  const maska = new Mask({ mask, ...options });
  const maskedValue = computed(() => maska?.masked(value ? String(value) : '#'));
  const unmaskedValue = computed(() => maska?.unmasked(String(value)));

  return {
    maska,
    maskedValue,
    unmaskedValue,
  };
};
