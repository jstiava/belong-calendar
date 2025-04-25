'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import MainPage from '@/components/layout/MainPage';
import { MemberFactory, Schedule, Event } from '@/schema';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

const EventPage = (props: AppPageProps) => {
  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  
  const event = props.module as Event;
  const Session = props.Session
  const prefix = '/event/'


  useEffect(() => {
    console.log("--- USE-EFFECT ---")

    // if (router.query.tab && router.query.tab != view) {
    //   console.log(router.query.tab);
    // //   setView(prev => String(router.query.tab));
    // }
    if (!router.query.event || router.query.event === '[event]') {
      setLoading(true);
      return;
    };
    if (!props.Session.base) {
      console.log("No base")
      return;
    }
    if (!props.Base.Events || props.Base.Events.loading) {
      console.log("Props.Base.Events either DNE or loading.")
      return;
    };
    if (event && (event.id() === router.query.event)) {
      console.log("Event already exists on the page.")
      return;
    };
    if (props.Session.base.id() === router.query.event) {
      // The base is already the event.
      return;
    }
    if (props.module && props.module.id() === router.query.event) {
      // The base is already the event.
      return;
    }
    if (fetching) {
      console.log("Already fetching.");
      return;
    }

    setFetching(true);
    props.Base.Events.get(String(router.query.event))
      .then(async (theEvent) => {
        setFetching(false);
        setLoading(false);

        if (!theEvent || Array.isArray(theEvent)) {
          console.log({
            message: "No event, or event are an array.",
            event: theEvent
          });
          throw Error();
        }
        await MemberFactory.fetchMetadata(theEvent);
        await MemberFactory.login(theEvent, props.Session.base!)
        // await theEvent.getHosts(props.Session.base)
        //   .catch(err => {
        //   console.log("Can't get edit permissions")
        // });

        theEvent.schedules = Schedule.rank(theEvent.schedules || []) as Schedule[];
        console.log(theEvent);
        props.setModule(theEvent);
      })
      .catch(err => {
        enqueueSnackbar("Error 404", {
          variant: "error"
        })
        return;
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, props.Base.Events, props.Session.base]);

  
  if (!event && !props.Session.base) {
    return <div className="center middle column compact">
      <CircularProgress  />
      <Typography variant="caption">No event</Typography>
    </div>
  }

  return (
    <MainPage
        containerRef={props.containerRef}
        Base={event ? props.Module : props.Base}
        Session={Session}
        prefix={prefix}
        setModule={props.setModule}
        item={event || props.Session.base}
    />
  );

}

export default EventPage;
