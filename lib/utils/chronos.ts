import { Dayjs } from 'dayjs';
import dayjs from './dayjs';

export default interface Chronos {
  setHour(num: number): void;
  setMinute(num: number): void;
  changeHour(amount: number): number;
  changeMinute(amount: number): number;
  add(amount: number): Chronos;
  getHMN(): number;
  getMinute(): number;
  getHour(): number;
  print(simple: boolean, truncate: number): string;
  getDayjs(truncate: number, isLocal: boolean): Dayjs;
  isAfter(other: Chronos, inclusive?: boolean): boolean;
  isBefore(other: Chronos, inclusive?: boolean): boolean;
  isWithin(startingTime: Chronos, endingTime: Chronos): boolean;
  is(other: Chronos): boolean;
  to(other: Chronos | null, truncate?: number): string;
}

export default class Chronos {
  private hour: number;
  private minute: number;

  

  constructor(num?: number | any[], roundBy24: boolean = true) {
    this.hour = 0;

    if (num === null || num === undefined) {
      const day = dayjs().local();
      this.hour = day.hour() % 24;
      this.minute = day.minute();
      return;
    }

    if (Array.isArray(num)) {
      this.setHour(Number(num[1]));
      this.minute = num[2] ? Number(num[2]) : 0;
      if (num[3] && num[3].charAt(0).toLowerCase() === 'p') {
        if (this.hour != 12) {
          this.changeHour(12);
        }
      }
      else if (this.hour === 12 && !roundBy24) {
        this.hour = 24;
      }
      return;
    }

    this.hour = Math.trunc(num);
    this.minute = Math.round(Math.abs(num - this.hour) * 60);
    while (this.minute >= 60) {
      this.minute = this.minute - 60;
      this.hour = this.hour + 1;
    }

    this.hour = roundBy24 ? this.hour % 24 : this.hour;
    if (this.hour < 0) {
      this.hour = 24 + this.hour;
    }

  }

  setHour(num: number = 0, roundBy24: boolean = true) {
    this.hour = roundBy24 ? num % 24 : num;
    return;
  }

  setMinute(num: number = 0) {
    this.minute = num % 60;
    return;
  }

  changeHour(amount: number = 1): number {
    this.hour = (this.hour + amount) % 24;
    return this.hour;
  }

  changeMinute(amount: number = 1): number {
    this.minute = this.minute + amount;
    if (this.minute >= 60) {
      this.minute = this.minute % 60;
      this.changeHour();
    }
    return this.minute;
  }

  add(amount: number = 1, roundBy24: boolean = true): Chronos {
    const hmn = this.getHMN();
    return new Chronos(hmn + amount, roundBy24);
  }

  getHMN(truncate: number = 1, dangerousRoundBy24: boolean = false): number {
    const hour = dangerousRoundBy24 ? this.hour % 24 : this.hour;
    const num = hour + this.minute / 60;
    const factor = truncate / 60;
    return Math.round(num / factor) * factor;
  }

  getMinute(): number {
    return this.minute;
  }

  getHour(amount: number = 0): number {
    if (amount != 0) {
      const newDate = this.add(amount);
      return newDate.getHour();
    }
    return this.hour;
  }

  printHour() {
    var hour = this.getHour();
    if (hour > 24) {
      return hour;
    }
    if (hour > 12) {
      return hour - 12;
    }
    return hour;
  }

  private printSimple(amp: boolean = true): string {
    if (this.hour == 0) {
      return `12${amp ? `AM` : ""}`;
    }

    if (this.hour == 24) {
      return `12${amp ? `AM` : ""}`
    }
    if (this.hour > 24) {
      return `${this.hour - 24}${amp ? `AM` : ""}`;
    }

    if (this.hour > 12) {
      const hourAMP = this.hour - 12;
      return `${hourAMP}${amp ? `PM` : ""}`;
    }

    if (this.hour == 12) {
      return `12${amp ? `PM` : ""}`;
    }

    return `${this.hour}${amp ? `AM` : ""}`;
  }

