"use client"
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Group, Member, MemberData, Profile, MemberFactory, GroupData, Pointer } from '@/schema';
import useCalendar, { UseCalendar } from '../useCalendar';
import { Type, UseSocket } from '@/types/globals';
import useEvents, { UseEvents } from './useEvents';
import Fuse from 'fuse.js';
import axios, { API } from '../utils/axios';
import useCreator, { UseCreator } from './useCreate';
import { useTheme } from '@mui/material';
import useIntegrations, { UseIntegrations } from './useIntegrations';
import usePreferences, { UsePreferences } from './usePreferences';

type HSV = { h: number; s: number; v: number };

function hexToHSV(hexrgb: string): HSV {

  try {

    // Remove '#' if present
    const hex = hexrgb.startsWith("#") ? hexrgb.slice(1) : hexrgb;
    
    // Convert hex values to RGB
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Calculate HSV
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  // Hue calculation
  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }
  
  // Saturation calculation
  const s = max === 0 ? 0 : delta / max;
  
  // Value calculation
  const v = max;
  
  return { h: Math.round(h), s: parseFloat(s.toFixed(2)), v: parseFloat(v.toFixed(2)) };
}
catch (err) {
  return { 
    h: 255,
    s: 255,
    v: 255
  }
}
}


export interface UseSession {
  loading: boolean;
  // Socket: UseSocket;
  Calendar: UseCalendar;
  Events: UseEvents;
  session: Profile | null;
  handleLeave: (group_uuid?: string) => void;
  handleJoin: (base: Member) => Promise<void | Error>;
  base: Member | null;
  changeBase: (base: Member | null) => Promise<boolean>;
  bases: Member[] | null;
  verify: (target?: {
    value: string,
    type?: Type | null
  } | null) => Promise<boolean>;
  login: (loginCred: any) => void;
  logout: () => void;
  notifications: any[] | null;
  Integrations: UseIntegrations;
  Preferences: UsePreferences;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: Dispatch<SetStateAction<boolean>>;
  swap: (newSession: Profile) => void;
  search: (query: string) => Member[];
  addNewBase: (newBase: GroupData) => Promise<void>;
  setBase: Dispatch<SetStateAction<Member | null>>;
  Creator: UseCreator;
  debug : () => any;
}

