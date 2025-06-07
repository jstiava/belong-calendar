"use client"
import { useEffect, useMemo, useState } from 'react';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';
import axios, { API } from './utils/axios';
import { Member, Event } from '@/schema';
import { isMultiDayEvent } from './CalendarDays';

export interface UseCalendar {
  frameDate: dayjs.Dayjs;
  gotoToday: () => void;
  next: () => void;
  prev: () => void;
  isTodayPresent: () => boolean;
  gotoStartOfWeek: (frame?: dayjs.Dayjs) => void;
  goToStartOfMonth: (frame?: dayjs.Dayjs) => void;
  days: dayjs.Dayjs[];
  sequence: number[] | null;
  goto: (date: dayjs.Dayjs) => void;
  eventDays: any[];
  initSource: (source: Member | null) => void;
  gotoDate: (date?: Dayjs | number) => void;
  has: (date: Dayjs) => boolean;
}

export default function useCalendar() {
  const [frameDate, setFrameDate] = useState<dayjs.Dayjs>(dayjs().tz('America/Chicago'));
  const [days, setDays] = useState<dayjs.Dayjs[]>([]);
  const [sequence, setSequence] = useState<number[] | null>(null);
  const [eventDays, setEventDays] = useState<any[]>([]);
  const [source, setSource] = useState<Member | null>(null);


  useEffect(() => {
    goToStartOfMonth(dayjs().tz('America/Chicago'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const has = (date: Dayjs) => {
    return date.isAfter(days[0].add(-1, 'day'), 'd') && date.isBefore(days[days.length - 1].add(1, 'day'), 'd')
  }

  const initSource = (theSource: Member | null) => {
    if (!theSource) return;
    setSource(theSource);

    if (theSource instanceof Event) {

      if (isMultiDayEvent(theSource)) {
        const duration = theSource.end_date.diff(theSource.date, 'd');
        if (duration < 8) {
          gotoStartOfWeek(theSource.date);
          return;
        }
        goToStartOfMonth(theSource.date);
        return;
      }
    }

    goToStartOfMonth(dayjs().tz('America/Chicago'));
  };

  const gotoToday = () => {
    gotoStartOfWeek(dayjs().tz('America/Chicago'));
  };

  const next = () => {
    if (days.length === 1) {
      gotoDate(days[0].add(1, 'day'));
      return;
    }
    else if (days.length === 7) {
      nextWeek();
    }
    else {
      console.log("next month")
      nextMonth();
    }
  }

  const prev = () => {
    if (days.length === 1) {
      gotoDate(days[0].subtract(1, 'day'))
      return;
    }
    else if (days.length === 7) {
      prevWeek();
    }
    else {
      console.log("prev month")
      prevMonth();
    }
  }

  const prevMonth = () => {
    goToStartOfMonth(days[0].add(-1, 'day'))
  };

  const nextMonth = () => {
    goToStartOfMonth(days[6].add(1, 'month'))
  };

  const nextWeek = () => {
    const frame = frameDate.add(7, 'day').getFrame(7);
    setDays(frame);
    setFrameDate(frameDate.add(7, 'day'));
  };

  const prevWeek = () => {
    const frame = frameDate.add(-7, 'day').getFrame(7);
    setDays(frame);
    setFrameDate(frameDate.subtract(7, 'day'));
  };

  const isTodayPresent = () => {
    return days.some(date => date.isToday());
  };

  const gotoStartOfWeek = (date: dayjs.Dayjs = frameDate) => {
    const newDate = date.startOf('week');
    const frame = newDate.getFrame(7);
    setDays(frame)
    if (frameDate.isSame(newDate)) {
      return;
    }
    setFrameDate(newDate);
    return;
  };

  const goToStartOfMonth = (date: dayjs.Dayjs = frameDate) => {
    const localDate = dayjs(date).tz('America/Chicago');
    const newDate = localDate.startOf('month').startOf('week');
    const daysInMonth = 7 * 5;
    const frame = newDate.getFrame(daysInMonth);
    setDays(frame)
    setFrameDate(newDate);
  };

  const goto = (date: dayjs.Dayjs) => {
    const frame = frameDate.getFrame(7);
    setDays(frame)
    setFrameDate(date);
    return;
  };

  const gotoDate = (date: dayjs.Dayjs | number = frameDate): void => {
    if (typeof date === "number") {
      if (days.length === 1) {
        date = days[0].add(date, 'day');
      }
      else {
        date = frameDate.add(date, 'day');
      }
    }
    const foundDay = days.find(item => item.isSame(date));
    if (foundDay) {
      setDays([foundDay]);
      return;
    }
    const newFrameDate = date.startOf('week');
    setDays([date])
    setFrameDate(newFrameDate);
  }

  return {
    frameDate,
    gotoToday,
    next,
    prev,
    isTodayPresent,
    gotoStartOfWeek,
    days,
    sequence,
    goto,
    eventDays,
    initSource,
    gotoDate,
    goToStartOfMonth,
    has
  }
}
