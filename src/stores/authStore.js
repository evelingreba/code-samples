import { email } from '@vee-validate/rules';

export const useAuthStore = defineStore('authStore', () => {
  const { store } = storeToRefs(useMainStore());

  const pending = ref(false);
  const token = ref(null);
  const visitor = ref(null);
  const authData = ref({});
  const otpLength = computed(() => Number(store.value?.otpLength));
  const otpTimerAmount = computed(() => Number(store.value?.otpTimerAmount));
  const otpTimer = ref(0);
  const isOtpGenerated = ref(false); // is otp generated after send email number
  const controlCode = ref(null);
  const email = ref(null);
  const code = ref(null);
  const isAuth = ref(false); // is user auth
  const isAuthModal = ref(false); // is modal auth component opened
  const callback = ref();

  return {
    pending,
    token,
    visitor,
    authData,
    otpLength,
    otpTimerAmount,
    otpTimer,
    controlCode,
    email,
    code,
    callback,
    isAuth,
    isAuthModal,
    isOtpGenerated,
  };
});
