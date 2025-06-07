import { ImageStub } from './files';
import { Member, HostData, Junction } from '@/schema';
import { v4 as uuidv4 } from "uuid";
import { Type } from '@/types/globals';


export type GroupData = any & {
  type?: Type;
  junctions?: HostData[] | null;
  integration: string | null;
};

export class Group implements Member {
  uuid!: string;
  name!: string;
  theme_color!: string | null;
  valid!: boolean;
  nickname!: string | null;
  username!: string;
  tagline!: string | null;
  cover_img!: ImageStub | null;
  icon_img!: ImageStub | null;
  type!: Type;
  metadata!: any;
  access_token!: string | null;
  access_token_expires!: string | null;
  refresh_token!: string | null;
  refresh_token_expires!: string | null;
  scope!: string | null;
  integration!: string | null;


  // Junction tables
  junctions!: Map<string, Junction>;

  // Access
  token?: string | null;

  constructor(item?: Partial<GroupData>) {

    this.type = Type.Group;

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
        const j = new Junction(i, Type.Group);
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

    return this;
  }

  getHostColumnString = () => {
    return 'group_id';
  }

  getUsername(): string {
    return this.username;
  }

  getType = () => {
    return Type.Group;
  }

  getItem = () => {
    return this;
  }

  connectTo(other: Member) {
    const me = this.getHostColumnString();
    const their = other.getHostColumnString();

    return new Junction({
      ...Junction.getHostTemplate(),
      [me]: this.id(),
      [their]: other.id()
    }, Type.Group)
  }

  getIconPath = (quick: boolean = false): string | null => {

    if (!this.icon_img && this.cover_img) {
      return this.cover_img.path || null;
    }

    if (quick) {
      return this.icon_img?.path_quick || this.icon_img?.path || null;
    }
    return this.icon_img?.path || null
  }

  id = (): string => {
    return this.uuid;
  };

  item_id = () => {
    return this.uuid;
  }

  item_path = () => {
    return this.username;
  }

  copy = () => {
    return new Group(this.eject());
  }

  eject = (): GroupData => {
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
    }
  }

}

