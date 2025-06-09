'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import { MouseEvent, SetStateAction, useEffect } from 'react';
import dayjs from 'dayjs';
import { Event } from '@jstiava/chronos';
import DataView from '@/components/calendar/DataView';
import MobileMonthView from '@/components/calendar/MobileMonthView';

const MapsPage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();


    const Session = props.Session
    const Controller = props.module ? props.Module : props.Base;

    const item = props.module ? props.module : props.Session.base;
    const prefix = '/be/';

     const isSm = useMediaQuery(theme.breakpoints.down('sm'));

    const pushNewView = (tab: string) => {

        let theView = undefined;
        if (['month', 'week', 'day'].some(x => x === tab)) {
            theView = tab;
            tab = 'calendar';
        }

        const theModule = router.query.module;
        if (router.query.module) {
            delete router.query.module;
        }
        const { base, ...rest } = router.query;

        if (theModule && base) {
            rest.base = base;
        }

        const isSession = router.asPath.startsWith('/me');

        router.push({
            pathname: `${isSession ? `/me/` : `/be/${theModule ? `${String(theModule)}/` : Session.base?.id()}/`}${tab}`,
            query: { ...rest, view: theView }
        })
    };



    return (
         <DataView
                Preferences={Session.Preferences}
                source={item}
                Calendar={Controller.Calendar}
                handleCreate={Controller.Creator.startCreator}
                handleView={Controller.Viewer.handleOpenEventPopover}
                days={Controller.Events.days}
                Events={Controller.Events}
                selected={null}
                setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                }}
                handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                }}
            />
    )

}

export default MapsPage;
