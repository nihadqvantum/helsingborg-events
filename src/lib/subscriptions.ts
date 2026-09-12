import fs from 'fs';
import path from 'path';
import type { PushSubscription } from 'web-push';

const file = path.join(process.cwd(), 'data', 'subscriptions.json');

export function loadSubscriptions(): PushSubscription[] {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: PushSubscription[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(subs, null, 2));
}

export function addSubscription(sub: PushSubscription) {
  const subs = loadSubscriptions();
  const next = subs.filter((s) => s.endpoint !== sub.endpoint);
  next.push(sub);
  saveSubscriptions(next);
}

export function removeSubscription(endpoint: string) {
  saveSubscriptions(loadSubscriptions().filter((s) => s.endpoint !== endpoint));
}
