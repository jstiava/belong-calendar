'use client';
import { useRouter } from 'next/router';
import { AppPageProps } from '@/types/globals';
import { useTheme } from '@mui/material';
import MainPage from '@/components/layout/MainPage';

const CalendarPage = (props: AppPageProps) => {
  const router = useRouter();
  const theme = useTheme();


  const Session = props.Session
  const Base = props.Base;
  const prefix = '/be/'

  
  if (!props.Session.base) {
    return <></>
  }

  return (
    <MainPage
        containerRef={props.containerRef}
        Base={Base}
        Session={Session}
        prefix={prefix}
        setModule={props.setModule}
        item={props.Session.base}
    />
  );

}

export default CalendarPage;
