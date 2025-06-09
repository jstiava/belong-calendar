import MinHeap from './MinHeap';
import { Event, Hours, Dayjs, dayjs } from '@jstiava/chronos';


export default class CalendarDay {

  loading: boolean = false;
  version: number = 0;
  count: number = 0;
  date: Dayjs;
  events: Event[];

  constructor(dateNumber: number) {
    this.date = dayjs(String(dateNumber));
    this.events = [];
    return;
  }

  add(event: Event) {
    this.version += 1;
    this.count += 1;
    this.events.push(event);
  }

  remove(uuid: string): Event | null {
    this.version += 1;
    try {
      this.count = this.count - 1;
      const theEvent = this.find(uuid);
      const events = this.events.filter(x => x.id() != uuid);
      this.events = events;
      return theEvent || null;
    }
    catch (err) {
      return null;
    }
  }

  has(uuid: string): boolean {
    return this.events.some(x => x.id() === uuid)
  }

  find(uuid: string): Event | undefined {
    return this.events.find(x => x.id() === uuid)
  }

}
