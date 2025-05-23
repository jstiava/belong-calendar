"use client"
import { useEffect, useState } from 'react';
import axios, { API } from '../utils/axios';
import { enqueueSnackbar } from 'notistack';
import { Group, Event, Location, Member, Locations, LocationData, Junction, JunctionStatus, MemberFactory } from '@/schema';
import dayjs from '../utils/dayjs';
import Chronos from '../utils/chronos';
import { Dayjs } from 'dayjs';
import { Type } from '@/types/globals';

export interface UseLocations {
  loading: boolean;
  locations: Location[] | null;
  get: (uuid: string) => Promise<Location | null>;
  add: (newLocation: any) => void;
  remove(target: Location): Promise<void>;
  remove(target: Location[]): Promise<void>;
  search: (query: AdvancedLocationSearchQuery) => Promise<any[]>;
  update: (newLocation: LocationData) => Promise<any>;
}

export interface AdvancedLocationSearchQuery {
  q: string,
  date?: string,
  start_time?: number,
  end_time?: number
}

export default function useLocations(source: Member | null): UseLocations {
  
  const [cacheID, setCacheID] = useState<string>('');
  const [locations, setLocations] = useState<Location[] | null>(null);

  useEffect(() => {
    if (!source) return;
    if (source instanceof Event) {
      return;
    }
    if (source.id() !== cacheID) {

      if (source instanceof Location) {
        return;
      }
      getLocations();
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);



  const add = async (newLocation: LocationData) => {
    if (!source) {
      console.log("No source");
      return enqueueSnackbar('Something went wrong.', {
        variant: 'error',
      });
    }

    const localObject = new Location(newLocation);
    localObject.junctions.set(source.uuid, new Junction({
      ...Junction.getHostTemplate(),
      [source.getHostColumnString()]: source.uuid,
      [source instanceof Event ? 'child_event_id' : 'event_id']: localObject.uuid,
      is_public: false,
      is_shown: true,
      status: JunctionStatus.Accepted
    }, Type.Event));

    setLocations((prev: Location[] | null) => {
      if (!prev) return [localObject];
      return [...prev, localObject]
    })

    await Locations.post(source, newLocation)
      .then(res => {
        enqueueSnackbar(`New location created.`, {
          variant: 'success',
        });
      })
      .catch(error => {
        console.log(error)
        setLocations((prev: Location[] | null) => {
          if (!prev) return [];
          const filtered = prev.filter(x => x.uuid != newLocation.uuid)
          return filtered;
        })
        enqueueSnackbar('Something went wrong.', {
          variant: 'error',
        });
      });

    return;
  };


  async function get(target: string, date?: number, localOnly?: boolean): Promise<Location | null>;
  async function get(target: string[], date?: number, localOnly?: boolean): Promise<Location[] | null>;
  async function get(target: string | string[], date?: number, localOnly?: boolean): Promise<Location | Location[] | null> {
    if (!source || !locations) {
      throw Error("No source to get from.")
    }

    if (!Array.isArray(target)) {
      target = [target];
    }

    let theItems: Location[] = [];

    for (const id of target) {

      let found = locations.find(e => e.id() === id);

      if (!found) {
        enqueueSnackbar(`Could not find ${id}`, {
          variant: 'error'
        });
        continue;
      }
      theItems.push(found)
    }

    return Array.isArray(target) ? theItems : theItems.length === 0 ? null : theItems[0];
  };


  const update = async (target: LocationData): Promise<any> => {
    if (!source) {
      enqueueSnackbar('No source for locations.', {
        variant: 'error',
      });
      return;
    }

    const localObject = new Location(target);

    localObject.junctions.set(source.uuid, new Junction({
      ...Junction.getMembershipTemplate(),
      [source.getHostColumnString()]: source.uuid,
      [source instanceof Event ? 'child_location_id' : 'location_id']: localObject.uuid,
      is_public: false,
      is_shown: true,
      status: JunctionStatus.Accepted
    }, Type.Location));

    setLocations(prev => {
      if (!prev) return null;
      prev.push(localObject);
      return prev;
    });

    await Locations.update(source, localObject)
      .then(res => {
        enqueueSnackbar(`Location updated.`, {
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



  async function remove(target: Location): Promise<void>;
  async function remove(target: Location[]): Promise<void>;
  async function remove(target: Location | Location[],): Promise<void> {

    if (!source) {
      console.log("No source exists");
      return;
    }

    if (!Array.isArray(target)) {
      target = [target];
    }


    const uuidSet = new Set(target.map(x => x.id()));
    setLocations(prev => {
      return prev ? prev.filter(item => !uuidSet.has(item.item_id())) : null;
    });

    await MemberFactory.delete(source, target.map(x => x.id()), Type.Location)
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


  const search = async (query: AdvancedLocationSearchQuery): Promise<any[]> => {
    const results: any[] = [];

    if (!source || !query || !query.q || query.q === "") {
      return locations || [];
    }

    const googleMapsResults = await axios
      .post(API.SEARCH_LOCATIONS, {
        ...query,
        source: MemberFactory.getToken(source)
      })
      .then(res => {
        const places = res.data.candidates.map((item: any) => {
          return new Location(item);
        })
        return places;
      })
      .catch(error => {
        enqueueSnackbar('Location search failed.', {
          variant: 'error',
        });
        return [];
      });

    results.push(...googleMapsResults);
    return results;
  };


  const getLocations = async () => {
    if (!source) return;

    await Locations.fetch(source)
      .then(theLocations => {
        setCacheID(source.id());
        setLocations(theLocations);
      })
      .catch(error => {
        console.log(error);
        return enqueueSnackbar("Can't get locations", {
          variant: 'error',
        });
      });
  };

  return {
    loading: source && locations ? false : true,
    locations,
    get,
    add,
    remove,
    search,
    update
  };
}
