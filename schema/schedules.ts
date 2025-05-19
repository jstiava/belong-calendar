import { Event } from './events';
import dayjs, { Dayjs } from 'dayjs';
import { DAYS, getDayIndex, getDayString, Hours, incrementDay } from '@/lib/utils/medici';
import Chronos from '@/lib/utils/chronos';
import { v4 as uuidv4 } from 'uuid';
import { Junction } from './junctions';
import { Type } from '@/types/globals';
import { Member } from '.';

export enum ScheduleType {
    Regular = "regular",
    Special = "special",
    Closure = "closure"
}

type HoursStub = { min: number; breaks: number[]; max: number }

export type HoursData = {
    min: number,
    max: number,
    breaks: number[]
}

export type ScheduleData = any & {
    metadata?: any;
    is_local?: boolean;
}

export class Schedule implements Member {
    uuid!: string;
    name!: string;
    start_date!: Dayjs | null;
    end_date!: Dayjs | null;
    schedule_type!: string;
    as_text!: string | null;
    days!: number[];
    hours!: Hours[];
    theme_color!: null;
    type!: Type;
    metadata!: any;

    junctions!: Map<string, Junction>; // USELESS

    is_local!: boolean;
    event_id!: string | null;
    location_id!: string | null;

    id(): string {
        return this.uuid;
    }

    getHostColumnString() {
        return 'schedule_id';
    }

    getType() {
        return Type.Schedule;
    }

    login() {
        return null;
    }

    getItem() {
        return this;
    }

    // Unlike other Member classes, schedule's connectTo affects the instance pointers
    connectTo(other: Member) {
        if (other instanceof Event) {
            this.event_id = other.id();
            return null;
        }

        if (other instanceof Location) {
            this.location_id = other.id();
            return null;
        }
    }

    getIconPath() {
        return null;
    }

    acquire = async () => {
        return false;
    }

    isOpenDaily = () => {
        for (const day of this.days) {
            if (day != 1) {
                return false;
            }
        }
        return true;
    }

    getActiveDaysPerWeek(): number {
        let value = 0;
        this.days.forEach((day, index) => {
            if (day != 0) {
                value += 1;
            }
        })
        return value;
    }

    getHoursPerWeek(): number {

        let value = 0;

        this.days.forEach((day, index) => {
            const hour = this.getHours(index, new Chronos(12));
            if (typeof hour === 'boolean') {
                value += hour ? 24 : 0;
            }
            else {
                value += hour.getNumberOfHours();
            }

        })

        return value;
    }

    isNotRegular(): boolean {
        return this.schedule_type ? this.schedule_type != 'regular' : false;
    }

    // TODO
    localize(): Schedule {
        return this;
    }

    // TODO
    globalize(): Schedule {
        return this;
    }

    getToken() {
        return null;
    }

    to_string(): string {

        let result = "";
        let pointer: number = 1;
        let active = this.days[0];
        let daysString = getDayString(DAYS.SUNDAY);

        while (pointer < 8) {

            if (active != this.days[pointer] || pointer === 7) {
                const endDayString = getDayString(pointer - 1);
                if (daysString === "Sun" && pointer === 7) {
                    result += 'Daily';
                }
                else if (daysString != endDayString) {
                    result += `${daysString}-${endDayString}`
                }
                else {
                    result += daysString;
                }

                if (active === 0) {
                    result += `: Closed\n`;
                }
                else if (active === 1) {
                    result += `: Open\n`;
                }
                else {
                    console.log({
                        result, pointer, active, daysString, endDayString
                    })
                    result += `: ${this.hours[active - Hours.HOURS_LOCATOR_PREFIX].to_string()}\n`;
                }

                daysString = getDayString(pointer);
                active = this.days[pointer];
            }

            pointer += 1;
        }

        return result;
    }



    copy(hoursAndDaysOnly: boolean = false): ScheduleData | any {
        return this.eject(hoursAndDaysOnly);
    }


