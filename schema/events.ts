import axios, { API } from '@/lib/utils/axios';
import Chronos from '@/lib/utils/chronos';
import dayjs from '@/lib/utils/dayjs';
import { ImageStub } from './files';
import { Dayjs } from 'dayjs';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Type } from '@/types/globals';
import { Hours } from '@/lib/utils/medici';
import { Member, MemberFactory } from '.';
import { HostData, Junction, HostFactors } from './junctions';
import { LocationData } from './locations';
import { ProfileData, Profile } from './profiles';
import { ScheduleData, Schedule } from './schedules';

export const hashObject = (obj: any): string => {
  return createHash('sha256')
    .update(JSON.stringify(obj))
    .digest('hex')
}


export type EventMetadata = {
  isFetched?: boolean | null;
  price?: string | null;
  event_link?: string | null;
  files?: string[] | null;
  tags?: string[] | null;
  contact_email?: string | null;
  contact_name?: string | null;
  contact_organization?: string | null;
  contact_phone?: string | null;
  isFree?: boolean | null;
  pricing_notes?: string | null;
  ticketing_link?: string | null;
  description?: string | null;
}

export type Reservation = Event | Location;
export type ReservationData = EventData | LocationData;

export type EventData = {
  uuid: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  date: number | null;
  end_date: number | null;
  location_name: string | null;
  location_address: string | null;
  location_place_id: string | null;
  end_location_name: string | null;
  end_location_address: string | null;
  end_location_place_id: string | null;
  cover_img: ImageStub | null;
  icon_img: ImageStub | null;
  wordmark_img: ImageStub | null;
  theme_color: string | null;
  search_vectors: string[] | null;
  link: string | null;
  event_type: string | null;
  created_on: any | null;
  last_updated_on: any | null;
  capacity: number | null;
  quantity: number | null;
  subtitle: string | null;
  integration: string | null;


  startDateTime?: string;
  endDateTime?: string;

  metadata?: EventMetadata;
  reservations?: ReservationData[] | null;

  location?: LocationData | null;
  end_location?: LocationData | null;

  attendees?: ProfileData[] | null;
  schedules?: ScheduleData[] | null;
  junctions?: HostData[] | null;
  is_local?: boolean;
  children?: EventData[] | null;

  version?: number;
  type?: Type;

  token?: string | null;
  collisions?: number | null;
}


export enum DiffSeverity {
  NoChange = 0,
  CoreContentChange = 1,
  ScheduleToDateTime = 2.1,
  ScheduleChange = 2.2,
  DateTimeToSchedule = 3.1,
  DateChange = 3.2,
  TimeChange = 3.3,
  PlaceChange = 4,
  MetadataChange = 5,
}

export class Events {

