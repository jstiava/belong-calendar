import { UseBase } from '@/lib/global/useBase';
import { UseSession } from '@/lib/global/useSession';
import axios, { API } from '@/lib/utils/axios';
import {
  AttendeeData,
  Event,
  getType,
  HostData,
  Junction,
  JunctionTables,
  Member,
  MemberFactory,
  Membership,
  Profile,
} from '@jstiava/chronos';
import { darken, lighten, useTheme } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';


export const adjustForContrast = (color: string, percentage: number, reverse: boolean = false) => {
  try {
    const theme = useTheme();
    const mode = theme.palette.mode === 'light' ? reverse ? 'dark' : 'light' : reverse ? 'light' : 'dark';
    return mode === 'light' ? lighten(color, percentage) : darken(color, percentage);
  }
  catch (err) {
    return "#ffffff";
  }
}

export function getIntegrationIcon(key: string) {

  if (key === 'github') {
    return '/github.webp'
  }
  else if (key === 'google') {
    return null
  }
  else if (key === 'strava') {
    return '/strava.png'
  }
  return null;
}




export enum Mode {
  Create = "Create",
  Modify = "Modify",
  Delete = "Delete",
  Copy = "Copy",
}



export enum Type {
  Event = "Event",
  Location = "Location",
  Profile = "Profile",
  Group = "Group",
  Custom = "Custom",
  Schedule = "Schedule"
}


export interface ImageFile {
  path: string,
  path_quick: string,
  blur_hash: string,
  display: string,
  storage: string
}



export interface AppPageProps {
  Session: UseSession & {
    session: Member,
    base: Member
  };
  Base: UseBase;
  Module: UseBase;
  module: Member | null;
  setModule: Dispatch<SetStateAction<Member>>;
  // Socket: UseSocket;
  // containerRef: React.RefObject<HTMLElement>;
}

export interface UnAuthPageProps {
  Session: UseSession;
}

export type SessionProtectedAppPageProps = Omit<AppPageProps & {
  Session: {
    session: Profile
  }
}, 'Base'>



export interface UseSocket {
  socket: any;
  isConnected: boolean;
  notifications: any[];
  ping: () => void;
  messages: any[];
  clearViewedMessages: () => void;
  rooms: string[];
}

export interface ProfileTokenDecrypted {
  uuid: string;
  username: string;
}





export class BaseService {

  static update = async (source: Member, newGroup: Member) => {
    await axios
      .patch(API.UPDATE_BASE, {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        uuid: newGroup.id(),
        newBase: newGroup.eject(),
      })
      .then(res => {
        return;
      })
  }


  static resolveParentIdentifier = (item: HostData | Membership): string | null => {

    if (item.group_id) {
      return item.group_id;
    }
    else if (item.location_id) {
      return item.location_id;
    }
    else if ((item as HostData).event_id) {
      return (item as HostData).event_id
    }
    else {
      return null;
    }
  }

  static getPartialAttendeeTemplate = (): Partial<AttendeeData> => {
    return {
      uuid: String(uuidv4()),
      status: "accepted",
      message: null,
      created_on: new Date(),
      last_updated_on: new Date(),
      attendee_type: 'save',
      is_expanded: false
    }
  }

  static iamMember = (source: Member, object: Member): Membership | null => {
    const src = source.id();
    const srcName = getType(source);
    const target = object.id();
    const targetName = getType(object);

    console.log({
      src,
      srcName,
      target,
      targetName
    })

    if (!src || !srcName || !target || !targetName) {
      return null;
    }

    const presets = Junction.getMembershipTemplate();

    return {
      ...presets,
      [`${srcName}_id`]: src,
      [`${targetName}_id`]: target
    }
  }

}




export class Base {

  uuid: string;
  membership: Membership;
  host: HostData;
  type!: Type;
  certificate!: any | null;
  certificate_wild_card!: any | null;
  certificate_id!: string | null;

  item_id() {
    return this.uuid;
  }

  getDirectionality = (): "bidirectional" | "from_group_to" | "from_profile_to" | "from_event_to" | "from_location_to" | "from_cert_to" | "from_child_event_to" => {
    switch (this.type) {
      case Type.Group:
        return "from_group_to";
      case Type.Location:
        return "from_location_to";
      case Type.Event:
        return "from_event_to";
      case Type.Profile:
        return "from_profile_to";
      // case Type.Certificate:
      //   return "from_cert_to";
      default:
        throw Error("Can't get base token type.")
    }
  }

  getHostColumnNameAsString = (): string => {
    switch (this.type) {
      case Type.Group:
        return "group_id";
      case Type.Location:
        return "location_id";
      case Type.Event:
        return "event_id";
      default:
        throw Error("Can't get base token type.")
    }
  }

  getMembershipColumnNameAsString = (): string => {
    switch (this.type) {
      case Type.Group:
        return "group_id";
      case Type.Location:
        return "location_id";
      case Type.Event:
        return "event_id";
      default:
        console.log(this);
        throw Error("Can't get base token type.")
    }
  }


  static decode(data: string) {
    const base = jwt.decode(String(data)) as any;
    if (!base) {
      throw Error("Invalid base token")
    }

    return new Base(base);
  }

  constructor(base: any) {
    this.uuid = base.uuid;
    this.membership = base.membership;
    this.host = base.host;
    this.type = base.type;
    this.certificate = base.certificate;
    this.certificate_id = base.certificate_id;
    this.certificate_wild_card = base.certificate_wild_card;
    return;

  }
}



export interface LoginProfileGuess {
  username: string;
  password: string;
}

export interface BaseMin {
  uuid: string;
  path: string;
}

export interface NewProfileRequest {
  name: string;
  nickname: string;
  username: string;
  email: string;
  password: string;
  reenterPassword: string;
}

export interface Suggestion {
  event_uuid: string;
  feedback: {
    accessibility: number;
    experience: number;
    safety: number;
    comment: string;
  };
  created_at: string;
  created_by: string;
}

export interface WordCloudData {
  event_uuid: string;
  words: { text: string; value: number }[];
}
export interface Notificaiton {
  uuid: string;
  body: {
    title: string;
    description: string;
    created_at: string;
    read: boolean;
  };
  sender: string;
  receiver: string;
}

export interface Question {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'chips' | null;
  prompt: string;
  options?: string[];
  required?: boolean;
  isError?: boolean;
  textAnswer?: string;
  choiceAnswer?: any[];
}

export interface QuestionGroup {
  id: string;
  title: string;
  questions: Question[];
}
