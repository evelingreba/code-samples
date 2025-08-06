export const removeCookie = (cookieName) => {
  return new Promise((resolve) => {
    const cookie = useCookie(cookieName);
    return resolve((cookie.value = null));
  });
};
