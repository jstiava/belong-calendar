import { HostData, Junction, Membership } from './junctions';
import { ImageStub } from './files';
import { Type } from '@/types/globals';
import { v4 as uuidv4 } from 'uuid';
import { Member } from '.';


export type ProfileData = any & {
  passkey?: string | null;
  membership?: Membership | null;
  type?: Type;
  junctions?: HostData[] | null;
};


export class Profile implements Member {
  public uuid!: string;
  public name!: string;
  public nickname!: string;
  public username!: string;
  public email!: string;
  public phone!: string;
  public theme_color!: string;
  public valid!: boolean;
  public icon_img!: ImageStub | null;
  public membership: Membership | null;
  public type!: Type;
  junctions!: Map<string, Junction>;
  metadata!: any;


  getIconPath = (quick?: boolean): string | null => {
    // if (quick) {
    //   return this.icon_img?.path_quick || this.icon_img?.path || null;
    // }
    return this.icon_img?.path || null
  }

  id = () => {
    return this.uuid;
  }

  item_id = () => {
    return this.uuid;
  }

  item_path = () => {
    return this.username;
  }

  getType = () => {
    return Type.Profile
  }

  getHostColumnString = () => {
    return 'profile_id';
  }

  getItem = () => {
    return this;
  }

  getUsername(): string {
    return this.username;
  }

  getToken = () => {
    return null;
  }

  connectTo(other: Member) {
    const me = this.getHostColumnString();
    const their = other.getHostColumnString();

    const bothEvents = other instanceof Event;
    return new Junction({
      ...Junction.getHostTemplate(),
      [me]: this.id(),
      [bothEvents ? 'child_event_id' : their]: other.id()
    }, Type.Profile)
  }

  // TODO
  copy = (): Profile => {

    return new Profile(this.eject())
  }

  eject = (): ProfileData => {
    let serial: any = {};
    const { ...data } = this as Partial<Record<string, any>>;

    // Delete function properties from data
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'function') {
        delete data[key];
      }
    });

    Object.assign(serial, data);

    if (!serial) {
      throw Error;
    }

    return {
      ...serial,
      junctions: this.junctions ? Array.from(this.junctions.values()) : [],
    } as ProfileData;
  }

  constructor(item?: ProfileData) {

    this.type = Type.Profile;

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
        const j = new Junction(i, Type.Profile);
        if (!j) {
          continue;
        }
        this.junctions.set(j.to.uuid === this.uuid ? j.from.uuid : j.to.uuid, j)
      }
    }

    return this;
  }
}
