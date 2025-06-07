import { Dayjs } from 'dayjs';
import Chronos from './chronos';
import { HoursData, Event } from '@/schema';
import { v4 as uuidv4 } from 'uuid';


export interface Hours {
  min: Chronos;
  max: Chronos;
  breaks: Chronos[];
  isOpen(hour: Chronos): boolean;
  compileTimes(text: string): void;
}

export enum DAYS {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
};

export const getDayString = (dayIndex: number) => {
  switch (dayIndex) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
  }
}



export const getDayIndex = (dayString: string) => {
  const prefix = dayString.substring(0, 3).toLowerCase();

  switch (prefix) {
    case 'm':
    case 'mo':
    case 'mon':
      return DAYS.MONDAY;
    case 'tu':
    case 'tue':
      return DAYS.TUESDAY;
    case 'we':
    case 'wed':
      return DAYS.WEDNESDAY;
    case 'th':
    case 'thu':
    case 'thur':
    case 'thurs':
      return DAYS.THURSDAY;
    case 'fr':
    case 'fri':
      return DAYS.FRIDAY;
    case 'sa':
    case 'sat':
      return DAYS.SATURDAY;
    case 'su':
    case 'sun':
      return DAYS.SUNDAY;
    case 'd':
    case 'da':
    case 'dai':
      return 7;
    default:
      return -1;
  }
};

export const incrementDay = (day: number) => {
  switch (day) {
    case DAYS.SUNDAY:
      return DAYS.MONDAY;
    case DAYS.MONDAY:
      return DAYS.TUESDAY;
    case DAYS.TUESDAY:
      return DAYS.WEDNESDAY;
    case DAYS.WEDNESDAY:
      return DAYS.THURSDAY;
    case DAYS.THURSDAY:
      return DAYS.FRIDAY;
    case DAYS.FRIDAY:
      return DAYS.SATURDAY;
    case DAYS.SATURDAY:
      return DAYS.SUNDAY;
    default:
      return day;
  }
};


export type Segment = { start: Chronos, end: Chronos };

export type HoursSelect = {
  min: number,
  breaks: number[],
  max: number
}

export class Hours {
  public min: Chronos;
  public max: Chronos;
  public breaks: Chronos[];
  public as_text: string;
  // Local
  public collisions: number;


  static OPEN = 1;
  static CLOSED = 0;
  static DIGIT_IN_TIME = 1;
  static APM_IN_TIME = 2;

  // 0 - reserved for closed, 1 - reserved for open, 2 is the 0 position of the array, this is the prefix
  static HOURS_LOCATOR_PREFIX = 2;
  static SUNDAY = 0;
  static ISOLATED_DAY_IN_PATTERN = 2;
  static ISOLATED_COMMA_IN_PATTERN = 3;

  static DAY_PATTERN = '(?<days>(?:(\\b[M|Tu|W|Th|F|Sa|Su|D]\\w*)\\s*([,])?\\s*?))';
  static SIMPLE_HOURS_PATTERN = '(\\d{1,2})[:]?(\\d{1,2})?[\\s]*([AP])?';
  static HOURS_PATTERN = `(?<times>(?:\\d{1,2}[APM]{0,2}.*)+|Open|Closed)`;
  static COMBINED_SCHEDULE_SPLIT_PATTERN = `((?<days>(?:(?:Mo|Tu|W|Th|F|Sa|Su|D)[A-Z]*[^CO\\d]*)*)(?<times>(((?:\\d{1,2}((?!Mo|Tu|W|Th|F|Sa|Su)\\D)*)+)+)|Open|Closed))`;
  static OPEN_CLOSED_PATTERN = /^(Open|Closed)$/i;

  id = () => {
    return `${this.min.print()}, ${this.breaks.map(brk => `${brk.print()}, `)}, ${this.max}`
  }

  // TODO
  localize(): Hours {
    return this;
  }

  // TODO
  globalize(): Hours {
    return this;
  }

  getMin = () => {
    return this.min;
  }

  getMax = () => {
    return this.max;
  }

  to_string = (): string => {
    let result = "";
    result += `${this.min.print(true)}-`;

    if (this.breaks && this.breaks[0]) {
      let isComma = true;
      for (const brk of this.breaks) {
        result += isComma ? `${brk.print(true)}, ` : `${brk.print(true)}-`
        isComma = !isComma;
      }
    }

    result += this.max.print(true)

    return result;
  }

  toBreaks = (): Chronos[] => {
    const result = [this.min];
    for (const brk of this.breaks) {
      result.push(brk);
    }
    result.push(this.max);
    return result;
  }

