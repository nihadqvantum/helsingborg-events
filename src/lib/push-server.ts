import webpush from 'web-push';
import { loadSubscriptions, removeSubscription } from './subscriptions';

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:events@helsingborg.local';
  if (!publicKey || !privateKey) throw new Error('VAPID keys missing');
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  configureWebPush();
  const subs = loadSubscriptions();
  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) removeSubscription(sub.endpoint);
        throw err;
      }
    })
  );
  return {
    sent: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    total: subs.length,
  };
}