  print(simple: boolean = false, truncate: number = 1, amp: boolean = true): string {
    const minute = (Math.round(this.minute / truncate) * truncate) % 60;
    const carry = this.minute > (60 - truncate / 2) ? 1 : 0;
    const hourAndCarry = (this.hour + carry) % 24;

    if (simple && this.minute === 0) {
      return this.printSimple(amp);
    }

    if (hourAndCarry == 0) {
      return `12:${String(minute).padStart(2, '0')} ${amp ? `AM` : ""}`;
    }

    if (hourAndCarry >= 24) {
      return `${hourAndCarry - 24}:${String(minute).padStart(2, '0')} ${amp ? `AM` : ""}`;
    }

    if (hourAndCarry > 12) {
      const hourAMP = this.hour - 12 + carry;
      return `${hourAMP}:${String(minute).padStart(2, '0')} ${amp ? `PM` : ""}`;
    }

    if (hourAndCarry == 12) {
      return `${hourAndCarry}:${String(minute).padStart(2, '0')} ${amp ? `PM` : ""}`;
    }

    return `${hourAndCarry}:${String(minute).padStart(2, '0')} ${amp ? `AM` : ""}`;
  }

  printMinute(): string {
    if (this.getMinute() === 0) {
      return ''
    }
    return `:${this.getMinute()}`
  }

  to(other: Chronos | null, truncate: number = 1, format = {
    hour: "h",
    minute: "m"
  }): string {

    const hour = format.hour || "h";
    const minute = format.minute || "mm";

    if (!other) {
      return this.print(false, truncate, true);
    }

    return `${this.print(false, truncate, true)} - ${other.print(false, truncate, true)}`

    // if (this.getHour() === other.getHour()) {
    //   return `${this.print(true, truncate, true)} - ${other.print(true, truncate, false)}`
    // }


    // if (this.getAMP() === other.getAMP()) {
    //   return `${this.print(true, truncate, true)} - ${other.print(true, truncate, false)}`;
    // }
    // return `${this.print(true, truncate, true)} - ${other.print(true, truncate, true)}`
  }

  getAMP() {
    return this.hour >= 12 && this.hour < 24 ? "PM" : "AM"
  }

  getDayjs(truncate: number = 1, isLocal: boolean = true): dayjs.Dayjs {
    const minute = (Math.round(this.minute / truncate) * truncate) % 60;
    const carry = this.minute > 60 - truncate / 2 ? 1 : 0;
    const hourAndCarry = (this.hour + carry) % 24;

    if (isLocal) {
      return dayjs().local().set('hour', hourAndCarry).set('minute', minute).set('second', 0);
    }
    return dayjs().utc().set('hour', hourAndCarry).set('minute', minute).set('second', 0);
  }

  isEqual(other: Chronos): boolean {
    return this.getHMN() === other.getHMN();
  }

  isAfter(other: Chronos, inclusive: boolean = false): boolean {
    return inclusive ? this.getHMN() >= other.getHMN() : this.getHMN() > other.getHMN();
  }

  isBefore(other: Chronos, inclusive: boolean = false): boolean {
    return inclusive ? this.getHMN() <= other.getHMN() : this.getHMN() < other.getHMN();
  }

  isWithin(startingTime: Chronos, endingTime: Chronos): boolean {
    if (this.getHMN() == startingTime.getHMN() || this.getHMN() == endingTime.getHMN()) {
      return true;
    }
    return this.isAfter(startingTime) && this.isBefore(endingTime);
  }

  is(other: Chronos): boolean {
    return other.getHMN() === this.getHMN();
  }

  truncate(amount: number) {
    const value = Math.round(this.getHMN() * amount) / amount;
    this.hour = Math.trunc(value);
    this.minute = Math.round(Math.abs(value - this.hour) * 60);

    return this;
  }

  public static toMinutes(value: number) {
    value = value * 60;
    return Math.round(value / 1) * 1;
  }

  public static absDiff(end: Chronos, start: Chronos): number {
    const endValue = end.getHMN();
    const startValue = start.getHMN();

    if (endValue >= startValue) {
      return endValue - startValue;
    }
    return endValue - startValue + 24;
  }

  public static within(event: Chronos | null, start: Chronos, duration: number): boolean {
    if (!event) return false;
    const diff = this.absDiff(event, start);

    if (diff >= 0 && diff < duration) {
      return true;
    }
    return false;
  }

}

