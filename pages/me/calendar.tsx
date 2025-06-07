'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { Typography, useTheme } from '@mui/material';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import { MouseEvent, SetStateAction, useEffect } from 'react';
import dayjs from 'dayjs';
import { Event } from '@/schema';
import DataView from '@/components/calendar/DataView';

const CalendarPage = (props: AppPageProps) => {
    const router = useRouter();
    const theme = useTheme();


    const Session = props.Session
    const Controller = props.Session;
    const prefix = '/be/';

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
            pathname: `${`/me/`}${tab}`,
            query: { ...rest, view: theView }
        })
    };


    const handleKeyPress = (event: KeyboardEvent) => {

        if (Controller.Creator.isOpen) {
            return;
        }

        // if (event.ctrlKey && event.key === 'v') {
        //   event.preventDefault();
        //   handlePasteAction();
        //   return;
        // }

        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
            // handleSelect(event, true);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            Controller.Calendar.next();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            Controller.Calendar.prev();
            return;
        }

        if (event.key === "w") {
            pushNewView('week');
            return;
        }

        if (event.key === "d") {
            pushNewView('day');
            return;
        }

        if (event.key === "m") {
            pushNewView('month')
            return;
        }

    };

    useEffect(() => {

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Controller.Calendar])


    useEffect(() => {
        if (!router.query.view) {
            const tab = 'calendar';
            router.replace({
                pathname: `${`/me/`}${tab}`,
                query: { ...router.query, view: 'month' }
            })
            return;
        }

        if (router.query.view) {
            const view = router.query.view;

            if (view === 'month') {
                Session.Calendar.goToStartOfMonth(dayjs().tz('America/Chicago'))
            }
            else if (view === 'week') {
                Session.Calendar.gotoStartOfWeek(dayjs().tz('America/Chicago'));
            }
            else if (view == 'day') {
                Session.Calendar.gotoDate(dayjs().tz('America/Chicago'));
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])


    if (!Session.Events.days) {
        return <></>
    }

    if (router.query.view === 'data') {
        return (
            <DataView
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
                }} handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                }}
            />
        )
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
                }} handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                }}
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
                handleView={Session.Viewer.handleOpenEventPopover}
                days={Session.Events.days}
                Events={Session.Events} selected={null} setSelected={function (value: SetStateAction<Event[] | null>): void {
                    throw new Error('Function not implemented.');
                }} handleSelect={function (e: MouseEvent, event: Event): void {
                    throw new Error('Function not implemented.');
                }} />
        )
    }

    return (
        <>

        </>
    );

}

export default CalendarPage;
