<template>
  <div class="auth-login">
    <div
      v-if="$slots.title"
      class="auth-login__title"
    >
      <slot
        name="title"
      />
    </div>

    <form
      class="auth-login__email"
      @submit.prevent="makeAuth"
    >
      <UiFormGroup
        block
        name="email"
        label="Email"
        :error="errors.email"
      >
        <UiInput
          ref="emailRef"
          size="lg"
          block
          placeholder="Введіть email"
          v-model="emailValue"
          inputmode="email"
          :modelModifiers="{ trim: true }"
          @input="setErrors({ email: undefined })"
        />
      </UiFormGroup>

      <UiButton
        type="submit"
        variant="primary"
        block
        size="md"
        :loading="loading"
      >
        {{ 'Вхід' }}
      </UiButton>
    </form>
  </div>
</template>

<script setup>
import * as yup from 'yup';
import { configure as configureVeeValidate, useForm } from 'vee-validate';
import { VALIDATORS } from '@constants';

configureVeeValidate({
  validateOnModelUpdate: true,
});

const { openAuthModal } = useAuth();
const { isOtpGenerated, controlCode, email } = storeToRefs(useAuthStore())

const emailRef = ref();
const loading = ref(false);

const { errors, meta, defineField, setErrors, validate } = useForm({
  validationSchema: yup.lazy(() => {
    return yup.object({
      email: yup
        .string()
        .required("Це поле обов'язкове для заповлення")
        .ensure()
        .matches(VALIDATORS.email, 'Введіть коректний email')
        .label('Email'),
    });
  })
});

const [emailValue] = defineField('email', {
  validateOnChange: false,
  validateOnModelUpdate: false,
});

const focus = () => {
  if (emailRef.value?.inputRef) {
    setTimeout(() => emailRef.value?.inputRef?.focus(), 10);
  }
};

const onKeyDownEmail = (e) => {
  e.preventDefault();
};

/**
 * Open Auth Modal
 */
const makeAuth = async () => {
  const { valid } = await validate();

  if (!valid) {
    return;
  }

  const config = useRuntimeConfig();

    try {
      loading.value = true;

      const response = await $fetch(`${config.public.apiBaseUrl}/api/customer/auth/sendVerificationCode`, {
        body: { email: emailValue.value },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response?.success) {
        setErrors({
          email: response.error
        });
      } else {
        openAuthModal();
        isOtpGenerated.value = true;
      }

      controlCode.value = response.control_code;
      email.value = emailValue.value;
    } catch (err) {
      setErrors({
        email: err
      });
    }

  loading.value = false;
  openAuthModal();
};

defineExpose({
  emailRef,
  focus,
});
</script>

<style lang="scss" src="./AuthLogin.scss" />
