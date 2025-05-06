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
import { createTheme, lighten, Theme, useTheme, darken } from '@mui/material';
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
  theme: Theme;
  loading: boolean;
  // Socket: UseSocket;
  Calendar: UseCalendar;
  Events: UseEvents;
  session: Profile | null;
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
  Preferences: UsePreferences;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: Dispatch<SetStateAction<boolean>>;
  swap: (newSession: Profile) => void;
  search: (query: string) => Member[];
  addNewBase: (newBase: GroupData) => Promise<void>;
  setBase: Dispatch<SetStateAction<Member | null>>;
  Creator: UseCreator;
  debug: () => any;
  reload: () => any;
}

export default function useSession(): UseSession {
  const router = useRouter();
  // const Socket = useSocket();
  const [session, setSession] = useState<Profile | null>(null);

  const Calendar = useCalendar();
  const Events = useEvents(session, Calendar, false);
  const [base, setBase] = useState<Member | null>(null);
  const [bases, setBases] = useState<Member[] | null>(null);
  const [notifications, setNotifications] = useState([]);
  const Preferences: UsePreferences = usePreferences();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [basesSearch, setBasesSearch] = useState<Fuse<Member> | null>(null)
  const theme = useTheme();

  const reload = () => {
    setSession(null);
    setBases(null);
    verify();
  }

  const handleSetBases = (newBases: Member[] | null) => {

    if (!newBases) {
      setBases(newBases);
      setBasesSearch(null);
      return;
    }

    const options = {
      includeScore: true, // Include score in the result
      threshold: 0.3,     // Match accuracy (0 = exact, 1 = match everything)
      keys: ["name", "tagline", "metadata.description", "type", "integration"]
    };
    const fuse = new Fuse(newBases, options);

    setBasesSearch(fuse);
    setBases(newBases);
  }

  let lightTheme: Theme = {
    ...theme,
    palette: {
      ...theme.palette,
      mode: 'light',
      primary: {
        main: session?.theme_color ? session?.theme_color : "#ffffff",
        light: session?.theme_color ? lighten(session?.theme_color, 0.9) : "#ffffff",
        dark: session?.theme_color ? darken(session?.theme_color, 0.1) : "#ffffff",
        contrastText: session?.theme_color ? theme.palette.getContrastText(session?.theme_color) : "#000000"
      },
      secondary: {
        ...theme.palette.secondary,
        main: "#000000",
        contrastText: "#ffffff",
      }
    },
  };

  lightTheme = createTheme(lightTheme, {
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            width: "fit-content",
            textTransform: "capitalize",
            padding: "0.25rem 1rem"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'capitalize',
            variants: [
              {
                props: { variant: "flipped" },
                style: {
                  backgroundColor: lightTheme.palette.primary.contrastText,
                  color: lightTheme.palette.primary.main
                }
              },
              {
                props: { color: "primary", variant: "contained" },
                style: {
                  '&:hover': {
                    backgroundColor: session?.theme_color ? lighten(session?.theme_color, 0.4) : "#ffffff"
                  },
                }
              },
              {
                props: { variant: 'light' },
                style: {
                  '&:hover': {
                    backgroundColor: session?.theme_color ? darken(session?.theme_color, 0.2) : "#ffffff"
                  },
                  backgroundColor: session?.theme_color ? darken(session?.theme_color, 0.1) : "#ffffff",
                  color: "#ffffff"
                }
              }
            ]
          }
        },
      }
    },
  });

  let darkTheme: Theme = {
    ...theme,
    palette: {
      ...theme.palette,
      mode: 'dark',
      primary: {
        ...theme.palette.primary,
        main: session?.theme_color ? session.theme_color : "#ffffff",
        light: session?.theme_color ? lighten(session?.theme_color, 0.9) : "#ffffff",
        dark: session?.theme_color ? darken(session?.theme_color, 0.1) : "#ffffff",
      },
      secondary: {
        ...theme.palette.secondary,
        main: "#000000",
        contrastText: "#ffffff",
      },
    },
  };

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
    theme, Calendar, Events, add, update
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
        const theNewBase = new Group(res.data.group);

        handleSetBases(bases ? [...bases, theNewBase] : [theNewBase])
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
        handleSetBases(null);
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
        const myBases: MemberData[] = res.data.items.map((item: MemberData) => {
          return MemberFactory.create(item.type, item);
        });

        const basesSorted = myBases.sort((a, b) => {
          const hsvA = hexToHSV(a.theme_color ? a.theme_color : profile.theme_color);
          const hsvB = hexToHSV(b.theme_color ? b.theme_color : profile.theme_color);
          if (hsvA.h !== hsvB.h) return hsvA.h - hsvB.h;
          if (hsvA.s !== hsvB.s) return hsvB.s - hsvA.s;
          return hsvB.v - hsvA.v;
        });

        handleSetBases(basesSorted);
        router.push('/me');

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

          const myBases: MemberData[] = res.data.items.map((item: MemberData) => {
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
            handleSetBases(myBases);
            changeBase(pageBase);
          }
          else {
            handleSetBases(myBases);
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
    if (!bases || !basesSearch) {
      return bases || [];
    }
    const results = basesSearch.search(query);
    return results.map(x => x.item);
  }

  return useMemo(() => {
    return {
      theme: Preferences.mode === "light" ? lightTheme : darkTheme,
      loading: !session && Events.loading,
      // Socket,
      Calendar,
      Events,
      session,
      base,
      changeBase,
      bases,
      verify,
      login,
      logout,
      notifications,
      Preferences,
      isRightSidebarOpen,
      setIsRightSidebarOpen,
      swap,
      search,
      addNewBase,
      setBase,
      Creator,
      debug,
      reload
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, base, Calendar, Events, Preferences, isRightSidebarOpen, lightTheme, darkTheme]);
}