export default function useSession(): UseSession {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  // const Socket = useSocket();
  const [session, setSession] = useState<Profile | null>(null);
  const Calendar = useCalendar();
  const Events = useEvents(session, Calendar, false, setSession);
  const [base, setBase] = useState<Member | null>(null);
  const [bases, setBases] = useState<Member[] | null>(null);
  const [notifications, setNotifications] = useState([]);
  const Integrations: UseIntegrations = useIntegrations(session);
  const Preferences: UsePreferences = usePreferences();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const theme = useTheme();

  const debug = () => {
    console.log({
      base,
      session,
      isRightSidebarOpen
    })
  }

  const add = (type: Type, item: MemberData) => {
    switch (type) {
      case Type.Event:
        return Events.add(item);
      case Type.Location:
        return null;
    }
  }


  const update = (type: Type, item: MemberData) => {
    switch (type) {
      case Type.Event:
        return Events.update(item);
      case Type.Location:
        return null;
    }
  }

  const Creator = useCreator(session, {
    theme, Calendar, Events, Locations: null, loading, add, update
  }, {
    theme, Calendar, Events, Locations: null, loading
  });

  const swap = (newSession: Profile) => {
    if (session && (session.id() === newSession.id())) {
      setSession(newSession);
    }
  }

  const addNewBase = async (newBase: GroupData) => {

    await axios.post('/api/v1/groups', {
      base: newBase,
      source: base ? MemberFactory.getToken(base) : null
    })
      .then(res => {
        setBases(prev => {
          if (!prev) return [res.data.newBase];


          const theNewBase = new Group(res.data.newBase);
          return [...prev, theNewBase];
        })
      })
      .catch(err => {
        return;
      })
  }


  const logout = () => {
    axios
      .post(API.LOGOUT)
      .then(() => {
        router.push('/');
        setSession(null);
        setBases(null);
        return enqueueSnackbar("Signed out", {
          variant: "success"
        })
      })
      .catch(error => {
        console.error(error);
        enqueueSnackbar('Error logging out.', {
          variant: 'error',
        });
      });
  };

  const handleJoin = async (base: Member) => {
    await axios.post(API.JOIN_BASE, {
      group: base.uuid,
    })
      .then(res => {
        const newMembership = MemberFactory.create(base.getType(), res.data.base);

        setBases((prev) => {
          if (!prev) return [newMembership];
          return [...prev, newMembership]
        })

        enqueueSnackbar(`You have joined.`, {
          variant: 'success',
        });

        return;
      })
      .catch(error => {
        return enqueueSnackbar(error.response.data.message, {
          variant: 'error',
        });
      });
  };

  const handleLeave = (group_uuid: string = base!.id()) => {

    if (!bases) return;
    axios.delete(API.LEAVE_BASE, {
      params: {
        group: group_uuid,
      }
    })
      .then(res => {
        const newBaseList = bases?.filter((base) => base.id() !== group_uuid);
        setBases(newBaseList);
        enqueueSnackbar(`You have left.`, {
          variant: 'success',
        });
        return;
      })
      .catch(error => {
        console.log(error);
        return enqueueSnackbar(error.response.data.message, {
          variant: 'error',
        });
      });
  };

  const handleSession = async (profile: Profile) => {
    setSession(profile);
  }

  const changeBase = async (newBase: Member | null): Promise<boolean> => {

    if (!newBase) {
      // enqueueSnackbar("No base to change to.", {
      //   variant: "error"
      // })
      console.error("No base to change to.")
      return false;
    };

    try {
      await MemberFactory.login(newBase);
      setBase(newBase);
    }
    catch (err) {
      enqueueSnackbar("Could not sign into base.", {
        variant: "error"
      })
    }

    return true;

  };


  const login = (loginCred: any) => {
    axios
      .post(API.LOGIN, { ...loginCred })
      .then(res => {

        enqueueSnackbar('Signed In Successfully.', {
          variant: 'success',
        });

        const profile = new Profile(res.data.profile);
        handleSession(profile);
        const myBases : MemberData[] = res.data.items.map((item : MemberData) => {
          return MemberFactory.create(item.type, item);
        });

        const basesSorted = myBases.sort((a, b) => {  
          const hsvA = hexToHSV(a.theme_color ? a.theme_color : profile.theme_color);
          const hsvB = hexToHSV(b.theme_color ? b.theme_color : profile.theme_color);
          if (hsvA.h !== hsvB.h) return hsvA.h - hsvB.h;
          if (hsvA.s !== hsvB.s) return hsvB.s - hsvA.s;
          return hsvB.v - hsvA.v;
        });

        setBases(basesSorted);
        router.push('/dashboard');

      })
      .catch(error => {
        return enqueueSnackbar(error.message, {
          variant: 'error',
        });
      });
  };

  const verify = async (target?: {
    value: string,
    type?: Type | null
  } | null): Promise<boolean> => {

    if (session && bases) {
      if (target) {
        const pageBase = bases.find(
          (item: Member) => item.id() === target.value,
        );
        if (!pageBase) {
          console.log({
            message: "Could not find base",
            target
          })
          return false;
        }
        return changeBase(pageBase);
      }

    }

    const params: any = {
      doNotFetchMemberships: !bases || bases.length === 0 ? false : true,
      current_base: target && target.value,
      current_base_type: target && target.type
    }

    return await axios
      .get(API.VERIFY_SESSION_TOKEN, {
        params
      })
      .then(res => {
        const profile = new Profile(res.data.session);
        handleSession(profile);

        if (!bases || bases.length === 0) {

          const myBases : MemberData[] = res.data.items.map((item: MemberData) => {
            return MemberFactory.create(item.type, item);
          });

          myBases.sort((a, b) => {
            const hsvA = hexToHSV(a.theme_color ? a.theme_color : profile.theme_color);
            const hsvB = hexToHSV(b.theme_color ? b.theme_color : profile.theme_color);
            if (hsvA.h !== hsvB.h) return hsvA.h - hsvB.h;
            if (hsvA.s !== hsvB.s) return hsvB.s - hsvA.s;
            return hsvB.v - hsvA.v;
          });

          if (res.data.current_base_token && target) {
            const pageBase = myBases.find(
              (item: Member) => item.id() === String(target.value),
            );
            pageBase.token = res.data.current_base_token;
            setBases(myBases);
            changeBase(pageBase);
          }
          else {
            setBases(myBases);
            changeBase(null);
          }
          return true;
        }

        return target ? bases.some((item: Member) => item.id() === target.value) : true;

      })
      .catch(error => {
        console.log(error);
        return false;
      });
  };

  const search = (query: string) => {
    if (!bases || !query) {
      return bases || [];
    }
    const options = {
      includeScore: true, // Include score in the result
      threshold: 0.3,     // Match accuracy (0 = exact, 1 = match everything)
      keys: ["name", "tagline"]
    };
    const fuse = new Fuse(bases, options);
    const results = fuse.search(query);
    return results.map(x => x.item);
  }

  return useMemo(() => {
    return {
      loading,
      // Socket,
      Calendar,
      Events,
      session,
      handleLeave,
      handleJoin,
      base,
      changeBase,
      bases,
      verify,
      login,
      logout,
      notifications,
      Integrations,
      Preferences,
      isRightSidebarOpen,
      setIsRightSidebarOpen,
      swap,
      search,
      addNewBase,
      setBase,
      Creator,
      debug
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, base, Calendar, Preferences, Integrations, isRightSidebarOpen]);
}


