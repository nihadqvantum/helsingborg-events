import AppShell from '@/components/AppShell';
import { loadEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const events = loadEvents();
  return <AppShell events={events} />;
}