  toSegments = (): Segment[] => {
    const result = [this.min];
    for (const brk of this.breaks) {
      result.push(brk);
    }
    result.push(this.max);

    const segments: Segment[] = [];
    for (let i = 0; i < result.length; i += 2) {
      segments.push({
        start: result[i],
        end: result[i + 1],
      });
    }
    return segments;
  }

  isEqual = (other: Hours) => {

    if (!this.min.isEqual(other.min)) {
      return false;
    }

    if (!this.max.isEqual(other.max)) {
      return false;
    }

    if (this.breaks.length != other.breaks.length) {
      return false;
    }

    for (var i = 0; i < this.breaks.length; i++) {
      if (!this.breaks[i].isEqual(other.breaks[i])) {
        return false;
      }
    }

    return true;
  }

  add = (other: { start_time: Chronos, end_time: Chronos }) => {
    if (!other.start_time || !other.end_time) {
      throw Error("Need start and end timing and at least one date.")
    }

    let i = 0;
    const newSegments = [];
    const segments = this.toSegments();

    let current = null;
    for (i = 0; i < segments.length; i++) {
      current = segments[i];
      // A-M

      // A
      if (other.end_time.isBefore(current.start)) {
        newSegments.push(current);
        newSegments.push({ start: other.start_time, end: other.end_time });
        console.log("Case A")
        continue;
      }
      // B-M

      // I
      if (other.start_time.isAfter(current.end)) {
        newSegments.push(current);
        newSegments.push({ start: other.start_time, end: other.end_time });
        continue;
      }
      // B-H, J-M

      // B, C, D, J, K, L, M
      if (other.start_time.isBefore(current.start, true)) {

        // B, C, D, J
        if (other.end_time.isBefore(current.end, true)) {
          console.log("Case B, C, D")
          newSegments.push({ start: other.start_time, end: current.end })
          continue;
        }
        console.log("Case J, K, L, M")
        /**
         * K, L, M
         * Cooks the whole segment
         */
        newSegments.push({ start: other.start_time, end: other.end_time })
        continue;
      }
      // E-H

      // E
      if (other.end_time.isBefore(current.end)) {
        console.log("Case E")
        newSegments.push(current);
        continue;
      }

      // F, G, H
      console.log("Case F, G, H")
      newSegments.push({ start: current.start, end: other.end_time });
    }

    for (i = i; i < segments.length; i++) {
      let current = segments[i];
      newSegments.push(current);
    }

    const result = [];
    for (const seg of newSegments) {
      result.push(seg.start);
      result.push(seg.end);
    }

    if (result.length === 0) {
      return null;
    }

    const unionHours = new Hours(result[0].getHMN(), result[result.length - 1].getHMN(), result.length > 2 ? result.slice(1, result.length - 1).map(x => x.getHMN()) : []);
    console.log(unionHours)
    return unionHours;
  }

  subtract = (other: { start_time: Chronos, end_time: Chronos, [key: string]: any }): Hours | boolean => {
    if (!other.start_time || !other.end_time) {
      throw Error("Need start and end.")
    }

    let i = 0;
    const newSegments = [];
    const segments = this.toSegments();

    let current = null;
    for (i = 0; i < segments.length; i++) {
      current = segments[i];
      // A-M

      // A
      if (other.end_time.isBefore(current.start)) {
        newSegments.push(current)
        console.log("Case A")
        continue;
      }
      // B-M

      // I
      if (other.start_time.isAfter(current.end)) {
        newSegments.push(current);
        continue;
      }
      // B-H, J-M

      // B, C, D, J, K, L, M
      if (other.start_time.isBefore(current.start, true)) {

        // B, C, D
        if (other.end_time.isBefore(current.end)) {
          console.log("Case B, C, D")
          newSegments.push({ start: other.end_time, end: current.end })
        }
        console.log("Case J, K, L, M")
        /**
         * J, K, L, M
         * Cooks the whole segment
         */
        continue;
      }
      // E-H

      // E
      if (other.end_time.isBefore(current.end)) {
        console.log("Case E")
        newSegments.push({ start: current.start, end: other.start_time });
        newSegments.push({ start: other.end_time, end: current.end });
        continue;
      }

      // F, G, H
      console.log("Case F, G, H")
      newSegments.push({ start: current.start, end: other.start_time });
    }

    for (i = i; i < segments.length; i++) {
      let current = segments[i];
      newSegments.push(current);
    }

    const result = [];
    for (const seg of newSegments) {
      result.push(seg.start);
      result.push(seg.end);
    }

    if (result.length === 0) {
      return false;
    }

    const unionHours = new Hours(result[0].getHMN(), result[result.length - 1].getHMN(), result.length > 2 ? result.slice(1, result.length - 1).map(x => x.getHMN()) : []);
    console.log(unionHours)
    return unionHours;
  }

