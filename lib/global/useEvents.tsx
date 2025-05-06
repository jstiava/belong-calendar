"use client"
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Event, EventData, Member, Events, Junction, JunctionStatus, MemberFactory } from '@/schema';
import { Type } from "@/types/globals"
import { Dayjs } from 'dayjs';
import { UseBase } from './useBase';
import { UseCalendar } from '../useCalendar';
import { CalendarDays } from '../CalendarDays';
import CalendarDay from '../CalendarDay';
import Fuse from 'fuse.js';


export interface UseEvents {
  loading: boolean;

  /**
   * Map of all active days in the frame. Rendered to visual.
   */
  days: CalendarDays<CalendarDay> | null;
  events: Event[] | null;
  add: (newEvent: EventData | EventData[]) => Promise<void>;
  get(target: string, date?: number, localOnly?: boolean): Promise<Event | null>;
  get(target: string[], date?: number, localOnly?: boolean): Promise<Event[] | null>;
  remove(target: Event): Promise<void>;
  remove(target: Event[]): Promise<void>;
  search(query: string): Event[];
  isPresent: (item: string) => boolean;
  reload: () => Promise<void>;
  update: (target: EventData) => Promise<void>;
  debug: () => any;

  /**
   * Add the event to state and update days
   * @param target 
   * @returns 
   */
  swap: (target: Event) => void;
}


