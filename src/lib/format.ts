import { format, parseISO } from 'date-fns';

export function formatEventWhen(start: string, end: string | null): string {
  try {
    const s = parseISO(start);
    const datePart = format(s, 'EEE d MMM');
    const timePart = format(s, 'HH:mm');
    if (end) {
      const e = parseISO(end);
      const sameDay = format(s, 'yyyy-MM-dd') === format(e, 'yyyy-MM-dd');
      if (sameDay) return `${datePart} · ${timePart}–${format(e, 'HH:mm')}`;
      return `${datePart} – ${format(e, 'EEE d MMM')}`;
    }
    if (timePart === '10:00' || timePart === '00:00') return datePart;
    return `${datePart} · ${timePart}`;
  } catch {
    return start;
  }
}
