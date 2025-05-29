import { Type } from '@/types/globals';
import { EventData, Event } from './events';
import { GroupData, Group } from './groups';
import { Junction, JunctionData } from './junctions';
import { LocationData, Location } from './locations';
import { Profile } from './profiles';
import axios, { API } from '@/lib/utils/axios';
import { ImageStub } from './files';

export * from './events';
export * from './groups';
export * from './locations';
export * from './profiles';
export * from './junctions';
export * from './schedules';
export * from './certificates';
export * from './files';

export type MemberData = GroupData & EventData & LocationData;

export interface Member {
    integration?: string | null;
    uuid: string;
    name: string;
    theme_color: string | null;
    type: Type;
    metadata: any;
    junctions: Map<string, JunctionData>;
    id: () => string;
    eject: () => any;
    copy: (localize?: boolean, reduced?: boolean, rekey?: boolean) => Member;
    getItem: () => Member;
    getIconPath: (quick?: boolean) => string | null;
    getHostColumnString: () => string;
    getType: () => Type;
    token?: string | null;
    icon_img?: ImageStub | null;
}

export const isMember: Function[] = [Group, Location, Event, Profile];

export class MemberFactory {

    static connect(that: Member, other: Member) {
        const me = that.getHostColumnString();
        const their = other.getHostColumnString();

        return new Junction({
            ...Junction.getHostTemplate(),
            [me]: that.id(),
            [their]: other.id()
        }, that.type)
    }

    static async delete(source: Member, items: string[], type: Type) {
        await axios.delete(`api/v1/${type.toLowerCase()}s`, {
            data: {
                isUser: source instanceof Profile,
                [`${type.toLowerCase().toString()}s`]: items,
                source: MemberFactory.getToken(source),
            }
        })
            .then(res => {
                return true;
            })
            .catch(error => {
                return false;
            });
    }

    static getToken = (that: Member) => {
        return that.token;
    }

    static async getMetadata(that: Event): Promise<Event>;
    static async getMetadata(that: Group): Promise<Group>;
    static async getMetadata(that: Profile): Promise<Profile>;
    // static async getMetadata(that: Location): Promise<Location>;
    static async getMetadata(that: Member): Promise<Member> {
        if (that.metadata.isFetched) return that;
        await this.fetchMetadata(that);
        return that;
    }

    static async fetchMetadata(that: Member): Promise<void> {

        if (that.metadata && that.metadata.isFetched) {
            return;
        }

        await axios.get(`api/v1/${that.type.toLowerCase()}s/metadata`, {
            params: {
                uuid: that.id(),
                type: that.type
            },
        })
            .then(res => {

                const cleaned = res.data.results;
                if ('data' in res.data.results) {
                    cleaned.data = JSON.parse(res.data.results.data);
                }
                Object.assign(that.metadata, cleaned);
                that.metadata.isFetched = true;
            })
            .catch(error => {
                console.log(error);
            });
    }

    static async login(that: Member, source?: Member, acquire = false): Promise<string | null> {
        if (that.token) return that.token;

        await axios.post(API.GET_BASE_TOKEN, {
            type: that.type,
            uuid: that.uuid,
            source: source ? this.getToken(source) : this.getToken(that) || null,
            acquire
        })
            .then((res) => {
                that.token = res.data.token;
                return res.data.token;
            })
            .catch((err) => {
                console.log("Failed to login.")
                throw Error();
            })

        return null;
    }

    static async acquire(that: Member, source?: Member): Promise<{
        isAcquired: boolean,
        message: string
    }> {

        if (that.type != Type.Event) {
            return {
                isAcquired: true,
                message: "Not protected by lock yet."
            }
        }

        if (!that.token) {
            const isAcquired = await this.login(that, source, true)
                .then(res => {
                    return true;
                })
                .catch(err => {
                    return false;
                })
            return {
                isAcquired,
                message: "Success"
            }
        }

        return await axios.post(API.ACQUIRE_BASE, {
            type: that.type,
            uuid: that.uuid,
            source: source ? this.getToken(source) : null
        })
            .then((res) => {
                return res.data
            })
            .catch((err) => {
                return err.response.data;
            })
    }

    static collect_media = (self: MemberData | Member | null): ImageStub[] => {

        if (!self) {
            return [];
        }

        let result = [];

        if ('cover_img' in self && self.cover_img) {
            result.push(self.cover_img)
        }

        if ('icon_img' in self && self.icon_img) {
            result.push(self.icon_img)
        }

        if ('wordmark_img' in self && self.icon_img) {
            result.push(self.icon_img)
        }

        return result;
    }

    static create(type: Type, ...args: any[]): Member {
        switch (type) {
            case Type.Event:
                return new Event(...args)
            case Type.Group:
                return new Group(...args);
            // case Type.Location:
            //     return new Location(...args);
            case Type.Profile:
                return new Profile(...args);
            default:
                throw new Error("Unknown shape type");
        }
    }

    static isMember(target: any) {
        return isMember.some(cls => target instanceof cls);
    }
}
