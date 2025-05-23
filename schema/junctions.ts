
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



export type JunctionData = Partial<HostData> & Partial<Membership> & Partial<AttendeeData>;


export class JunctionBuilder {

  private parent: Pointer | null = null;
  private child: Pointer | null = null;
  private directionality: Directionalities | null = null;
  private reverseDirectionality: Directionalities | null = null;
  private data: JunctionData = {};
  private reverse: JunctionData = {};
  private isReversed: boolean = false;

  from(target: Pointer) {
    this.parent = target;
    this.directionality = typeToDirectionality(this.parent.type);
    return this;
  }

  to(target: Pointer) {
    this.child = target;
    return this;
  }

  fromChildToParent() {
    if (!this.parent || !this.child) {
      throw Error("Must first set parent and child.")
    }
    this.isReversed = true;
    this.reverseDirectionality = typeToDirectionality(this.child.type, this.parent.type === this.child.type);
    return this;
  }

  syncWithRefreshTokenExpiry() {
    const target = this.isReversed ? this.reverse : this.data;
    target.onRefreshTokenExpiryChange = true;
    return this;
  }

  designate(value: {
    id?: string,
    type?: string,
    external_child_webhook_resource_id?: string
  }) {
    const target = this.isReversed ? this.reverse : this.data;

    if (value.id) {
      target.external_child_id = value.id;
    }

    if (value.type) {
      target.external_child_type = value.type;
    }

    if (value.external_child_webhook_resource_id) {
      target.external_child_webhook_resource_id = value.external_child_webhook_resource_id
    }
    return this;
  }

  denyAll() {
    const target = this.isReversed ? this.reverse : this.data;
    target.certificate_id = null;
    target.certificate_wild_card = false;
    return this;
  }

  allowAll() {
    const target = this.isReversed ? this.reverse : this.data;
    target.certificate_id = null;
    target.certificate_wild_card = true;
    return this;
  }

  setStatus(value: 'requested' | 'accepted') {
    const target = this.isReversed ? this.reverse : this.data;
    target.status = value;
    return this;
  }

  isPublic() {
    const target = this.isReversed ? this.reverse : this.data;
    target.is_public = true;
    return this;
  }

  isPrivate() {
    const target = this.isReversed ? this.reverse : this.data;
    target.is_public = false;
    return this;
  }

  build(type: 'hosts'): [JunctionData, JunctionData]
  build(type: 'memberships'): [Membership, Membership]
  build(type: 'hosts' | 'attendees' | 'memberships'): [any, any] {

    if (!this.parent || !this.child || !this.directionality || !this.reverseDirectionality) {
      throw Error("No parent or no child present.")
    }

    switch (type) {
      case 'hosts':
        return [
          {
            ...Junction.getHostTemplate(null, this.parent, this.child),
            directionality: this.directionality,
            ...this.data
          },
          {
            ...Junction.getHostTemplate(null, this.parent, this.child, false),
            directionality: this.reverseDirectionality,
            ...this.reverse
          }
        ];
      case 'memberships':
        return [
          {
            ...Junction.getMembershipTemplate(null, this.parent, this.child),
            directionality: this.directionality,
            ...this.data
          },
          {
            ...Junction.getMembershipTemplate(null, this.parent, this.child, false),
            directionality: this.reverseDirectionality,
            ...this.reverse
          }
        ];
      default:
        throw Error("Not implemented.")
    }
  }

}


export class Junction {

  uuid?: string;
  group_id?: string | null;
  profile_id?: string | null;
  location_id?: string | null;
  event_id?: string | null;
  child_event_id?: string | null;
  certificate_id?: string | null;
  certificate_wild_card?: boolean;
  directionality?: string;
  status?: JunctionStatus;
  order_index?: number | null;
  is_shown?: boolean;
  is_public?: boolean;
  created_on?: Date;
  last_updated_on?: Date;

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

  static toPointer = (data: {
    type: Type,
    uuid: string,
    [key: string]: any
  }): Pointer => {
    return {
      type: data.type ? data.type : Type.Group,
      value: data.uuid
    }
  }

