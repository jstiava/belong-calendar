import '@testing-library/jest-dom';
import CalendarDay from './CalendarDay';
import MinHeap from './MinHeap';
import { Event, Schedule } from '@jstiava/chronos';
import Chronos from './utils/chronos';
import dayjs from 'dayjs';
import CalendarDayRendered from './CalendarDayRendered';
import { CalendarDays } from './CalendarDays';


test('test remove', () => {

    const days = new Map<number, CalendarDay>();
    const day = days.getOrCreate(20250328, () => new CalendarDay(20250328));

    const schedule = Schedule.createOffDrag(dayjs(String(20250330)), null, new Chronos(9), new Chronos(19));

    const events = [

        new Event({
            name: "Date, start, end time",
            start_time: String(9),
            end_time: String(10),
            date: 20250330
        }, true),
        new Event({
            name: "Single Day",
            date: 20250330,
            end_date: 20250330
        }, true),
        new Event({
            name: "Multi-Day",
            date: 20250330,
            end_date: 20250401
        }, true),
        new Event({
            name: "Scheduled",
            schedules: [schedule.eject()]
        }, true)
    ];

    for (const event of events) {
        day.add(event);
    }

    expect(1).toBe(1);
});


test('poly'), () => {
    const days = new CalendarDays<CalendarDayRendered>(dayjs(), dayjs().add(1, 'year'), (x) => new CalendarDayRendered(x));
    const schedule = Schedule.createOffDrag(dayjs(String(20250330)), null, new Chronos(9), new Chronos(19));
    const events = [

        new Event({
            name: "Date, start, end time",
            start_time: String(9),
            end_time: String(10),
            date: 20250330
        }, true),
        new Event({
            name: "Single Day",
            date: 20250330,
            end_date: 20250330
        }, true),
        new Event({
            name: "Multi-Day",
            date: 20250330,
            end_date: 20250401
        }, true),
        new Event({
            name: "Scheduled",
            schedules: [schedule.eject()]
        }, true)
    ];

    for (const event of events) {
        days.add(event);
    }


}