  union = (other: Hours): Hours | boolean => {

    const segments = [...other.toSegments(), ...this.toSegments()];
    segments.sort((a, b) => {
      if (a.start !== b.start) {
        return a.start.getHMN() - b.start.getHMN();
      }
      return a.end.getHMN() - b.end.getHMN();
    });

    const merged: Segment[] = [];
    let current = segments[0];

    for (let i = 1; i < segments.length; i++) {
      const next = segments[i];
      if (!current.end.isBefore(next.start)) {
        current.end = current.end.isAfter(next.end) ? current.end : next.end;
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    const result = [];
    for (const seg of merged) {
      result.push(seg.start);
      result.push(seg.end);
    }

    if (result.length === 0) {
      return false;
    }
    const unionHours = new Hours(result[0].getHMN(), result[result.length - 1].getHMN(), result.slice(1, result.length - 1).map(x => x.getHMN()));
    return unionHours;
  }

  isOpen(hour: Chronos): boolean {
    if (hour.isBefore(this.min)) {
      return false;
    }

    if (hour.isAfter(this.max)) {
      return false;
    }

    let result = true;
    for (const timeBreak of this.breaks) {
      if (hour.isBefore(timeBreak)) {
        return result;
      }
      result = !result;
    }

    return true;
  }

  getNumberOfHours(): number {

    let value = 0;
    value += this.max.getHMN() - this.min.getHMN();

    try {
      for (let index = 0; index < this.breaks.length; index += 2) {
        value -= this.breaks[index + 1].getHMN() - this.breaks[index].getHMN();
      }
    }
    catch (err) {
      console.log("Calculation had an error");
    }

    return value;
  }

  isOpenWithContext(hour?: Chronos): { isOpen: boolean, context: string } {

    if (!hour) {
      return {
        isOpen: true,
        context: this.as_text
      }
    }
    
    if (hour.isBefore(this.min)) {
      return {
        isOpen: false,
        context: `Opens at ${this.min.print(true)}`
      };;
    }

    if (hour.isAfter(this.max)) {
      return {
        isOpen: false,
        context: `Closed at ${this.max.print()}`
      }
    }

    let result = true;
    for (const timeBreak of this.breaks) {
      if (hour.isBefore(timeBreak)) {
        return {
          isOpen: result,
          context: result ? `Open, break at ${timeBreak.print(true)}` : `Closed, back at ${timeBreak.print(true)}`
        }
      }
      result = !result;
    }

    return {
      isOpen: true,
      context: `Open, until ${this.max.print(true)}`
    }
  }

  compileTimes(text: string) {
    const timesScheduleRegex = new RegExp(Hours.SIMPLE_HOURS_PATTERN, 'ig');
    const matches = [...text.matchAll(timesScheduleRegex)];

    if (!matches) throw Error('No matches in times.');

    const objects: Chronos[] = [];
    for (const match of matches) {
      objects.push(new Chronos(match, false));
    }

    if (objects.length < 2) {
      throw Error('String is bad.');
    }
    this.min = objects[0];
    const max = objects.pop();
    if (!max) {
      throw Error('String is bad. No max or max is before min.')
    };

    if (this.min.isAfter(max)) {
      // Try 2am as 26
      max.setHour(max.getHour() + 24, false);
    }

    if (this.min.isAfter(max)) {
      throw Error("Still not set correctly.")
    }

    this.max = max;
    this.breaks = objects.slice(1);
    return;
  }



  eject(): HoursData {
    return {
      min: this.min.getHMN(),
      max: this.max.getHMN(),
      breaks: this.breaks ? this.breaks.map((b) => b.getHMN()) : []
    }
  }

  constructor(hoursString?: string);
  constructor(min: number, max: number, breaks?: number[], time_zone_offset?: number);
  constructor(arg1?: number | string, max?: number, breaks?: number[], time_zone_offset: number = 0) {

    if (arguments.length === 1) {
      this.min = new Chronos();
      this.max = new Chronos();
      this.breaks = [];
      this.as_text = String(arg1);
      this.collisions = 0;
      // e.g asString = 8am-11am, 12pm-1pm, 2pm-5pm, 6pm-2am
      this.compileTimes(String(arg1));
      return;
    }

    if ((typeof arg1 != "number" && typeof arg1 != "string") || !max) {
      console.log(arg1, max, breaks, time_zone_offset)
      throw Error("An error occured while creating a hours")
    }

    this.min = new Chronos(Number(arg1), false);
    this.max = new Chronos(max, false);
    this.breaks = breaks?.map((item) => new Chronos(item, false)) || [];
    this.as_text = this.to_string();
    this.collisions = 0;
    return;
  }
}



