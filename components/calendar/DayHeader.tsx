'use client';
import {
  Typography,
  useTheme,
  Button,
  ButtonBase,
  Popover,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
} from 'react';
import dayjs from '@/lib/utils/dayjs';
import { Event, Member, Schedule } from '@/schema';
import { Mode, Type } from '@/types/globals';
import { AddOutlined, BugReportOutlined, CopyAllOutlined } from '@mui/icons-material';
import { StartViewer } from '@/lib/global/useView';
import { UseCalendar } from '@/lib/useCalendar';
import { MultiDayEventBlock } from '../events/MultiDayEventBlock';
import CalendarDayRendered from '@/lib/CalendarDayRendered';
import { isAllSingleDay, isMoment, isMultiDayEvent, isNotScheduled, isScheduled, isSingleTimeEvent } from '@/lib/CalendarDays';
import CalendarDay from '@/lib/CalendarDay';
import { StackedEventBlock } from '../events/StackedEventBlock';
import { StackedMomentBlock } from '../events/StackedMomentBlock';
import { StackedScheduleBlock } from '../events/StackedScheduleBlock';
import { StackedSingleDayBlock } from '../events/StackedSingleDayBlock';


function DayHeader({
  index,
  style = {},
  date,
  handleCreate,
  calendarDay,
  standardHeight,
  handleDragStart,
  handleMouseMove,
  handleView,
  handleSelect,
  handleDayTimeClick,
  selected,
  Calendar,
  onClick,
  source,
  swap
}: {
  index: number;
  style?: any
  date: dayjs.Dayjs;
  calendarDay: CalendarDay | null;
  handleMouseMove?: (e: MouseEvent<HTMLDivElement>, props: any) => void;
  handleDragStart?: (
    e: MouseEvent<HTMLDivElement>,
    props: any
  ) => void;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate: (
    type: Type,
    mode: Mode,
    props: any
  ) => void;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  selected?: Event[] | null;
  handleDayTimeClick?: (e: MouseEvent) => void;
  Calendar: UseCalendar;
  onClick?: () => void;
  source: Member | null;
  swap: any
}) {
  const theme = useTheme();
  const calDayRef = useRef<HTMLAnchorElement | null>(null);
  const isPast = dayjs().isAfter(date, 'D');



  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!calDayRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(calDayRef.current);

    return () => observer.disconnect();

  }, [calDayRef.current]);



  const [chipIndex, setChipIndex] = useState(0);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const [calendarDayRendered, setCalendarDayRendered] = useState<CalendarDayRendered | null>(null);

  const [reducedAllDayStack, setReducedAllDayStack] = useState<Event[] | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);


  useEffect(() => {
    if (calendarDay && date) {

      const theCalendarDayRendered = new CalendarDayRendered(date.yyyymmdd(), calendarDay);

      let result = [];
      const theEvents: Event[] = [];
      const startOffset: Event[] = [];
      for (const event of theCalendarDayRendered.chaos.flat()) {
        theEvents.push(event);
      }

      for (const event of theCalendarDayRendered.aside) {
        theEvents.push(event);
      }

      setEvents(theEvents);


      for (const item of theCalendarDayRendered.stack) {
        if (!(item instanceof Event)) {
          continue;
        }
        if (!item.date) {
          result.push(item);
          continue;
        }
        if (!item.date.isSame(date, 'd') && index != 0) {
          // startOffset.push(null);
          continue;
        }
        if (index === 0) {
          result.push(item);
          continue;
        }
        result.push(item);
      }

      // console.log({
      //   date: date.yyyymmdd(),
      //   theCalendarDayRendered,
      //   calendarDay
      // })


      setCalendarDayRendered(theCalendarDayRendered)
      setReducedAllDayStack([...startOffset, ...result]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDay])

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const today = dayjs();

  const handleRightClick = (e: any) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget)
  }


  if (!events || !reducedAllDayStack || !calendarDayRendered) {
    return <></>
  }

  return (
    <div
      className='column compact3'
      ref={calDayRef}
      style={{
        position: 'relative',
        width: "100%",
        height: '100%',
        paddingLeft: "0rem",
        paddingRight: "0rem",
        paddingTop: `calc(0rem + (${calendarDayRendered.stack.length} * 1.5rem))`,
      }}>
      {reducedAllDayStack && reducedAllDayStack.map((event, i) => {

        const isLeftOffset = calendarDayRendered.topOffset === i;

        if (!event) {
          return null;
        }

        if (isMultiDayEvent(event)) {
          return (
            <MultiDayEventBlock
              key={`MultiDay_${event.id()}`}
              DayInMonthRef={calDayRef}
              column={date.day()}
              date={date}
              referenceTime={6}
              event={event}
              standardHeight={standardHeight}
              handleView={handleView}
              handleCreate={handleCreate}
              handleSelect={handleSelect}
              handleDragStart={handleDragStart}
              isSelected={!selected ? false : selected.some((item) => item.uuid === event.uuid)}
              source={source}
              style={{
                position: "absolute",
                top: `calc(${i} * 1.525rem)`,
                marginLeft: "0rem",
                gutter: "0.5rem",
              }}
            />
          )
        }

        if (!isNotScheduled(event) && ('schedules' in event && event.schedules)) {
          return (
            <StackedScheduleBlock
              key={`${event.id()}`}
              column={index}
              referenceTime={6}
              event={event as Event & { schedules: Schedule[] }}
              standardHeight={standardHeight}
              handleView={handleView}
              handleCreate={handleCreate}
              handleSelect={handleSelect}
              handleDragStart={handleDragStart}
              isSelected={!selected ? false : selected.some((item) => item.uuid === event.uuid)}
              source={source}
              swap={swap}
              style={{
                width: "100%"
              }}
            />
          )
        }

        return null;

      })}
    </div>
  );
}

export default DayHeader;