export default function useEvents(
  source: Member | null,
  Calendar: UseCalendar,
  expanded: boolean = false,
): UseEvents {
  const { enqueueSnackbar } = useSnackbar();

  const [days, setDays] = useState<CalendarDays<CalendarDay> | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [cache, setCache] = useState<{ id: string, start: Dayjs | null, end: Dayjs | null }>({ id: '', start: null, end: null });
  const [eventsSearch, setEventsSearch] = useState<Fuse<Event> | null>(null)

  const debug = () => {
    return JSON.stringify({
      props: {
        source,
        expanded,
      },
      events,
      cache
    })
  }

  const search = (query: string) => {
    if (!events || !eventsSearch) {
      return events || [];
    }
    const results = eventsSearch.search(query);
    return results.map(x => x.item) || [];
  }

  useEffect(() => {
    if (!source || !Calendar || !Calendar.days || Calendar.days.length === 0) {
      console.log("No source")
      return;
    };

    const start = source instanceof Event && (source.date && source.end_date) ? source.date : Calendar.days[0].add(-1, 'week');
    let end = source instanceof Event && (source.date && source.end_date) ? source.end_date : Calendar.days[Calendar.days.length - 1].add(1, 'week');

    if (!cache || source.id() !== cache.id || !cache.start || !cache.end) {
      setCache({
        id: source.id(),
        start: start,
        end: end
      });
      getEvents(start, end)
        .then(res => {
          console.log("Setting loading to false");
        });
      return;
    }

    const needToFetch = start.isBefore(cache.start, 'D') || end.isAfter(cache.end, 'D');
    if (needToFetch) {
      setCache(prev => {
        return {
          ...prev,
          start,
          end
        }
      });
      getEvents(start, end)
        .then(res => {
          console.log("Setting loading to false");
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, Calendar.days]);

  const isPresent = (uuid: string) => {
    if (!events) {
      return false;
    }
    return events.some(x => x.id() === uuid);
  }

  const reload = async () => {
    if (!cache || !cache.start || !cache.end) {
      return;
    }
    await getEvents(cache.start, cache.end);
  }

  const swap = (target: Event) => {
    if (!source || !days) {
      enqueueSnackbar('No source or no calendar for events.', {
        variant: 'error',
      });
      return;
    }

    setEvents(prev => {
      if (!prev) return [target];
      const newList = prev.filter(x => x.id() != target.id());
      newList.push(target);
      return newList;
    })

    setDays(prev => {
      if (!prev) return null;
      const newDays = prev;
      newDays.add(target);
      newDays.version += 1;
      return newDays;
    });

  }


  const update = async (target: EventData): Promise<void> => {
    if (!source || !days) {
      enqueueSnackbar('No source or no calendar for events.', {
        variant: 'error',
      });
      return;
    }

    const localObject = new Event(target, true);
    const globalObject = new Event(target, true).globalize();

    localObject.junctions.set(source.uuid, new Junction({
      ...Junction.getHostTemplate(),
      [source.getHostColumnString()]: source.uuid,
      [source instanceof Event ? 'child_event_id' : 'event_id']: localObject.uuid,
      is_public: false,
      is_shown: true,
      status: JunctionStatus.Accepted
    }, Type.Event));

    setDays(prev => {
      if (!prev) return null;
      const newDays = prev;
      newDays.purge(localObject.uuid);
      newDays.add(localObject);
      newDays.version += 1;
      return newDays;
    });

    setEvents(prev => {
      if (!prev) return [localObject];
      const newList = prev.filter(x => x.id() != localObject.id());
      newList.push(localObject);
      return newList;
    })

    await Events.update(source, globalObject)
      .then(res => {
        enqueueSnackbar(`New event created.`, {
          variant: 'success',
        });
        return;
      })
      .catch(error => {
        enqueueSnackbar('Something went wrong.', {
          variant: 'error',
        });
        return;
      });
  }


  const add = async (newEvents: EventData | EventData[]): Promise<void> => {
    if (!source || !days) {
      enqueueSnackbar('No source or no calendar for events.', {
        variant: 'error',
      });
      return;
    }

    if (!(newEvents instanceof Array)) {
      newEvents = [newEvents];
    }

    const globals = [];
    const newDays = { ...days };

    for (const newEvent of newEvents) {
      const localObject = new Event(newEvent, true);
      const globalObject = new Event(newEvent, true).globalize();
      globals.push(globalObject);

      localObject.junctions.set(source.uuid, new Junction({
        ...Junction.getHostTemplate(),
        [source.getHostColumnString()]: source.uuid,
        [source instanceof Event ? 'child_event_id' : 'event_id']: localObject.uuid,
        is_public: false,
        is_shown: true,
        status: JunctionStatus.Accepted
      }, Type.Event));

      newDays.add(localObject);
      setEvents(prev => {
        if (!prev) return [localObject];
        const newList = prev.filter(x => x.id() != localObject.id());
        newList.push(localObject);
        return newList;
      })

    }

    newDays.version += 1;
    setDays(newDays);


    await Events.post(source, globals.map(x => x.eject()))
      .then(res => {
        enqueueSnackbar(`New event created.`, {
          variant: 'success',
        });
        return;
      })
      .catch(error => {
        enqueueSnackbar('Something went wrong.', {
          variant: 'error',
        });
        return;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };


  async function remove(target: Event): Promise<void>;
  async function remove(target: Event[]): Promise<void>;
  async function remove(target: Event | Event[],): Promise<void> {

    if (!source || !days) {
      console.log("No source exists");
      return;
    }

    if (!Array.isArray(target)) {
      target = [target];
    }

    const newDays = days;
    for (const item of target) {
      newDays.purge(item.id());
    }

    newDays.version += 1;
    setDays(newDays);

    setEvents(prev => {
      if (!prev) return target;
      const newList = prev.filter(x => {
        if (target.some(e => e.id() === x.id())) {
          return false;
        }
        return true;
      });
      return newList;
    })

    await MemberFactory.delete(source, target.map(x => x.id()), Type.Event)
      .then(res => {
        enqueueSnackbar('Deleted.', {
          variant: 'success'
        });
        return;
      })
      .catch(err => {
        enqueueSnackbar('Could not delete.', {
          variant: 'error'
        });
        return;
      })

    return;
  }


  async function get(target: string, date?: number, localOnly?: boolean): Promise<Event | null>;
  async function get(target: string[], date?: number, localOnly?: boolean): Promise<Event[] | null>;
  async function get(target: string | string[], date?: number, localOnly?: boolean): Promise<Event | Event[] | null> {
    if (!source || !days || !events) {
      throw Error("No source to get from.")
    }
    let isArray = Array.isArray(target);
    let isFound = false;

    if (!Array.isArray(target)) {
      target = [target];
    }

    let theEvents: Event[] = [];

    for (const id of target) {

      let found = events.find(e => e.id() === id);

      if (!found) {
        continue;
      }

      if (!isArray) {
        return found;
      }

      isFound = true;
      theEvents.push(found)
    }

    if (!isArray && !isFound) {
      return await Events.get(source, target[0])
        .then(theEventData => {
          if (!theEventData) {
            console.log("No event data")
            return null;
          }
          return new Event(theEventData).localize();
        })
        .catch(err => {
          console.log(err);
          console.log('Error fetching events.')
          return null;
        });

    }

    return isArray ? theEvents : theEvents.length === 0 ? null : theEvents[0];

  };



  const getEvents = async (start: Dayjs, end: Dayjs): Promise<void> => {
    if (!source) {
      console.log("No source for fetch");
      return;
    };

    await Events.fetch(source, start, end, expanded)
      .then(async (res) => {
        setCache(prev => { return { ...prev, id: source.id() } });

        const eventsArray: Event[] = [];
        const theCalDays = new CalendarDays(start, end, (x: number) => new CalendarDay(x));

        const eventObjects = res.events.map((e) => {
          const newEvent = new Event(e).localize();
          const member = newEvent.junctions.get(source.id());
          return newEvent;
        }).sort(Events.sortByTime);

        for (const event of eventObjects) {
          try {
            const member = event.junctions.get(source.id());
            theCalDays.add(event);
            eventsArray.push(event);
          }
          catch (err) {
            console.log(err);
            console.log(`Cannot place ${event.id()}`)
          }
        };

        const options = {
          includeScore: true, // Include score in the result
          threshold: 0.3,     // Match accuracy (0 = exact, 1 = match everything)
          keys: ["name", "subtitle"]
        };
        const fuse = new Fuse(eventsArray, options);

        setEventsSearch(fuse);
        setEvents(eventsArray);
        setDays(theCalDays);

      })
      .catch(err => {
        console.log(err);
        setEvents(null);
        setDays(null);
        enqueueSnackbar("Error occured while fetching events", {
          variant: "error"
        })
        return;
      })
  }



  return useMemo(() => {
    return {
      loading: !events || !days || !source,
      days,
      get,
      add,
      swap,
      remove,
      events,
      isPresent,
      reload,
      update,
      debug,
      search
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache, events, days, source]);
}
