"use client"
import { useEffect, useState } from 'react';
import axios, { API } from '../utils/axios';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { Group, Event, Member, Profile, MemberFactory, MemberData, GroupData } from '@/schema';
import { Type } from '@/types/globals';

export interface UseIAM {
  members: Member[] | null;
  parents: Member[] | null;
  register: (person: Profile) => Promise<void>;
  invite: (other: {
    uuid: string,
    type: Type,
    [key: string]: any
  }) => Promise<void>;
  remove: (other: {
    uuid: string,
    type: Type,
    [key: string]: any
  }) => Promise<void>;
  source: Member | null;
  refresh: (slug: string, item_id: string) => Promise<any>;
}


export default function useIAM(item: Member | null, isDownstream: boolean = true, source?: Member, parent?: Member): UseIAM {
  const [cache, setCache] = useState<{
    id: string,
    isDownstream: boolean
  }>({
    id: '',
    isDownstream: false
  });
  const [parents, setParents] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);


  const fetchPersonnel = async (theItem: Member, isDownstream: boolean) => {

    const theList = await axios
      .get(API.GET_IAM, {
        params: {
          source: MemberFactory.getToken(theItem),
          isDownstream,
          type: theItem.getType()
        },
      })
      .then(res => {
        const initList = res.data.members.map((x: MemberData) => {
          return MemberFactory.create(x.type, x);
        });
        return initList;
      })
      .catch(error => {
        console.log(error);
        return [];
      });

    return theList;
  };



  useEffect(() => {
    if (!item) {
      return;
    };

    if (loading) {
      return;
    }

    if (!item.id()) {
      return;
    }

    if (cache.id === item.id() && cache.isDownstream === isDownstream) {
      return;
    }

    setLoading(true);

    fetchPersonnel(item, isDownstream)
      .then(list => {
        setLoading(false);
        setCache({
          id: item.id(),
          isDownstream
        })
        isDownstream ? setMembers(list) : setParents(list);
      })
      .catch(err => {
        console.log(err);
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, isDownstream]);

  const register = async (person: Profile) => {

    if (!item) {
      console.log("No item");
      return;
    }

    await axios.post(API.REGISTER_PROFILE, {
      ...person,
      username: person.username || person.name,
      source: MemberFactory.getToken(item)
    })
      .then(res => {
        const newProfile = res.data.person;
        // setMembers(prev => {
        //   return [
        //     ...prev,
        //     new ProfileMembership(newProfile)
        //   ];
        // })
      })
      .catch(err => {
        throw Error("Failed to create")
      })

    return;
  }


  const invite = async (other: {
    uuid: string,
    type: Type,
    [key: string]: any
  }) => {

    if (!item) {
      console.log("No item");
      return;
    }

    await axios.post('/api/v3/iam', {
      source: MemberFactory.getToken(item),
      uuid: other.uuid,
      type: other.type
    })
      .then(res => {
        // TODO - add client code.
      })
      .catch(error => {
        console.log(error);
        return enqueueSnackbar("Invite failed.", {
          variant: 'error',
        });
      });

    return;
  }

  const refresh = async (slug: string, item_id: string) => {
    await axios.post(`/api/v1/auth/refresh?id=${item_id}`)
      .then((res: any) => {

        const oldGroup = members?.find(x => x.uuid === item_id) as Group | undefined;
        if (!oldGroup) {
          return;
        }

        const newGroup = new Group({
          ...oldGroup.eject(),
          ...res.data.updated
        })

        setMembers((prev: any) => {
          if (!prev) {
            return [newGroup]
          }
          const filtered = prev.filter((x : any) => x.uuid != item_id);
          return [...filtered, newGroup]
        })
        return;
      })
      .catch(err => {
        return;
      })
  }

  const remove = async (other: {
    uuid: string,
    type: Type,
    [key: string]: any
  }) => {
    if (!item) return;

    await axios.delete('/api/v3/iam', {
      params: {
        source: MemberFactory.getToken(item),
        uuid: other.uuid,
        type: other.type
      }
    })
      .then(res => {
        // TODO - add client code.
      })
      .catch(error => {
        console.log(error);
        return enqueueSnackbar("Failed to remove member.", {
          variant: 'error',
        });
      });
    return;
  };

  return { members, parents, invite, remove, register, source: item, refresh };
}
