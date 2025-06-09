"use client"
import { Dayjs } from "dayjs";
import CalendarDay from "./CalendarDay";
import { Event, Schedule, dayjs, Chronos, isMoment, isAllSingleDay, isMultiDayEvent, isNotScheduled, isSingleTimeEvent } from '@jstiava/chronos';


export class CalendarDays<T extends CalendarDay> {

    version: number;
    start: Dayjs;
    end: Dayjs;
    days: Map<number, T>;
    create: (date : number) => any;

    getOrCreate = (date: number) => {
        const day = this.days.getOrCreate(date, () => this.create(date));
        return day;
    }
    
    purge = (uuid: string) => {
        for (let currDate = this.start; !currDate.isSame(this.end.add(1, 'day'), 'date'); currDate = currDate.add(1, 'day')) {
            const day = this.days.get(currDate.yyyymmdd());
            if (!day) {
                continue;
            }
            day.remove(uuid);
        }
    }

    find = (uuid: string) => {

        const days = [];
        for (let currDate = this.start; !currDate.isSame(this.end.add(1, 'day'), 'date'); currDate = currDate.add(1, 'day')) {
            const day = this.days.get(currDate.yyyymmdd());
            if (!day) {
                continue;
            }
            days.push(day);
        }
        return days;
    }


    add = (event: Event) => {

        if (isMoment(event)) {
            const day = this.days.getOrCreate(event.date.yyyymmdd(), () => this.create(event.date.yyyymmdd()));
            day.add(event);
            return;
        }

        if (isSingleTimeEvent(event)) {
            const day = this.days.getOrCreate(event.date.yyyymmdd(), () => this.create(event.date.yyyymmdd()));
            day.add(event);
            return;
        }

        if (isAllSingleDay(event)) {
            const day = this.days.getOrCreate(event.date.yyyymmdd(), () => this.create(event.date.yyyymmdd()));
            day.add(event);
            return;
        }

        if (isMultiDayEvent(event)) {

            for (let currDate = event.date.max(this.start); !currDate.isSame(event.end_date.add(1, 'd').min(this.end.add(1, 'd')), 'd'); currDate = currDate.add(1, 'day')) {
                const day = this.days.getOrCreate(currDate.yyyymmdd(), () => this.create(event.date.yyyymmdd()));
                day.add(event.copy());
            }
            return;
        }

        if (!isNotScheduled(event)) {

            console.log({
                event,
                isMoment: isMoment(event),
                isMultiDayEvent: isMultiDayEvent(event),
                isSingleTimeEvent: isSingleTimeEvent(event),
                isNotScheduled: isNotScheduled(event)
            });
            
            for (let currDate = this.start; !currDate.isSame(this.end.add(1, 'day'), 'date'); currDate = currDate.add(1, 'day')) {

                const schedulesForDay = event.getSchedulesInFrame(currDate);
                if (!schedulesForDay || schedulesForDay.length === 0) {
                    continue;
                }
                const dateWithSchedule = this.days.getOrCreate(currDate.yyyymmdd(), () => this.create(currDate.yyyymmdd()));
                dateWithSchedule.add(new Event(event.eject()));

            }
            return;
        }

        console.log({
            event,
            isMoment: isMoment(event),
            isMultiDayEvent: isMultiDayEvent(event),
            isSingleTimeEvent: isSingleTimeEvent(event),
            isNotScheduled: isNotScheduled(event)
        });
        throw Error("Could not add that event.")

    }

    constructor(start: Dayjs, end: Dayjs, create : (date: number) => CalendarDay) {
        this.version = 0;
        this.start = start;
        this.end = end;
        this.days = new Map();
        this.create = create;
        return this;
    }



}