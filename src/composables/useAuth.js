export const useAuth = () => {
  const localePath = process.env.BACKEND_API_URL || '/';

  const {
    pending,
    authData,
    otpTimer,
    otpTimerAmount,
    callback,
    isAuth,
    isAuthModal,
    isOtpGenerated,
  } = storeToRefs(useAuthStore());

  const openAuthModal = (callbackValue) => {
    if (isAuth.value) {
      return;
    }

    isAuthModal.value = true;

    if (typeof callbackValue === 'function') {
      callback.value = callbackValue;
    }
  };

  const closeAuthModal = () => {
    isAuthModal.value = false;
    removeCookie('_redirectTo');
    removeCookie('_openAuth');
  };

  const getOtp = async ({ email }) => {
    pending.value = true;
    isOtpGenerated.value = false;
    authData.value.email = email;

    try {
      const result = await fetchApiPost('/auth/otp', {
        data: { email },
      });

      authData.value.isRegistered = result?.isRegistered;

      if (result?.isGenerated) {
        authData.value.otp = undefined;
        otpTimer.value = Number(otpTimerAmount.value);
        isOtpGenerated.value = result.isGenerated;
      }
    } catch (error) {
      throw createError(error);
    } finally {
      pending.value = false;
    }
  };

  const getAuth = async (params) => {
    pending.value = true;

    try {
      const result = await fetchApiPost(params?.social ? '/auth/social' : '/auth/email', {
        data: {
          ...params,
        },
      });

      if (!params?.social) {
        trackLogin({ method: 'email' });
      }

      if (result?.cart) {
        cart.value = result.cart;
        updateDataCartLocalStorage(result.cart);
      }

      if (result?.user) {
        user.value = result.user;
        wishlistSummary.value = result.wishlist.list;
        wishlistId.value = result.wishlist.wishlistId;
        wishlistCount.value = result.wishlist.wishlistCount;
        downloadableSummary.value = result.downloadable;
        authData.value = {};
        isOtpGenerated.value = false;
        isAuth.value = true;
      }

      if (callback.value) {
        await callback.value();
        callback.value = undefined;
      }

      return {
        ...result,
        method: params?.social || 'email',
      };
    } finally {
      pending.value = false;
    }
  };

  const logout = async () => {
    try {
      await fetchApiPost('/auth/logout');
      await removeCookie('_order');
      await navigateTo(localePath('/'));
      await removeCookieCart();
      removeDataCartLocalStorage();

      cart.value = undefined;
      authData.value = {};
      user.value = undefined;
      wishlistSummary.value = undefined;
      isOtpGenerated.value = false;
      isAuth.value = false;

      if (openList.value?.length) {
        openList.value = [];
      }

      viewedProducts.value = [];
    } catch (error) {
      throw createError(error);
    }
  };

  return {
    logout,
    openAuthModal,
    closeAuthModal,
    getOtp,
    getAuth,
  };
};