  static fetch = async (source: Member, start: Dayjs, end: Dayjs, detailed: boolean = false): Promise<{ message: string, events: EventData[] }> => {

    return await axios.get(`/api/v1/events`, {
      params: {
        type: source.getType(),
        id: source.id(),
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        start: start.yyyymmdd(),
        end: end.yyyymmdd(),
        detailed
      },
    })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        throw err
      })
  }

  static post = async (source: Member, values: EventData | EventData[], sharing?: any, actions?: any) => {

    if (!(values instanceof Array)) {
      values = [values];
    }

    return await axios
      .post(API.POST_EVENT, {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        events: values,
        sharing,
        actions
      })
      .then(res => {

        if (res.data.count != values.length) {
          throw Error("Not all events were created.")
        }
        return;
      })
      .catch(error => {
        throw Error;
      });
  }

  static sortByLength = (date: Dayjs, a: Event, b: Event) => {
    try {

      if (!a.date || !b.date) {
        if (!a.date) {
          if (!b.date) {
            return 0;
          }
          return 1;
        }
        return -1;
      }

      const aRange = a.end_date ? a.end_date.diff(date, 'd') : 0;
      const bRange = b.end_date ? b.end_date.diff(date, 'd') : 0;
      return bRange - aRange;
    }
    catch (err) {
      return 0;
    }
  }

  static sortByTime = (a: Event, b: Event) => {

    if (!a && !b) return 0;

    if (!a) return 1;
    if (!b) return -1;

    const aMin = a.getMin();
    const bMin = b.getMin();


    if (aMin && bMin) {
      return aMin.getHMN() - bMin.getHMN()
    }
    if (aMin) {
      return -1;
    }
    if (bMin) {
      return 1;
    }

    if (a.date || b.date) {
      return 0;
    }

    return 0;
  }

  static update = async (source: Member, newEvent: Event) => {
    console.log(newEvent);

    try {
      await axios
        .patch(API.UPDATE_EVENT, {
          isUser: source instanceof Profile,
          source: MemberFactory.getToken(source),
          uuid: newEvent.uuid,
          event: newEvent.eject(),
        })
        .then(res => {
          return;
        })
        .catch(err => {
          console.log(err);
          throw Error("Something went wrong that prevented an event update.")
        })
    }
    catch (err) {
      console.log(err);
      throw Error("Something went wrong that prevented a message to update the event.")
    }
  }

  static save = async (source: Member, event: Event, commitment: string = "save") => {
    await axios.post(API.SAVE_EVENT, {
      isUser: source instanceof Profile,
      uuid: event.uuid,
      attendee_type: commitment
    })
      .then(res => {
        return;
      })
  }

  static get = async (source: Member, id: string): Promise<EventData | null> => {
    return await axios
      .get(`/api/v1/events`, {
        params: {
          event_id: id,
          source: MemberFactory.getToken(source),
          isUser: source instanceof Profile
        },
      })
      .then(res => {
        if (!res.data.event) {
          return null;
        }
        return res.data.event;
      })
      .catch(err => {
        console.log({
          message: "Events API get",
          err
        });
        return null;
      });
  }

  static search = async (query: string, props?: any): Promise<Event[]> => {
    return await axios.get(API.SEARCH_EVENTS, {
      params: {
        q: query
      }
    })
      .then((res) => {
        let searchResults = [];
        for (const event of res.data.candidates) {
          searchResults.push(new Event(event).localize());
        }
        return searchResults;
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  }

  static compare = (target: Event, prev: Event): DiffSeverity => {

    if (!prev.date && target.date) {
      return DiffSeverity.ScheduleToDateTime;
    }

    if (prev.date && !target.date) {
      return DiffSeverity.DateTimeToSchedule;
    }

    if (!prev.end_date && target.end_date) {
      return DiffSeverity.DateTimeToSchedule;
    }

    if (prev.end_date && !target.end_date) {
      return DiffSeverity.ScheduleToDateTime;
    }

    if (prev.end_date && prev.end_date) {
      return DiffSeverity.ScheduleChange;
    }

    if (prev.date && target.date) {
      return DiffSeverity.DateChange;
    }

    if (!prev.date && !target.date) {
      return DiffSeverity.ScheduleChange
    }

    if (prev.location_place_id != target.location_place_id) {
      return DiffSeverity.PlaceChange;
    }

    return DiffSeverity.NoChange;
  }

  static dayjs(date: number, time: Chronos) {
    return dayjs(String(date)).set('hour', time.getHour()).set('minute', time.getMinute());
  }

  static union(events: (Event | null)[]): Event | null {

    if (!events) {
      return null;
    }

    console.log({
      "message": "union",
      "events": events.map(x => {
        if (!x) return null;
        return x.name;
      })
    })

    if (events.length === 1) {
      return events[0];
    }
    else if (events.length === 2) {

      if (events[0]) {
        return events[0].union(events[1]);
      }
      else if (events[1]) {
        return events[1].union(events[0]);
      }
      else {
        return null;
      }
    }
    return Events.union([Events.union(events.slice(0, events.length / 2)),
    Events.union(events.slice(events.length / 2, events.length))])
  }


}


export class Event implements Member {
  uuid!: string;
  name!: string;
  start_time!: Chronos | null;
  end_time!: Chronos | null;
  date!: Dayjs | null;
  end_date!: Dayjs | null;
  location_name!: string | null;
  location_address!: string | null;
  location_place_id!: string | null;
  end_location_name!: string | null;
  end_location_address!: string | null;
  end_location_place_id!: string | null;
  cover_img!: ImageStub | null;
  icon_img!: ImageStub | null;
  wordmark_img!: ImageStub | null;
  theme_color!: string | null;
  search_vectors!: string[] | null;
  link!: string | null;
  event_type!: string | null;
  created_on!: any | null;
  last_updated_on!: any | null;
  type!: Type;
  capacity!: number | null;
  quantity!: number | null;
  subtitle!: string | null;
  integration!: string | null;

  // Junction tables:
  junctions!: Map<string, Junction>;

  // MongoDB
  metadata: EventMetadata;

  // Assigned when creating, editing, or viewing
  isVisible!: boolean;
  location?: Location | null;
  attendees?: Profile[] | null;
  schedules?: Schedule[] | null;
  location_id?: string | null;
  children?: Event[] | null;

  // Access
  token!: string | null;

  // State
  is_local!: boolean;
  collisions!: number;
  version!: number;

  id(): string {
    return this.uuid;
  }

  getToken = () => {
    return this.token;
  }

  getItem = () => {
    return this;
  }

  getMin = () => {
    return this.start_time;
  }

  getMax = () => {
    return this.end_time;
  }

  updateHost = async (source: Member, junction: HostFactors): Promise<Event> => {
    const copy = this;
    return await axios.patch(API.CHANGE_EVENT_STATUS, {
      source: MemberFactory.getToken(this),
      uuid: this.id(),
      data: {
        junction
      },
      type: Type.Event
    })
      .then(res => {
        copy.junctions.set(source.id(), new Junction(res.data.event.junction, Type.Event));
        return copy;
      })
      .catch(err => {
        throw Error("Something went wrong.");
      })

  }

  eject_location_stub = (): LocationData => {
    return {
      uuid: String(uuidv4()),
      name: this.location_name || "",
      place_name: this.location_name || "",
      place_id: this.location_place_id || "",
      address: this.location_address || "",
      junctions: null,
      search_vectors: "",
      metadata: {},
      cover_img: null,
      icon_img: null,
      wordmark_img: null,
      theme_color: this.theme_color || null
    }
  }

  private getSerial = () => {
    let serial: any = {};
    const { token, is_local, collisions, parents, created_on, last_updated_on, ...data } = this as Partial<Record<string, any>>;

    // Delete function properties from data
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    });

    Object.assign(serial, data);
    return serial;
  }

  copy = (localize: boolean = false, reduced: boolean = false, rekey: boolean = false) => {

    const { ...data } = this as Partial<Record<string, any>>;

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    });

    return new Event({
      ...data,
      uuid: rekey ? String(uuidv4()) : data.uuid,
      start_time: data.start_time ? String(data.start_time.getHMN().toFixed(3)) : null,
      end_time: data.end_time ? String(data.end_time.getHMN().toFixed(3)) : null,
      date: data.date ? Number(data.date.yyyymmdd()) : null,
      end_date: data.end_date ? Number(data.end_date.yyyymmdd()) : null,
      junctions: this.junctions ? Array.from(this.junctions.values()) : [],
      attendees: this.attendees ? this.attendees.map((a) => a.copy()) : null,
      schedules: data.schedules ? data.schedules.map((s: Schedule) => s.copy()) : null,
      type: Type.Event
    })
  }


  eject = (localize: boolean = false, reduced: boolean = false): EventData => {

    const serial = this.getSerial();

    if (!serial) {
      throw Error;
    }

    if (localize && !this.is_local) {
      serial.start_time = this.start_time ? this.start_time.add((-1) * dayjs().getTimezoneOffsetInHours()) : null;
      serial.end_time = this.end_time ? this.end_time.add((-1) * dayjs().getTimezoneOffsetInHours()) : null;
      serial.date = this.date ? this.date.add((-1) * dayjs().getTimezoneOffsetInHours(), 'hour') : null;
      serial.end_date = this.end_date ? this.end_date.add((-1) * dayjs().getTimezoneOffsetInHours(), 'hour') : null;
    }

    try {

      return {
        ...serial,
        start_time: serial.start_time ? String(serial.start_time.getHMN().toFixed(3)) : null,
        end_time: serial.end_time ? String(serial.end_time.getHMN().toFixed(3)) : null,
        date: serial.date ? Number(serial.date.yyyymmdd()) : null,
        end_date: serial.end_date ? Number(serial.end_date.yyyymmdd()) : null,
        junctions: this.junctions ? Array.from(this.junctions.values().map(j => j.eject())) : [],
        attendees: this.attendees ? this.attendees.map((a) => a.eject()) : null,
        children: this.children ? reduced ? this.children.map(s => s.uuid) : this.children.map((s) => s.eject(localize)) : null,
        schedules: serial.schedules ? serial.schedules.map((s: Schedule) => s.eject()) : null,
        type: Type.Event,
      } as EventData
    }
    catch (err) {
      console.log(err);
      console.log(serial);
      throw Error("Error occured while ejecting the event.")
    }
  }

  getCoverImageLink(): string | null {
    return this.cover_img ? this.cover_img.path : null;
  }

  getSchedulesInFrame = (date: Dayjs = dayjs(), time: Chronos = dayjs().toLocalChronos()): Schedule[] => {
    if (!this.schedules) {
      return [];
    }

    const frame = this.schedules?.filter((x) => {

      if (!x.end_date) {
        if (x.start_date && x.start_date.isBefore(date.add(1, 'd'), 'd')) {
          return true;
        }
        return false;
      }


      if ((x.start_date && x.start_date.isBefore(date.add(1, 'd'), 'd')) && x.end_date.isAfter(date.add(-1, 'd'), 'd')) {
        return true;
      }

      return false;

    });

    return frame;
  }

  getType = () => {
    return Type.Event;
  }

  updateMembership = async (source_id: string, theHostData: HostData) => {

    await axios.patch(API.PATCH_HOST, {
      source: this.getToken(),
      host: theHostData,
      uuid: theHostData.uuid
    })
      .then(res => {
        this.junctions.delete(source_id);
        this.junctions.set(source_id, new Junction(theHostData, Type.Event));
        return true;
      })
      .catch(error => {
        console.log(error);
        return false;
      });
  }

  isOpen = (date: Dayjs = dayjs(), time: Chronos = dayjs().toLocalChronos()): boolean => {
    try {

      // Multi-date events
      if (this.date) {
        if (date.yyyymmdd() >= this.date.yyyymmdd()) {
          if (this.end_date) {
            return date.yyyymmdd() <= this.end_date.yyyymmdd();
          }
          return true;
        }
        return false;
      }

      if (!this.schedules) {
        return false;
      }

      // Yesturday may have overlap
      if (time.getAMP() === 'AM') {
        const yesturFrame = this.getSchedulesInFrame(date.add(-1, 'day'), time.add(24, false));
        if (yesturFrame && yesturFrame.length > 0 && yesturFrame[0].isOpen(date.add(-1, 'day').day(), time.add(24, false))) {
          return true;
        }
      }

      // Today
      const frame = this.getSchedulesInFrame(date, time);
      return frame[0].isOpen(date.day(), time);
    }
    catch (err) {
      return false;
    }
  }

  isOpenDetailed = (date: Dayjs = dayjs(), time: Chronos = dayjs().toLocalChronos()): { date: Dayjs, hours: Hours | boolean | null, schedule: Schedule | null, isOpen: boolean, context: string, regular: Schedule | null, lateNight: boolean, metadata: string } | null => {
    const template = {
      date,
      hours: null,
      schedule: null,
      isOpen: null,
      context: null,
      regular: null,
      lateNight: false,
      metadata: null
    }

    try {

      // Multi-date events
      if (this.date) {
        if (date.yyyymmdd() >= this.date.yyyymmdd()) {
          if (this.end_date) {
            return {
              ...template,
              isOpen: date.yyyymmdd() <= this.end_date.yyyymmdd(),
              context: "Open",
              metadata: "Multi-Day Event, after start date, no end date."
            };
          }
          return {
            ...template,
            isOpen: true,
            context: "Open",
            metadata: "Multi-Day Event, within start and end date."
          };
        }
        return {
          ...template,
          isOpen: false,
          context: "Closed",
          metadata: "Date exists, not within start and end range."
        };
      }

      if (!this.schedules) {
        return null;
      }

      if (time.getAMP() === 'AM') {
        const yesturFrame = this.getSchedulesInFrame(date.add(-1, 'day'), time.add(24, false));
        if (yesturFrame && yesturFrame.length > 0 && yesturFrame[0].isOpen(date.add(-1, 'day').day(), time.add(24, false))) {
          const yesturContext = yesturFrame[0].isOpenWithContext(date.add(-1, 'day').day(), time.add(24, false));
          return {
            date,
            hours: yesturFrame[0].getHours(date.day()),
            schedule: yesturFrame[0],
            isOpen: yesturContext.isOpen,
            context: yesturContext.context,
            regular: yesturFrame[0].isNotRegular() ? this.getRegularHours(date.add(-1, 'day')) : null,
            lateNight: true,
            metadata: "Scheduled. Case A."
          };
        }
      }

      const frame = this.getSchedulesInFrame(date, time);
      const isOpenWithContext = frame[0].isOpenWithContext(date.day(), time);
      return {
        date,
        hours: frame[0].getHours(date.day()),
        schedule: frame[0],
        isOpen: isOpenWithContext.isOpen,
        context: isOpenWithContext.context,
        regular: frame[0].isNotRegular() ? this.getRegularHours(date) : null,
        lateNight: false,
        metadata: "Scheduled. Case B."
      }
    }
    catch {
      return {
        ...template,
        isOpen: false,
        context: "Closed",
        regular: this.getRegularHours(),
        metadata: "Scheduled. Case C."
      }
    }
  }

  getAllNonRegularHours() {
    if (!this.schedules) {
      return [];
    }
    const filtered = this.schedules.filter(x => x.schedule_type != "regular");
    return filtered;
  }

  getRegularHours(date: Dayjs = dayjs()) {
    if (!this.schedules) {
      return null;
    }
    const inFrame = this.getSchedulesInFrame(date);
    return inFrame.find(x => x.schedule_type === "regular") || null;
  }

  union = (other: Event | null, date: Dayjs = dayjs()) => {

    if (!other) {
      console.log("No other")
      return this;
    }

    let result = new Event();

    // Decide on regular hours
    const ourRegularHours = this.getRegularHours(date);
    const theirRegularHours = other.getRegularHours(date);

    if (!ourRegularHours && !theirRegularHours) {
      // No regular hours to consider
      console.log({
        this: JSON.stringify(this.schedules, null, 2),
        other: JSON.stringify(other.schedules, null, 2)
      }, { depth: null })
    }
    else if (!ourRegularHours || !theirRegularHours) {
      result = !ourRegularHours ? other : this;
      // console.log({
      //   message: "One doesn't exist.",
      //   a: ourRegularHours ? ourRegularHours.to_string() : "dne",
      //   b: theirRegularHours ? theirRegularHours.to_string() : "dne",
      //   c: result ? result.getRegularHours()?.to_string() : "dne"
      // });
    }
    else {
      const unionRegularHours = ourRegularHours.union(theirRegularHours);
      // console.log({
      //   message: "After merge",
      //   a: ourRegularHours.to_string(),
      //   b: theirRegularHours.to_string(),
      //   c: unionRegularHours.to_string()
      // });
      unionRegularHours.as_text = unionRegularHours.to_string();
      result.pushSchedule(unionRegularHours);
    }


    result.name = `${this.name} and ${other.name}`
    return result;
  }

  pushSchedule(newSchedule: Schedule) {
    if (this.is_local != newSchedule.is_local) {
      this.is_local ? newSchedule.localize() : newSchedule.globalize()
    }

    if (this.schedules) {
      const schedules = this.schedules.filter(x => x.uuid != newSchedule.uuid);
      const newLength = schedules.push(newSchedule);
      if (schedules.length > 1) {
        const rankedSchedules = Schedule.rank(schedules) as Schedule[];
        console.log(rankedSchedules);
        this.schedules = rankedSchedules;
      }
      else {
        this.schedules = schedules;
      }
    }
    else {
      this.schedules = [newSchedule]
    }
  }

  connectTo(other: Member): Junction {
    const me = this.getHostColumnString();
    const their = other.getHostColumnString();

    const bothEvents = other instanceof Event;
    return new Junction({
      ...Junction.getHostTemplate(),
      [me]: this.id(),
      [bothEvents ? 'child_event_id' : their]: other.id()
    }, Type.Event)
  }


  localize(globalize = false): Event {
    if (this.is_local === !globalize) {
      return this;
    }

    this.is_local = globalize ? false : true;
    if (this.start_time) {
      this.date = this.date ? this.date.add((globalize ? -1 : 1) * dayjs().getTimezoneOffsetInHours(), 'hours') : null;
      this.end_date = this.end_date ? this.end_date.add((globalize ? -1 : 1) * dayjs().getTimezoneOffsetInHours(), 'hours') : null;
      this.start_time = this.start_time ? this.start_time.add((globalize ? -1 : 1) * dayjs().getTimezoneOffsetInHours(), false) : null;
      this.end_time = this.end_time ? this.end_time.add((globalize ? -1 : 1) * dayjs().getTimezoneOffsetInHours(), false) : null;
    }
    this.junctions && this.junctions.forEach((r) => {
      if (r instanceof Event) {
        globalize ? r.globalize() : r.localize();
      }
    });

    this.schedules && this.schedules.forEach((s) => {
      globalize ? s.globalize() : s.localize();
    });
    return this;
  }

  globalize(): Event {
    return this.localize(true);
  }


  constructor(event?: Partial<EventData>, is_local: boolean = false) {

    this.type = Type.Event;

    if (!event) {
      this.uuid = String(uuidv4());
      this.junctions = new Map();
      this.token = null;
      this.metadata = {};
      this.is_local = true;
      this.schedules = [];
      this.isVisible = false;
      this.version = 0;
      return this;
    }

    Object.assign(this, event);
    this.uuid = event.uuid || String(uuidv4());
    this.name = event.name || "";


    this.junctions = new Map();
    if (event.junctions) {
      for (const item of event.junctions) {
        const j = new Junction(item, Type.Event);
        if (!j) {
          continue;
        }
        try {
          this.junctions.set(j.to.uuid === this.uuid ? `${j.from.uuid}_${j.directionality}` : `${j.to.uuid}_${j.directionality}`, j)
        }
        catch (err) {
          console.log({
            err,
            j
          })
        }
      }
    }

    this.date = event.date ? event.start_time ? Events.dayjs(event.date, new Chronos(Number(event.start_time))) : dayjs(String(event.date)) : null;
    this.end_date = event.end_date ? dayjs(String(event.end_date)) : null;
    this.start_time = this.start_time ? new Chronos(Number(event.start_time), false) : null;
    this.end_time = this.end_time ? new Chronos(Number(event.end_time), false) : null;
    this.schedules = event.schedules && event.schedules[0] != null ? event.schedules.map((x: any) => {
      return new Schedule(x, is_local);
    }) : [];
    this.schedules = this.schedules ? Schedule.rank(this.schedules) as Schedule[] : null;

    // End Date fill in
    if (!this.start_time && (!event.schedules || event.schedules.length === 0)) {
      if (!this.end_date) {
        this.end_date = this.date;
      }
    }

    if (this.end_time) {
      this.end_date = null;
    }

    this.children = event.children?.map((e: EventData) => new Event(e, is_local)) || null;
    this.token = event.token || null;
    this.metadata = event.metadata || {};
    this.isVisible = false;
    this.is_local = is_local;
    this.collisions = 0;
    this.version = event.version || 0;
    return this;
  }

  getHostColumnString = () => {
    return 'event_id'
  }

  getIconPath = (quick?: boolean): string | null => {
    if (!this.icon_img) {
      return null;
    }
    return this.icon_img.path;
  };

}