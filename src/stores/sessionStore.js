export const useSessionStore = defineStore('sessionStore', {
  state: () => ({
    isLogged: false,
  }),

  actions: {
    setCustomerSession(session) {
      this.isLogged = !!session;
    },
  },
});
