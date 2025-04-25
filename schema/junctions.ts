
import { Group, Profile } from '@/schema';
import { Type } from '@/types/globals';
import { v4 as uuidv4 } from 'uuid';


export enum JunctionStatus {
  Accepted = 'accepted',
  Requested = 'requested',
  Denied = 'denied',
  Invited = 'invited',
}


export type AttendeeData = any;


export interface HostFactors {
  status?: JunctionStatus,
  is_public?: boolean,
  is_expanded?: boolean,
  is_shown?: boolean
}


export type Membership = any;
export type HostData = any;

export type JunctionTables = any;




export type ProfileMembershipData = {
  membership: Membership;
  type?: Type;
}


export const getType = (item: any): Type | null => {
  if (item instanceof Event) {
    return Type.Event;
  }
  else if (item instanceof Profile) {
    return Type.Profile;
  }
  else if (item instanceof Group) {
    return Type.Group;
  }
  else if (item instanceof Location) {
    return Type.Location;
  }
  else {
    return null;
  }
}


export interface Pointer {
  type: Type,
  value: string
}

export type Directionalities = "bidirectional" | "from_group_to" | "from_profile_to" | "from_event_to" | "from_location_to" | "from_cert_to" | "from_child_event_to" | "from_child_group_to" | "from_child_location_to";

export function typeToField(type: Type) {
  return `${type.toLowerCase()}_id`
}

export function typeToDirectionality(type: Type, isChild = false): Directionalities {
  return `from_${isChild ? 'child_' : ''}${type.toLowerCase()}_to` as Directionalities
}

export function directionalityToType(directionality: Directionalities): Type {
  const trimmed = directionality.slice(5, -3);
  if (trimmed === 'child_event') {
    return Type.Event;
  }
  if (trimmed === 'child_location') {
    return Type.Location;
  }
  const result = (trimmed[0].toUpperCase() + trimmed.slice(1)) as Type;
  return result
}

export interface JunctionStub {
  uuid: string,
  type: Type,
  column: string,
  directionality: Directionalities
}



export type JunctionData = HostData & Membership & AttendeeData;


export class Junction {

  uuid!: string;
  group_id!: string | null;
  profile_id!: string | null;
  location_id!: string | null;
  event_id!: string | null;
  child_event_id!: string | null;
  certificate_id!: string | null;
  certificate_wild_card!: boolean;
  directionality!: string;
  status!: JunctionStatus;
  order_index?: number | null;
  is_shown?: boolean;
  is_public?: boolean;
  created_on?: Date;
  last_updated_on?: Date;
  sync_token?: string | null;

  // Not real fields, these are related to the current IAM protocols
  a_uuid?: string | null;
  a_profile_id?: string | null;
  a_cert_wild_card?: boolean | null;
  a_cert_id?: string | null;

  from: JunctionStub;
  to!: JunctionStub;

  eject(): JunctionData {
    const { from, to, ...data } = this as Partial<Record<string, any>>;

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    });

    return data as unknown as JunctionData;
  }

  static getMembershipTemplate = (key?: string, parent?: Pointer, child?: Pointer, directionIsParentToChild = true): Membership => {

    const preset: Membership = {
      uuid: key || String(uuidv4()),
      group_id: null,
      profile_id: null,
      location_id: null,
      child_location_id: null,
      child_group_id: null,
      certificate_id: null,
      certificate_wild_card: false,
      directionality: null,
      status: 'accepted',
      created_on: new Date(),
      last_updated_on: new Date(),
      is_expanded: false,
      is_shown: false
    }

    if (!parent || !child) {
      return preset;
    }

    return {
      ...preset,
      [typeToField(parent.type)]: parent.value,
      [parent.type === child.type ? `child_${typeToField(child.type)}` : typeToField(child.type)]: child.value,
      directionality: directionIsParentToChild ? typeToDirectionality(parent.type) : typeToDirectionality(child.type, parent.type === child.type)
    }
  }

  static getHostTemplate = (key?: string | null, parent?: Pointer, child?: Pointer, directionIsParentToChild = true): HostData => {

    const preset = {
      uuid: key || String(uuidv4()),
      group_id: null,
      child_event_id: null,
      event_id: null,
      location_id: null,
      certificate_id: null,
      certificate_wild_card: false,
      directionality: null,
      status: undefined,
      is_public: undefined,
      is_expanded: undefined,
      order_index: undefined,
      is_shown: undefined,
      created_on: undefined,
      last_updated_on: undefined,
      sync_token: undefined
    }

    if (!parent || !child) {
      return preset;
    }

    return {
      ...preset,
      [typeToField(parent.type)]: parent.value,
      [parent.type === child.type ? `child_${typeToField(child.type)}` : typeToField(child.type)]: child.value,
      directionality: directionIsParentToChild ? typeToDirectionality(parent.type) : typeToDirectionality(child.type, parent.type === child.type)
    }
  }

  static getAttendeeTemplate = (key?: string | null, profile_id?: string, event_id?: string, directionIsProfileToEvent = true): AttendeeData => {

    const preset = {
      uuid: key || String(uuidv4()),
      event_id: null,
      profile_id: null,
      status: "accepted",
      message: "Added by me",
      created_on: new Date(),
      last_updated_on: new Date(),
      attendee_type: 'accepted',
      is_expanded: false,
      directionality: null,
      certificate_id: null,
      certificate_wild_card: false,
    }

    if (!profile_id || !event_id) {
      return preset;
    }

    return {
      ...preset,
      profile_id,
      event_id,
      directionality: directionIsProfileToEvent ? 'from_profile_to' : 'from_event_to'
    }
  }

  constructor(item: (HostData | Membership | AttendeeData) & { [key: string]: any }, excludeType: Type) {
    Object.assign(this, item);

    this.from = {
      uuid: item[typeToField(excludeType)],
      type: excludeType,
      column: typeToField(excludeType),
      directionality: item.directionality
    }

    if ((item.group_id && excludeType != Type.Group) || item.child_group_id) {

      this.to = {
        uuid: item.group_id,
        type: Type.Group,
        column: 'group_id',
        directionality: 'from_group_to'
      };

      if (item.child_group_id) {
        this.from = {
          uuid: (item as Membership).child_group_id,
          type: Type.Group,
          column: 'child_group_id',
          directionality: 'from_child_group_to'
        }
      }

    }
    else if (item.location_id && excludeType != Type.Location) {
      this.to = {
        uuid: item.location_id,
        type: Type.Location,
        column: 'location_id',
        directionality: 'from_location_to'
      };
    }
    else if (item.profile_id && excludeType != Type.Profile) {
      this.to = {
        uuid: item.profile_id,
        type: Type.Profile,
        column: 'profile_id',
        directionality: 'from_profile_to'
      };
    }
    else if ((item as HostData).event_id) {

      this.to = {
        uuid: (item as HostData).event_id,
        type: Type.Event,
        column: 'event_id',
        directionality: 'from_event_to'
      }
      if (item.child_event_id) {
        this.from = {
          uuid: (item as HostData).child_event_id,
          type: Type.Event,
          column: 'child_event_id',
          directionality: 'from_child_event_to'
        }
      }
    }
    return this;
  }
}
