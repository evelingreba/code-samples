import Cookies from 'js-cookie';
import { useSessionStore } from '@/stores/sessionStore';

export function useSession() {
  const sessionStore = useSessionStore();

  function checkCustomerSession() {
    const session = Cookies.get('customer_session') || null;
    sessionStore.setCustomerSession(session);
  }

  function clearCustomerSession() {
    Cookies.remove('customer_session');
    sessionStore.setCustomerSession(null);
  }

  return {
    checkCustomerSession,
    clearCustomerSession
  };
}
