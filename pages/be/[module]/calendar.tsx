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
    const Controller = props.module ? props.Module : props.Base;
    const prefix = '/be/';


    useEffect(() => {
        if (router.query.view) {
            const view = router.query.view;
            if (view === 'month') {
                Controller.Calendar.goToStartOfMonth(dayjs())
            }
            else if (view === 'week') {
                Controller.Calendar.gotoStartOfWeek(dayjs());
            }
            else if (view == 'day') {
                Controller.Calendar.gotoDate(dayjs());
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])


    if (!props.Session.base) {
        return <></>
    }

    if (router.query.view === 'month') {
        return (
            <MonthView
                Preferences={Session.Preferences}
                source={Session.base}
                Calendar={Controller.Calendar}
                handleCreate={Controller.Creator.startCreator}
                handleView={null}
                days={Controller.Events.days}
                Events={Controller.Events}
                selected={null}
                setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                }}
                handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                }} />
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
                source={Session.base}
                Calendar={Controller.Calendar}
                handleCreate={Controller.Creator.startCreator}
                handleView={null}
                days={Controller.Events.days as any}
                Events={Controller.Events}
                selected={null}
                setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                } }
                handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                } }
                />
        )
    }

    return (
        <>

        </>
    );

}

export default CalendarPage;
