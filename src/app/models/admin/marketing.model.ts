/**
 * Marketing (backend module).
 */
export interface Segment {
  id: number;
  name: string;
  criteria: string;
  members: string;
  lastUsed: string;
}

export interface Campaign {
  id: number;
  name: string;
  channel: string;
  segment: string;
  status: string;
  statusClass: string;
  startEnd: string;
}

export interface EventListItem {
  id: number;
  name: string;
  date: string;
  registrations: string;
}
