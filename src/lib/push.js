/**
 * Helpers pour les notifications push Web (VAPID).
 *
 * Toutes les fonctions sont des no-ops silencieux si :
 * - Le navigateur ne supporte pas les Service Workers / PushManager
 * - VITE_VAPID_PUBLIC_KEY n'est pas défini
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/** Convertit une clé VAPID base64url en Uint8Array. */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Retourne true si le navigateur supporte les push et si VAPID est configuré. */
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!VAPID_PUBLIC_KEY
  );
}

/** Retourne le statut de permission actuel : 'granted' | 'denied' | 'default'. */
export function getPushPermission() {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/**
 * Enregistre le service worker, demande la permission et souscrit aux push.
 * Envoie la souscription au backend via `api.post('/push/subscribe', sub)`.
 * Retourne la PushSubscription si succès.
 */
export async function subscribeToPush(api) {
  if (!isPushSupported()) {
    throw new Error('Les notifications push ne sont pas supportées par ce navigateur.');
  }

  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  // Si déjà souscrit sur cet appareil, on re-synchronise avec le backend.
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    const json = existing.toJSON();
    await api.post('/push/subscribe', {
      endpoint: json.endpoint,
      keys: json.keys,
    });
    return existing;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission refusée par l\'utilisateur.');
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const json = sub.toJSON();
  await api.post('/push/subscribe', {
    endpoint: json.endpoint,
    keys: json.keys,
  });

  return sub;
}

/**
 * Annule la souscription push sur cet appareil et notifie le backend.
 */
export async function unsubscribeFromPush(api) {
  if (!('serviceWorker' in navigator)) return;

  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return;

  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
  await sub.unsubscribe();
}

/**
 * Retourne true si cet appareil est actuellement souscrit aux push.
 */
export async function isPushSubscribed() {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
