'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { Typography, useTheme } from '@mui/material';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import { MouseEvent, SetStateAction, useEffect } from 'react';
import dayjs from 'dayjs';
import { Event } from '@/schema';

const CalendarPage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();


    const Session = props.Session
    const prefix = '/be/';


    useEffect(() => {
        if (router.query.view) {
            const view = router.query.view;
            if (view === 'month') {
                Session.Calendar.goToStartOfMonth(dayjs())
            }
            else if (view === 'week') {
                Session.Calendar.gotoStartOfWeek(dayjs());
            }
            else if (view == 'day') {
                Session.Calendar.gotoDate(dayjs());
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])


    if (!Session.Events.days) {
        return <></>
    }

    if (router.query.view === 'month') {
        return (
            <MonthView
                Preferences={Session.Preferences}
                source={Session.session}
                Calendar={Session.Calendar}
                handleCreate={Session.Creator.startCreator}
                handleView={null}
                days={Session.Events.days}
                Events={Session.Events} 
                selected={null} 
                setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                } } handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                } }                
            />
        )
    }

    if (router.query.view === 'week' || router.query.view === 'day') {
        return (
            <WeekView
                key={`week_view`}
                // containerRef={containerRef}
                // selected={selected}
                // setSelected={setSelected}
                // handleSelect={handleSelect}
                Preferences={Session.Preferences}
                source={Session.session}
                Calendar={Session.Calendar}
                handleCreate={Session.Creator.startCreator}
                handleView={null}
                days={Session.Events.days}
                Events={Session.Events} selected={null} setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                } } handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                } }            />
        )
    }

    return (
        <>

        </>
    );

}

export default CalendarPage;
