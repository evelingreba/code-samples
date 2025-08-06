<template>
  <form
    class="auth-confirm"
    @submit.prevent="onSubmit"
  >
    <div class="auth-confirm__subtitle">
      {{ 'Введіть одноразовий код, відправлений на email' }} <span style="display: inline-block">{{ email }}</span>
    </div>

    <UiFormGroup
      name="confirmCode"
      label="Код підтвердження"
      :error="errors.code"
      class="auth-confirm__input"
    >
      <div class="auth-confirm__input-wrap">
        <UiInput
          ref="controlCodeRef"
          size="xs"
          :placeholder="controlCode"
          v-model="controlCode"
          inputmode="numeric"
          readonly
        />
        <UiInput
          ref="codeRef"
          size="lg"
          placeholder=""
          v-model="codeValue"
          inputmode="numeric"
          :modelModifiers="{ trim: true }"
          @input="setErrors({ code: undefined })"
        />
      </div>
    </UiFormGroup>

    <UiButton
      type="submit"
      variant="primary"
      block
      :loading="loading"
      :disabled="!isMounted || pending || !meta.valid"
    >
      {{ 'Підтвердити' }}
    </UiButton>

    <slot name="actions" />
  </form>
</template>

<script setup>
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { defineProps } from 'vue';

const $emit = defineEmits(['confirm', 'authError']);

const { pending, controlCode, email, code } = storeToRefs(useAuthStore());

const isMounted = ref(false);

const codeRef = ref();

const controlCodeRef = ref();

const loading = ref(false);

const props = defineProps({
  error: String
});

const focus = () => {
  if (codeRef.value?.inputRef) {
    setTimeout(() => codeRef.value?.inputRef?.focus(), 10);
  }
};

const resetOtp = () => {
  setValues({
    otp: undefined,
  });

  setErrors({
    otp: undefined,
  });
};

const digitsOnly = (value) => /^\d+$/.test(value)

const { defineField, setValues, setErrors, errors, meta, validateField } = useForm({
  validationSchema: yup.object({
    code: yup
      .string()
      .test('Digits only', 'Введіть коректний код', digitsOnly)
      .required("Поле обов'язкове для заповнення")
      .label('Код підтвердження'),
  }),
});

const [codeValue] = defineField('code', {
  validateOnChange: false,
  validateOnModelUpdate: false,
});

const onSubmit = async () => {
  loading.value = true;

  const { valid } = await validateField('code');

  if (!valid) {
    return;
  }

  try {
    code.value = codeValue.value;
    await $emit('confirm', codeValue.value);
  } catch (error) {
    setErrors({
      code: error,
    });
  }

  loading.value = false;
};

onMounted(() => {
  isMounted.value = true;
});

watchEffect(() => {
  if (codeRef.value?.inputRef) {
    focus();
  }
});

watch(
  () => props.error,
  (error) => {
    if (error) {
      setErrors({
        code: error,
      });
    }
  }
);

defineExpose({
  codeRef,
  resetOtp,
  focus
});
</script>

<style lang="scss" src="./AuthConfirm.scss" />
