"use client"
import { createTheme, darken, lighten, Theme, useTheme } from '@mui/material';
import axios, { API } from '@/lib/utils/axios';
import { Sora } from 'next/font/google';
import { enqueueSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { UseSession } from '@/lib/global/useSession';
import { Member, MemberData, MemberFactory, Profile } from '@jstiava/chronos';
import useCalendar, { UseCalendar } from '../useCalendar';
import useEvents, { UseEvents } from './useEvents';
import useCreator, { UseCreator } from './useCreate';
import { Type } from '@/types/globals';
import useLocations, { UseLocations } from './useLocations';
import { NullFilterOption } from 'aws-sdk/clients/quicksight';
import useViewEvent from './useViewEvent';
import useIAM, { UseIAM } from './useIAM';
import axiosInstance from '@/lib/utils/axios';


export function invertGrayscaleHex(hex: string): string {
  // Strip #
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Calculate brightness (grayscale assumption: R == G == B)
  const avg = (r + g + b) / (3 * 255); // normalized: 0 (white) to 1 (black)

  const invertedBrightness = 1 - avg; // flip it

  const value = Math.round(invertedBrightness * 255);
  const hexVal = value.toString(16).padStart(2, '0');

  return `#${hexVal}${hexVal}${hexVal}`;
}

export interface UseBaseCore {
  theme: any,
  Calendar: UseCalendar,
  Events: UseEvents,
  Locations?: UseLocations,
  add: (type: Type, item: MemberData, sharing?: any, actions?: any) => any,
  update: (type: Type, item: MemberData, sharing?: any, actions?: any) => any,
}

export interface UseBase {
  theme: any,
  Calendar: UseCalendar,
  Events: UseEvents,
  Locations: UseLocations,
  loading: boolean,
  Creator: UseCreator,
  add: (type: Type, item: MemberData, sharing?: any, actions?: any) => any,
  update: (type: Type, item: MemberData) => any,
  debug: () => any,
  Viewer: ReturnType<typeof useViewEvent>,
  IAM: UseIAM
}


export default function useBase(source: Member | null, Session: UseSession, setSource: Dispatch<SetStateAction<Member | null>>, expanded: boolean = false, Base?: UseBase, parent?: Member | null): UseBase {

  const [loading, setLoading] = useState<boolean>(false);
  const Calendar = useCalendar();
  const Events = useEvents(source, Calendar, expanded);
  const Locations = useLocations(source);
  const IAM = useIAM(source);


  const debug = () => {
    return JSON.stringify({
      props: {
        source,
        Session: Session.debug(),
        expanded,
        parent
      },
      loading,
      Calendar,
      Events: Events.debug(),
    }, null, 2)
  }

  const add = (type: Type, item: MemberData, sharing?: any, actions?: any) => {
    switch (type) {
      case Type.Event:
        return Events.add(item, sharing, actions);
      case Type.Location:
        return Locations.add(item);
    }
  }

  const update = async (type: Type, item: MemberData, sharing?: any, actions?: any) => {

    console.log({
      message: "Update",
      type,
      item
    })

    if (source && item.uuid === source.id()) {

      return await axiosInstance.patch(`/api/v1/groups`, {
        isUser: source instanceof Profile,
        source: MemberFactory.getToken(source),
        uuid: item.uuid,
        data: item,
      })
        .then(res => {
          return res;
        })
        .catch(err => {
          console.log(err);
          throw Error("Something went wrong that prevented an event update.")
        })

    }

    switch (type) {
      case Type.Event:
        return await Events.update(item);
      case Type.Location:
        return await Locations.update(item);
    }


  }


  let theTheme: Theme = {
    ...Session.theme,
    palette: {
      ...Session.theme.palette,
      primary: {
        main: source?.theme_color ? source?.theme_color : "#ffffff",
        light: source?.theme_color ? lighten(source?.theme_color, 0.9) : "#ffffff",
        dark: source?.theme_color ? darken(source?.theme_color, 0.1) : "#ffffff",
        contrastText: source?.theme_color ? Session.theme.palette.getContrastText(source?.theme_color) : "#000000"
      },
      secondary: {
        ...Session.theme.palette.secondary,
        main: "#000000",
        contrastText: "#ffffff",
      }
    },
  };

  const Creator = useCreator(source, {
    theme: theTheme, Calendar, Events, Locations, add, update
  }, Session, Base, parent);

  const Viewer = useViewEvent(
    source,
    Events,
    Creator.startCreator,
    Session.theme
  );

  // const Viewer = useView(source, { theme: Session.Preferences.mode === "light" ? lightTheme : darkTheme, Calendar, Events, Locations, loading }, Creator.startCreator);

  useEffect(() => {

    if (!source) return;
    Calendar.initSource(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);


  return useMemo(() => {
    return {
      theme: theTheme,
      Calendar,
      Events,
      Locations,
      loading: !source || Events.loading,
      Creator,
      add,
      update,
      debug,
      Viewer,
      IAM
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theTheme, source, Calendar, Events, Locations, Session.Preferences.mode, Creator, Viewer, IAM]);
}

