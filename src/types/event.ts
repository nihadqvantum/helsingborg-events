export type EventTag = 'family' | 'night';

export interface EventItem {
  id: string;
  title: string;
  start: string;
  end: string | null;
  venue: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  price: string;
  url: string;
  tag: EventTag;
  image: string;
}

export type FilterMode = 'all' | 'family' | 'night';
