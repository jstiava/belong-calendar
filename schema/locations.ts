import axios, { API } from '@/lib/utils/axios';
import { hashObject } from './events';
import { Profile } from './profiles';
import { Type } from '@/types/globals';
import { ImageStub } from './files';
import { Member, MemberFactory } from '.';
import { Junction, JunctionData } from './junctions';
import { v4 as uuidv4 } from "uuid";

// In MongoDB
export type LocationMetadata = {
  isFetched?: boolean | null;
  description?: string | null;
  files?: string[];
}

export type LocationData = any & {
  junctions?: JunctionData[] | null;
  metadata?: LocationMetadata,
  token?: string,
}

export enum LocationDiffSeverity {
  NoChange = 0,
  MetadataChange = 1,
  PlaceChange = 2
}

export class Locations {

  static fetch = async (source: Member): Promise<Location[]> => {
    return await axios.get(API.GET_LOCATIONS, {
      params: {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source)
      },
    })
      .then(res => {
        return res.data.locations.map((item: LocationData) => {
          return new Location(item)
        });
      })
      .catch(err => {
        throw err
      })
  }

  static post = async (source: Member, newLocation: LocationData) => {

    return await axios
      .post(API.POST_LOCATION, {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        location: newLocation
      })
      .then(res => {
        return;
      })
      .catch(error => {
        console.log(error)
        throw Error("Failed to create")
      });
  }

  static update = async (source: Member, newLocation: Location) => {
    await axios
      .patch(API.UPDATE_LOCATION, {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        uuid: newLocation.uuid,
        location: newLocation.eject(),
      })
      .then(res => {
        return;
      })
      .catch(error => {
        throw Error("Failed to create")
      })
    return;
  }

  static delete = async (source: Member, ids: string[]) => {
    return await axios
      .delete(API.DELETE_LOCATIONS, {
        data: {
          isUser: source instanceof Profile,
          locations: ids,
          source: MemberFactory.getToken(source),
        },
      })
      .then(res => {
        return;
      })
      .catch(err => {
        return;
      });
  }

  static get = async (source: Member, uuid: string): Promise<LocationData | LocationData[]> => {
    return await axios
      .get('/api/v3/locations', {
        params: {
          source: MemberFactory.getToken(source),
          uuid,
        },
      })
      .then(res => {
        return res.data.location;
      })
      .catch(err => {
        console.log(err);
        return null;
      });
  }

  static search = async (query: string, props?: any) => {
    return;
  }

  static compare = (x: Location, y: Location): LocationDiffSeverity => {
    if (x.place_id != y.place_id) {
      return LocationDiffSeverity.PlaceChange
    }
    const xHash = hashObject(x);
    const yHash = hashObject(y);
    return xHash === yHash ? LocationDiffSeverity.NoChange : LocationDiffSeverity.MetadataChange;
  }

}


export interface VectorMap {
  uuid: string,
  location_id: string,
  source_id: string,
  file: string
}

export interface VectorLayer {
  uuid: string,
  map_id: string,
  event_id: string,
  layer: string,
  left: number,
  top: number
}

export class Location implements Member {

  // PSQL
  uuid!: string;
  name!: string;
  place_name!: string | null;
  place_id!: string | null;
  address!: string | null;
  cover_img!: ImageStub | null;
  icon_img!: ImageStub | null;
  wordmark_img!: ImageStub | null;
  theme_color!: string | null;
  map!: VectorMap | null;
  type!: Type;

  // Junction tables
  junctions!: Map<string, Junction>;

  // MongoDB
  metadata!: LocationMetadata;

  // Access
  token!: string | null;

  id = () => {
    return this.uuid;
  }

  getUsername(): string {
    return this.uuid;
  }

  getHostColumnString = () => {
    return 'location_id';
  }

  getItem = () => {
    return this;
  }

  item_id = () => {
    return this.uuid
  }

  getToken = () => {
    return this.token;
  }

  getIconPath = (quick: boolean = false): string | null => {
    return null
  }

  copy = () => {
    return this.eject();
  }

  eject = (): LocationData => {
    let serial: any = {};
    const { created_on, last_updated_on, ...data } = this as Partial<Record<string, any>>;

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    });

    Object.assign(serial, data);

    return {
      ...serial,
      junctions: this.junctions ? Array.from(this.junctions.values()).map(j => j.eject()) : [],
      type: Type.Location,
    } as LocationData;
  }

  getType = () => {
    return Type.Location;
  }

  link = () => {
    return `https://www.google.com/maps/search/?api=1&query=${this.address || "none"}&query_place_id=${this.place_id}`
  }

  createLocationLink = () => {
    return `https://www.google.com/maps/search/?api=1&query=${this.address || "none"}&query_place_id=${this.place_id}`
  }

  static createLocationLink = (place_id: string, address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${address}&query_place_id=${place_id}`
  }



  constructor(item?: Partial<LocationData>) {
    this.type = Type.Location;

    if (!item) {
      this.uuid = String(uuidv4());
      this.junctions = new Map();
      return this;
    }

    this.metadata = {};
    Object.assign(this, item);
    this.uuid = item.uuid || String(uuidv4());

    this.junctions = new Map();
    if (item.junctions) {
      for (const i of item.junctions) {
        const j = new Junction(i, Type.Location);
        if (!j) {
          continue;
        }
        this.junctions.set(j.to.uuid === this.uuid ? j.from.uuid : j.to.uuid, j)
      }
    }

    return this;
  }

}