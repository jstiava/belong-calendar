import MinHeap from './MinHeap';
import { Event, Events } from '@/schema';
import { Hours } from './utils/medici';
import dayjs from './utils/dayjs';
import { Dayjs } from 'dayjs';
import CalendarDay from './CalendarDay';
import { isAllSingleDay, isMoment, isMultiDayEvent, isNotScheduled, isSingleTimeEvent } from './CalendarDays';
import Chronos from './utils/chronos';

function doesCollide(
  event1: Event,
  event2: Event,
  date: Dayjs) {
  try {

    if (isSingleTimeEvent(event1) && isSingleTimeEvent(event2)) {
      return event1.start_time.getHMN() < event2.end_time.getHMN() && event1.end_time.getHMN() > event2.start_time.getHMN()
    }

    if (isSingleTimeEvent(event1) && !isNotScheduled(event2)) {
      const schedules = event2.getSchedulesInFrame(date);
      const hours = schedules[0].getHours(date.day());
      if (typeof hours === 'boolean') {
        return false;
      }
      return event1.start_time.getHMN() < hours.getMax().getHMN() || event1.end_time.getHMN() > hours.getMin().getHMN()
    }

    if (!isNotScheduled(event1) && !isNotScheduled(event2)) {
      return true;
    }

    if (!isNotScheduled(event1) && isSingleTimeEvent(event2)) {
      return true;
    }

  }
  catch (err) {
    console.log(err)
    return true;
  }
}



export default class CalendarDayRendered implements CalendarDay {

  loading = false;
  version: number = 0;
  count: number = 0;
  date: Dayjs;
  topOffset: number = 0;

  events: Event[] = [];
  stack: Event[] = [];
  chaos: Event[][] = [];
  aside: Event[] = [];

  constructor(dateNumber: number, calDay? : CalendarDay) {
    this.date = dayjs(String(dateNumber));

    if (calDay) {
      for (const events of calDay.events) {
        try {
          this.add(events);
        }
        catch (err) {
          console.log({
            message: "Failed to add",
            err
          })
        }
      }
    }


    return;
  }

  private addToChaos(event : Event) {
    let placed = false;
    for (const column of this.chaos) {
      if (doesCollide(event, column[column.length - 1], this.date)) {
        column[column.length - 1].collisions += 1;
        event.collisions += 1;
        continue;
      }
      else {
        !placed && column.push(event);
        placed = true;
      }
    }
    
    if (!placed) {
      this.chaos.push([event]);
    }

  }

  add(event: Event, target?: keyof this & ('stack' | 'aside' | 'chaos')) {

    if (isMoment(event)) {
      this.events.push(event);
      !target ? this.aside.push(event) : target === 'chaos' ? this.addToChaos(event) : this[target].push(event);
      return;
    }

    if (isAllSingleDay(event)) {
      !target ? this.stack.push(event) : target === 'chaos' ? this.addToChaos(event) : this[target].push(event);;
      this.events.push(event);
      return;
    }

    if (isMultiDayEvent(event)) {
      this.events.push(event);
      this.topOffset += 1;
      !target ? this.stack.push(event) : target === 'chaos' ? this.addToChaos(event) : this[target].push(event);
      return;
    }

    if (isSingleTimeEvent(event)) {
      this.events.push(event);
      !target ? this.addToChaos(event) : target === 'chaos' ? this.addToChaos(event) : this[target].push(event);
      return;
    }

    // might be scheduled
    if (!isNotScheduled(event)) {
      this.events.push(event);
      !target ? this.addToChaos(event) : target === 'chaos' ? this.addToChaos(event) : this[target].push(event);
      return;
    }

    this.count += 1;
    this.events.push(event);
  }


  remove(uuid: string): Event | null {
    try {
      this.count = this.count - 1;
      const theEvent = this.find(uuid);

      const events = this.events.filter(x => x.id() != uuid);
      this.events = events;

      const stack = this.stack.filter(x => x.id() != uuid);
      this.stack = stack

      const aside = this.aside.filter(x => x.id() != uuid);
      this.aside = aside

      for (const [columnIndex, column] of this.chaos.entries()) {
        const index = column.findIndex(event => event.id() === uuid);
        if (index !== -1) {
          const [removedEvent] = column.splice(index, 1);
        }
      }

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

  moveTo(uuid: string, target: keyof this & ('stack' | 'aside' | 'chaos')) {
    const theEvent = this.remove(uuid);
    if (!theEvent) {
      throw Error("Nothing to move.")
    }
    this.add(theEvent, target);
  }


  reset(): void {
    this.version = 0;
    this.count = 0;
    this.stack = [];
    this.topOffset = 0;
    this.chaos = [];
    this.events = [];
  }

  move(uuid: string) {
    return;
  }
}
