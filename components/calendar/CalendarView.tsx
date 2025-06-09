'use client';
import {
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, MouseEvent, Dispatch } from 'react';
import { UseCalendar } from '@/lib/useCalendar';
import { Event, Member, Schedule, Chronos, dayjs } from '@jstiava/chronos';
import { StartCreator } from '@/lib/global/useCreate';
import WeekView from './WeekView';
import { UseEvents } from '@/lib/global/useEvents';
import { UsePreferences } from '@/lib/global/usePreferences';
import { StartViewer } from '@/lib/global/useView';
import MonthView from './MonthView';
import { CalendarDays } from '@/lib/CalendarDays';
import CalendarDay from '@/lib/CalendarDay';

interface CalendarViewProps {
  containerRef: React.RefObject<HTMLElement>;
  selected: Event[] | null;
  setSelected: Dispatch<React.SetStateAction<Event[] | null>>;
  Preferences: UsePreferences;
  handleSelect: (e: MouseEvent | KeyboardEvent, event: Event | boolean) => void;
  source: Member | null,
  Calendar: UseCalendar,
  days: CalendarDays<CalendarDay>;
  handleCreate: StartCreator;
  handleView: StartViewer;
  Events: UseEvents;
  schedule?: Partial<Schedule>;
  isCreatorOpen: boolean;
}


interface DraggedEventBlockProps {
  uuid?: string | null,
  display: 'flex',
  top: number,
  left: number,
  width: number,
  height: number,
  startY: number,
  currY: number,
  dragDay: dayjs.Dayjs;
  dragStart: Chronos;
  currStart: Chronos;
  currEnd: Chronos;
  name?: string | null;
}

enum DragMode {
  Moving = "moving",
  DragToCreate = "dragToCreate"
}


const CalendarView = ({
  containerRef,
  selected,
  setSelected,
  Preferences,
  handleSelect,
  source,
  Calendar,
  days,
  handleCreate,
  handleView,
  Events,
  isCreatorOpen,
}: CalendarViewProps) => {
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down('sm'));


  const handleKeyPress = (event: KeyboardEvent) => {

    if (isCreatorOpen) {
      return;
    }

    // if (event.ctrlKey && event.key === 'v') {
    //   event.preventDefault();
    //   handlePasteAction();
    //   return;
    // }

    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      handleSelect(event, true);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      Calendar.next();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      Calendar.prev();
      return;
    }

    if (event.key === "w") {
      Calendar.gotoStartOfWeek(Calendar.has(dayjs()) ? dayjs() : Calendar.frameDate);
      return;
    }

    if (event.key === "d") {
      Calendar.gotoDate();
      return;
    }

    if (event.key === "m") {
      Calendar.goToStartOfMonth(Calendar.has(dayjs()) ? dayjs() : Calendar.frameDate);
      return;
    }

  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Calendar])

  if (!days) {
    return <></>
  }


  return (
    <>
      {Calendar.days.length === 1 && (
        <WeekView
          key={`day_view_${days.version}`}
          selected={selected}
          setSelected={setSelected}
          handleSelect={handleSelect}
          Preferences={Preferences}
          source={source}
          Calendar={Calendar}
          handleCreate={handleCreate}
          handleView={handleView}
          days={days}
          Events={Events}
        />
      )}

      {Calendar.days.length === 7 && (
        <WeekView
        key={`week_view_${days.version}`}
          selected={selected}
          setSelected={setSelected}
          handleSelect={handleSelect}
          Preferences={Preferences}
          source={source}
          Calendar={Calendar}
          handleCreate={handleCreate}
          handleView={handleView}
          days={days}
          Events={Events}
        />
      )}

      {Calendar.days.length > 7 && (
        <>
          {isSm ? (
            <></>
          ) : (
            <MonthView
            key={`month_view_${days.version}`}
              selected={selected}
              setSelected={setSelected}
              handleSelect={handleSelect}
              Preferences={Preferences}
              source={source}
              Calendar={Calendar}
              handleCreate={handleCreate}
              handleView={handleView}
              days={days}
              Events={Events}
            />
          )}
        </>
      )}


    </>
  )
};

export default CalendarView;
