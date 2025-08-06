<template>
  <UiModal
      v-model="isAuthModal"
      :contentClass="['modal-auth']"
      size="sm"
      @modal:close="closeAuthModal"
  >
    <template #header>{{ 'Вхід' }}</template>
    <AuthLogin  v-if="!isOtpGenerated" />

    <AuthConfirm
        v-else
        :error="errorMessage"
        @confirm="onConfirm"
    >
      <template #actions>
        <slot
            v-if="$slots.confirmActions"
            name="confirmActions"
        />

        <UiButton
            v-else
            type="button"
            variant="link"
            block
            @click="changeEmail"
        >
          {{ 'Змінити Email' }}
        </UiButton>
      </template>
    </AuthConfirm>
  </UiModal>
</template>

<script setup>
import { useRouter } from 'vue-router';

const { checkCustomerSession } = useSession();

const { openAuthModal, closeAuthModal } = useAuth();

const { authData, otpTimer, callback, isAuthModal, isOtpGenerated, email, code } = storeToRefs(useAuthStore());

const errorMessage = ref();

const router = useRouter();

const onConfirm = async () => {
  const config = useRuntimeConfig();

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/customer/auth/login`, {
      body: {
        email: email.value,
        code: code.value,
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response?.success) {
      errorMessage.value = response.error;
    } else {
      closeAuthModal();
      checkCustomerSession();

      await router.push('/customer');
    }
  } catch (err) {
    errorMessage.value = response.error;
  }
};

const changeEmail = () => {
  isOtpGenerated.value = false;
};

watch(isAuthModal, (value) => {
  if (!value) {
    removeCookie('_redirectTo');
  }
});

const openAuthModalWithRedirect = () => {
  const _openAuth = useCookie('_openAuth');
  const _redirectTo = useCookie('_redirectTo');

  if (_openAuth.value) {
    if (_redirectTo.value) {
      callback.value = function () {
        navigateTo(_redirectTo.value);
        removeCookie('_openAuth');
        removeCookie('_redirectTo');
      };
    }

    openAuthModal();
  }
};

onMounted(() => {
  openAuthModalWithRedirect();
});

onUnmounted(() => {
  otpTimer.value = 0;
  authData.value = {};
  isOtpGenerated.value = false;
});
</script>

<style src="./AuthModal.scss" lang="scss" />