    eject(hoursAndDaysOnly: boolean = false): ScheduleData | any {
        let serial: any = {};
        const { is_local, ...data } = this as Partial<Record<string, any>>;

        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'function') {
                delete data[key];
            }
        });

        Object.assign(serial, data);

        if (!serial) {
            throw Error;
        }

        if (hoursAndDaysOnly) {
            return {
                days: [...serial.days],
                hours: this.hours ? [...this.hours.map((r) => {
                    return r.eject()
                })] : null,
            }
        }

        return {
            ...serial,
            start_date: serial.start_date ? serial.start_date.yyyymmdd() : null,
            end_date: serial.end_date ? serial.end_date.yyyymmdd() : null,
            days: [...serial.days],
            hours: this.hours ? [...this.hours.map((r) => {
                return r.eject()
            })] : null,
        } as ScheduleData
    }

    static rank(schedules: (Schedule | ScheduleData)[]): (Schedule | ScheduleData)[] {

        const copy = schedules;
        copy.sort((a, b) => {

            try {
                if (!a.start_date || !b.start_date) {
                    return 0
                }


                let a_start = a instanceof Schedule ? a.start_date.yyyymmdd() : b.start_date as number;
                let b_start = b instanceof Schedule ? b.start_date.yyyymmdd() : b.start_date as number;

                if (!a.end_date || !b.end_date) {
                    if (!b.end_date) {
                        return a_start > b_start ? -1 : 1;
                    }
                    return 1;
                }

                let a_end = a instanceof Schedule ? a.end_date.yyyymmdd() : b.end_date as number;
                let b_end = b instanceof Schedule ? b.end_date.yyyymmdd() : b.end_date as number;

                return (a_end - a_start) - (b_end - b_start);

            }
            catch (err) {
                return 0;
            }
        });
        return copy;
    }


    /**
     * 
     * @param day 
     * @returns 
     */
    removeHoursOnDay(day: string | number) {
        const pointer = typeof day === "number" ? day : getDayIndex(day);
        if (pointer == -1) {
            throw Error("Can't find date that matches");
        }

        const copy = this.days[pointer];
        this.days[pointer] = Hours.CLOSED;

        if (copy < 2) {
            // Closed or open
            return;
        }

        let count = 0;
        for (const day of this.days) {
            if (day === copy) {
                count += 1;
            }
        }

        if (count === 0) {
            for (let i = 0; i < this.days.length; i++) {
                if (this.days[i] > copy) {
                    this.days[i] -= 1;
                }
            }
            this.hours.splice(copy - 2, 1);
        }
        return;
    }

    /**
     * e.g. Replace Tue's schedule with '8am-7pm' as Hours,
     * has residual effects
     * @param day 
     * @param newHours 
     * @returns 
     */
    replaceHoursOnDayWith(day: string | number, newHours: Hours | boolean) {

        const pointer = typeof day === "number" ? day : getDayIndex(day);
        if (pointer == -1) {
            throw Error("Can't find date that matches");
        }

        const hoursOfDayPointer = this.days[pointer];

        if (typeof newHours === "boolean") {
            if (hoursOfDayPointer === Hours.OPEN || hoursOfDayPointer === Hours.CLOSED) {
                this.days[pointer] = newHours ? Hours.OPEN : Hours.CLOSED;
                return;
            }
            if (hoursOfDayPointer > Hours.OPEN) {
                const count = this.days.filter(d => d === hoursOfDayPointer).length;
                if (count <= 1) {
                    this.removeHoursOnDay(day);
                }
            }
            return;
        }

        if (hoursOfDayPointer > Hours.OPEN) {
            const count = this.days.filter(d => d === hoursOfDayPointer).length;
            if (count <= 1) {
                this.removeHoursOnDay(day);
            }
        }
        const index = this.hours.push(newHours) - 1;
        this.days[pointer] = index + Hours.HOURS_LOCATOR_PREFIX;

    }

    getHours(day: string | number = dayjs().day(), time: Chronos = new Chronos(12)): boolean | Hours {
        const pointer = typeof day === "number" ? day : getDayIndex(day);
        if (pointer == -1) {
            throw Error("Can't find date that matches");
        }

        // Evaluate prev date overlap
        if (time.getAMP() === 'AM') {
            const yesturdayPointer = pointer === 0 ? 6 : pointer - 1;
            const hoursOfYesturdayPointer = this.days[yesturdayPointer];
            if (hoursOfYesturdayPointer > 1) {
                const hoursOfYstrday = this.hours[hoursOfYesturdayPointer - Hours.HOURS_LOCATOR_PREFIX];
                if (hoursOfYstrday.isOpen(time.add(24, false))) {
                    return hoursOfYstrday
                }
            }
        }

        const hoursOfDayPointer = this.days[pointer];
        if (hoursOfDayPointer === Hours.OPEN) {
            return true;
        }
        if (hoursOfDayPointer === Hours.CLOSED) {
            return false;
        }
        const hoursOfDay = this.hours[hoursOfDayPointer - Hours.HOURS_LOCATOR_PREFIX];
        return hoursOfDay;
    }

    // Lacks specificity
    getNextOccurance(day: Dayjs = dayjs()): { date: Dayjs, start_time: Chronos | null } | null {
        let count = 0;
        for (let pointer = day; count < 8; count++) {
            const hoursOfDayPointer = this.days[pointer.day()];

            if (hoursOfDayPointer === Hours.OPEN) {
                return {
                    date: pointer,
                    start_time: null
                }
            }

            if (hoursOfDayPointer === Hours.CLOSED) {
                continue;
            }

            const hoursOfDay = this.hours[hoursOfDayPointer - Hours.HOURS_LOCATOR_PREFIX];
            return {
                date: pointer,
                start_time: hoursOfDay.getMin()
            };
        }

        return null;
    }

    isOpen(day: string | number = dayjs().day(), time: Chronos = dayjs().toLocalChronos()): boolean {
        let pointer = null;

        pointer = typeof day === 'string' ? getDayIndex(day) : day as number;

        if (pointer == -1) {
            throw Error("Can't find date that matches");
        }

        // Evaluate prev date overlap
        if (time.getAMP() === 'AM') {
            const yesturdayPointer = pointer === 0 ? 6 : pointer - 1;
            const hoursOfYesturdayPointer = this.days[yesturdayPointer];
            if (hoursOfYesturdayPointer > 1) {
                const hoursOfYstrday = this.hours[hoursOfYesturdayPointer - Hours.HOURS_LOCATOR_PREFIX];
                if (hoursOfYstrday.isOpen(time.add(24, false))) {
                    return true;
                }
            }
        }

        // Evaluate same date
        const hoursOfDayPointer = this.days[pointer];
        if (hoursOfDayPointer === Hours.OPEN) return true;
        if (hoursOfDayPointer === Hours.CLOSED) return false;
        const hoursOfDay = this.hours[hoursOfDayPointer - Hours.HOURS_LOCATOR_PREFIX];
        return hoursOfDay.isOpen(time);
    }

    print(day: string | number): string {
        let pointer = null;

        pointer = typeof day === 'string' ? getDayIndex(day) : day as number;
        if (pointer == -1) {
            // throw Error("Can't find date that matches");
            return "No Hours / Closed"
        }

        const hoursOfDayPointer = this.days[pointer];

        if (hoursOfDayPointer === Hours.OPEN) {
            return "Open 24/7"
        }

        if (hoursOfDayPointer === Hours.CLOSED) {
            return "Closed"
        }

        const hoursOfDay = this.hours[hoursOfDayPointer - Hours.HOURS_LOCATOR_PREFIX];
        return hoursOfDay.to_string();
    }

    isOpenWithContext(day: string | number = dayjs().day(), time: Chronos = new Chronos()): { isOpen: boolean, context: string } {
        let pointer = null;

        if (typeof day === "string") {
            pointer = getDayIndex(day)
        }
        else {
            pointer = day as number;
        }

        if (pointer == -1) {
            return {
                isOpen: false,
                context: "No Hours"
            };
        }
        // Evaluate prev date overlap
        if (time.getAMP() === 'AM') {
            const yesturdayPointer = pointer === 0 ? 7 : pointer - 1;
            const hoursOfYesturdayPointer = this.days[yesturdayPointer];
            if (hoursOfYesturdayPointer > 1) {
                const hoursOfYstrday = this.hours[hoursOfYesturdayPointer - Hours.HOURS_LOCATOR_PREFIX];
                if (hoursOfYstrday.isOpen(time.add(24, false))) {
                    return hoursOfYstrday.isOpenWithContext(time.add(24, false));
                }
            }
        }

        const hoursOfDayPointer = this.days[pointer];

        if (hoursOfDayPointer === Hours.OPEN) {
            return {
                isOpen: true,
                context: "Open All Day"
            };
        }

        if (hoursOfDayPointer === Hours.CLOSED) {
            return {
                isOpen: false,
                context: "Closed"
            };
        }


        try {
            const hoursOfDay = this.hours[hoursOfDayPointer - Hours.HOURS_LOCATOR_PREFIX];
            return hoursOfDay.isOpenWithContext(time);
        }
        catch (err) {
            return {
                isOpen: false,
                context: "Closed."
            };
        }
    }

    /**
     * Write on this.days from pointer to goto.
     * @param pointer day index (0, 7)
     * @param goto day index (0, 7)
     * @param value 0 closed, 1 open, ...a position in the hours array - 2
     * @example (1, 2, 3) => this.days = [x, 3, 3, x, x, x, x]
     * @returns (1, 3, 3) => 2
     */
    private writeAndMovePointer = (pointer: number, goto: number, value: number): number => {
        this.days[pointer] = value;
        while (pointer !== goto) {
            pointer = incrementDay(pointer);
            this.days[pointer] = value;
        }
        return pointer;
    };



    private spreadHoursMappingIntoDays = (text: string, value: number): void => {

        let pointer = DAYS.SUNDAY;
        let writeMode = false;
        const daysScheduleRegex = new RegExp(Hours.DAY_PATTERN, 'ig');
        const matches = [...text.matchAll(daysScheduleRegex)];
        for (const match of matches) {
            const isComma = match[Hours.ISOLATED_COMMA_IN_PATTERN];
            const day = getDayIndex(match[Hours.ISOLATED_DAY_IN_PATTERN]);
            if (day === -1) {
                console.log('Could not find date', match[Hours.ISOLATED_DAY_IN_PATTERN]);
                return;
            }
            if (day === 7) {
                pointer = this.writeAndMovePointer(pointer, 6, value);
                writeMode = true;
                continue;
            }
            if (!writeMode) {
                pointer = day;
                writeMode = true;
            }
            if (isComma) {
                pointer = this.writeAndMovePointer(pointer, day, value);
                writeMode = false;
                continue;
            }
            pointer = this.writeAndMovePointer(pointer, day, value);
        }
        return;
    };

    getStringForDay = (day: number) => {
        const theHours = this.getHours(day, new Chronos(12));

        if (typeof theHours === "boolean") {
            return theHours ? "Open 24/7" : "Closed";
        }
        return theHours.as_text;
    }

    mask = (other: { start_time: Chronos, end_time: Chronos, dow: number }) => {
        const hours = this.getHours(other.dow);
        const theMask = new Hours(other.start_time.getHMN(), other.end_time.getHMN());

        if (typeof hours === 'boolean') {
            this.replaceHoursOnDayWith(other.dow, theMask);
            return;
        }

        this.replaceHoursOnDayWith(other.dow, theMask.union(hours));
        return;
    }

    unmask = (other: { start_time: Chronos, end_time: Chronos, dow: number }) => {
        const hours = this.getHours(other.dow);
        const theMask = new Hours(other.start_time.getHMN(), other.end_time.getHMN());

        if (typeof hours === 'boolean') {
            this.replaceHoursOnDayWith(other.dow, theMask);
            return;
        }

        this.replaceHoursOnDayWith(other.dow, hours.subtract(other));
        return;
    }


    add = (other: { start_time: Chronos, end_time: Chronos, date: Dayjs, end_date?: Dayjs | null }, subtract = false): Schedule => {
        const copy = new Schedule({
            ...this.eject(),
            uuid: String(uuidv4()),
            name: "Close Early",
        })

        if (!other.start_time || !other.end_time || !other.date) {
            throw Error("Need start and end timing and at least one date.")
        }

        if (copy.schedule_type === ScheduleType.Closure) {
            return copy;
        }

        const hours = copy.getHours(other.date.day(), other.start_time);

        if (hours instanceof Array) {
            return copy;
        }
        if (typeof hours === 'boolean') {
            return copy;
        }

        const newHours = subtract ? hours.subtract(other) : hours.add(other);
        console.log({
            hours,
            other,
            newHours
        })

        if (!newHours) {
            throw Error("Could not create new hours.")
        }

        copy.replaceHoursOnDayWith(other.date.day(), newHours);
        copy.start_date = other.date;
        copy.end_date = other.date;
        copy.schedule_type = 'special';
        return copy;
    }

    subtract = (other: { start_time: Chronos, end_time: Chronos, date: Dayjs, end_date?: Dayjs | null }): Schedule => {
        return this.add(other, true);
    };


    union = (other: Schedule | Event): Schedule => {

        if (other instanceof Event) {

            if (!other.date || !other.start_time || !other.end_time) {
                throw Error("Usage. Need a date, start and end time.")
            }
            other = Schedule.createOffDrag(other.date, other.end_date, other.start_time, other.end_time)
        }

        const result = new Schedule();
        let hoursIndex = 2;
        let resultHours = null;

        for (const day of [0, 1, 2, 3, 4, 5, 6]) {
            const ours = this.days[day];
            const theirs = other.days[day];
            if (ours === Hours.OPEN || theirs === Hours.OPEN) {
                result.days[day] = Hours.OPEN
                continue;
            }
            if (ours === Hours.CLOSED && theirs === Hours.CLOSED) {
                result.days[day] = Hours.CLOSED
                continue;
            }

            if (!other.getHours(day)) {
                resultHours = this.getHours(day);
            }
            else if (this.getHours(day)) {
                resultHours = (this.getHours(day) as Hours).union((other.getHours(day) as Hours));

                if (!resultHours) {
                    console.log("Could not merge hours.")
                    continue;
                }
            }

            if (!resultHours || typeof resultHours === "boolean") {
                console.log("No result hours")
                continue;
            }

            if (hoursIndex > 2 && resultHours.isEqual(result.hours[result.hours.length - 1])) {
                result.days[day] = hoursIndex - 1;
                console.log({
                    message: "Equal",
                    result: resultHours.to_string(),
                    lastHours: result.hours[result.hours.length - 1].to_string(),
                })
                continue;
            }

            console.log({
                message: "Not equal",
                result: resultHours.to_string(),
                lastHours: hoursIndex > 2 ? result.hours[result.hours.length - 1].to_string() : "first placement",
            })

            result.hours.push(resultHours);
            result.days[day] = hoursIndex;
            hoursIndex += 1;

        }

        result.as_text = result.toString();
        result.start_date = result.start_date || dayjs();
        return result;
    }

    constructor()
    constructor(data: Partial<ScheduleData>, is_local?: boolean)
    constructor(data: Schedule, is_local?: boolean)
    constructor(data?: Schedule | Partial<ScheduleData>, is_local: boolean = false) {

        this.junctions = new Map();
        this.metadata = {};
        this.theme_color = null;
        this.type = Type.Schedule;
        this.days = [0, 0, 0, 0, 0, 0, 0];

        if (arguments.length === 0) {
            this.uuid = String(uuidv4())
            this.as_text = 'placeholder';
            this.name = 'Regular Hours';
            this.schedule_type = "regular";
            this.start_date = null;
            this.end_date = null;
            this.hours = []
            this.is_local = true;
            return;
        }

        if (!data) {
            throw Error("Need an arguments.")
        }

        if (data instanceof Schedule) {
            const theCopy = data.eject();
            return new Schedule(theCopy, true);
        }

        Object.assign(this, data);
        this.start_date = data.start_date ? dayjs(String(data.start_date)) : dayjs();
        this.end_date = data.end_date ? dayjs(String(data.end_date)) : null;
        this.hours = data.hours ? data.hours.map((hour: any) => {
            return new Hours(hour.min, hour.max, hour.breaks, 0);
        }) : [];
        this.is_local = is_local;

    };

    static createOffDrag = (startDate: Dayjs, endDate: Dayjs | null, startTime: Chronos, endTime: Chronos): Schedule => {
        const self = new Schedule();
        self.start_date = startDate;
        self.end_date = endDate;

        const start_date_index = startDate.get('day');
        const diff = endDate ? endDate.diff(startDate, 'day') : 7;

        let pointer = start_date_index;
        for (let counter = 0; counter <= diff; counter += 1) {
            self.days[pointer] = Hours.HOURS_LOCATOR_PREFIX;
            pointer = incrementDay(pointer);
        }

        try {
            const newHours = new Hours(startTime.getHMN(), endTime.getHMN());
            self.hours.push(newHours);
            self.as_text = self.to_string();
        }
        catch (err) {
            console.log({
                message: "Error while creating",
                startTime,
                endTime,
                err
            })
        }

        return self;
    }

    static create = (name: string, type: string, rawString: string, startDate: Dayjs, endDate?: Dayjs | null) => {
        const self = new Schedule();
        self.name = name;
        self.schedule_type = type;
        self.as_text = rawString;
        self.days = [0, 0, 0, 0, 0, 0, 0];
        self.hours = [];
        self.start_date = startDate;
        self.end_date = endDate || null;
        const combinedScheduleRegex = new RegExp(Hours.COMBINED_SCHEDULE_SPLIT_PATTERN, 'gi');
        const matches = [...rawString.matchAll(combinedScheduleRegex)];

        if (self.schedule_type === ScheduleType.Closure) {
            return self;
        }

        if (!matches) throw Error('No matches found.');
        for (const match of matches) {
            if (!match.groups || !match.groups.times || !match.groups.days) continue;
            try {
                if (match.groups.times.includes('Open')) {
                    self.spreadHoursMappingIntoDays(match.groups.days, Hours.OPEN);
                    continue;
                }
                if (match.groups.times.includes('Closed')) {
                    self.spreadHoursMappingIntoDays(match.groups.days, Hours.CLOSED);
                    continue;
                }
                self.hours.push(new Hours(match.groups.times));
                self.spreadHoursMappingIntoDays(
                    match.groups.days,
                    Hours.HOURS_LOCATOR_PREFIX + self.hours.length - 1,
                );
            } catch (err) {
                console.log(err);
            }
        }

        return self;
    }

}