  static inspect = (data: Partial<JunctionData>) => {

    const pretty: any = {
      metadata: {
        status: data.status,
        is_public: data.is_public,
        is_expanded: data.is_expanded,
        is_shown: data.is_shown
      }
    };

    if (data.uuid) {
      pretty.uuid = data.uuid;
    }

    if (data.group_id) pretty.group_id = data.group_id;
    if (data.event_id) pretty.event_id = data.event_id;
    if (data.child_event_id) pretty.child_event_id = data.child_event_id;
    if (data.child_group_id) pretty.child_group_id = data.child_group_id;
    if (data.location_id) pretty.location_id = data.location_id;
    if (data.child_location_id) pretty.child_location_id = data.child_location_id;


    if (data.directionality) {
      pretty.directionality = data.directionality
    }
    else {
      pretty.directionality = "NOT_SPECIFIED"
    }


    return JSON.stringify(pretty, null, 2);

  }

  static getMembershipTemplate = (key?: string | null, parent?: Pointer, child?: Pointer, directionIsParentToChild = true): Membership => {

    const preset: Membership = {
      uuid: key || String(uuidv4()),
      group_id: null,
      profile_id: null,
      location_id: null,
      child_location_id: null,
      child_group_id: null,
      certificate_id: null,
      certificate_wild_card: false,
      directionality: 'bidirectional',
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


  /**
   * 
   * @param key if null, will rekey
   * @param parent 
   * @param child 
   * @param directionIsParentToChild 
   * @returns 
   */
  static getHostTemplate = (key?: string | null, parent?: Pointer, child?: Pointer, directionIsParentToChild = true): HostData => {

    const preset = {
      uuid: key || String(uuidv4()),
      group_id: null,
      child_event_id: null,
      event_id: null,
      location_id: null,
      certificate_id: null,
      certificate_wild_card: false,
      directionality: "bidirectional" as Directionalities,
      status: "accepted" as JunctionStatus,
      is_public: false,
      is_expanded: false,
      order_index: null,
      is_shown: true,
      created_on: new Date(),
      last_updated_on: new Date(),
      external_child_id: null,
      external_child_webhook_resource_id: null,
      sync_token: null,
      onRefreshTokenExpiryChange: false
    }

    if (!parent || !child) {
      return preset;
    }

    const result = {
      ...preset,
      [typeToField(parent.type)]: parent.value,
      [parent.type === child.type ? `child_${typeToField(child.type)}` : typeToField(child.type)]: child.value,
      directionality: directionIsParentToChild ? typeToDirectionality(parent.type) : typeToDirectionality(child.type, parent.type === child.type)
    }

    if (result.event_id === result.child_event_id) {
      console.log({
        message: "Pointer is pointing to itself.",
        result,
        parent,
        child,
        directionIsParentToChild
      })
      throw Error("Pointer is pointing to itself.")
    }

    return result;
  }
  

  static resolveType = (item: (HostData | Membership) & { [key: string]: any }, excludeType: Type): {
    uuid: string,
    type: Type,
    column: string,
    directionality: "bidirectional" | "from_group_to" | "from_profile_to" | "from_event_to" | "from_location_to" | "from_cert_to" | "from_child_event_to"
  } => {
    if (item.group_id && excludeType != Type.Group) {
      return {
        uuid: item.group_id,
        type: Type.Group,
        column: 'group_id',
        directionality: 'from_group_to'
      };
    }
    else if (item.location_id && excludeType != Type.Location) {
      return {
        uuid: item.location_id,
        type: Type.Location,
        column: 'location_id',
        directionality: 'from_location_to'
      };
    }
    else if ((item as HostData).event_id) {
      return {
        uuid: (item as HostData).event_id!,
        type: Type.Event,
        column: 'event_id',
        directionality: 'from_event_to'
      }
    }

    console.log({
      item,
      excludeType
    })
    throw Error("Could not resolve type")
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
      attendee_type: null,
      is_expanded: false,
      directionality: 'bidirectional',
      certificate_id: null,
      certificate_wild_card: false,
    }

    if (!profile_id || !event_id) {
      return preset as any;
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
          uuid: item.child_group_id,
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
    else if (item.event_id) {

      this.to = {
        uuid: item.event_id,
        type: Type.Event,
        column: 'event_id',
        directionality: 'from_event_to'
      }
      if (item.child_event_id) {
        this.from = {
          uuid: item.child_event_id,
          type: Type.Event,
          column: 'child_event_id',
          directionality: 'from_child_event_to'
        }
      }
    }

    return this;
  }
}