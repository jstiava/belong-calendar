'use client';
import {
  Typography,
  useTheme,
  Chip,
  ButtonBase,
  useMediaQuery,
} from '@mui/material';
import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
} from 'react';
import CalendarDay from '@/lib/CalendarDay';
import dayjs from '@/lib/utils/dayjs';
import { Event, Member } from '@/schema';
import { Mode, Type } from '@/types/globals';
import { UseCalendar } from '@/lib/useCalendar';
import { Dayjs } from 'dayjs';
import { Hours } from '@/lib/utils/medici';
import { StartViewer } from '@/lib/global/useView';
import { MultiDayEventBlock } from '../events/MultiDayEventBlock';
import { ScheduleBlock } from '../events/ScheduleBlock';

export default function DayViewHeader({
  date,
  index,
  Calendar,
  calendarDay,
  handleDragStart,
  standardHeight,
  handleCreate,
  handleSelect,
  handleView,
  selected,
  source,
  swap
}: {
  date: Dayjs,
  index: number,
  Calendar: UseCalendar,
  calendarDay: CalendarDay | null;
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
  source: Member | null;
  swap: any;
}) {

  const calDayRef = useRef<HTMLAnchorElement | null>(null);

  const theme = useTheme();

  const isSmall = useMediaQuery("(max-width: 90rem)");

  const isMobile = useMediaQuery("(max-width: 45rem)");

  const isPast = dayjs().isAfter(date, 'D');
  const [reducedAllDayStack, setReducedAllDayStack] = useState(null);

  useEffect(() => {

    setReducedAllDayStack([]);
    return;


    if (calendarDay && date) {
      let result = [];


      const startOffset = [];


      for (const item of calendarDay.stack) {
        if (!(item instanceof Event)) {
          console.log(item);
          continue;
        }
        if (!item.date) {
          result.push(item);
          continue;
        }
        if (!item.date.isSame(date, 'd') && index != 0) {
          startOffset.push(null);
          continue;
        }
        if (index === 0) {
          result.push(item);
          continue;
        }
        result.push(item);
      }

      setReducedAllDayStack([...startOffset, ...result]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDay, calendarDay.count, calendarDay.stack && calendarDay.stack.length]);

  if (!reducedAllDayStack) {
    return <></>
  }


  return (
    <>
      {isSmall ? (
        <ButtonBase
          component="a"
          className="column compact center middle"
          sx={{
            display: 'flex',
            fontFamily: theme.typography.fontFamily,
            padding: 0,
            height: '6rem',
            textAlign: "center",
            marginBottom: 0,
            position: 'sticky',
            top: '0rem',
            backgroundColor: reducedAllDayStack && reducedAllDayStack.length === 0 ? 'transparent' : theme.palette.background.paper,
            width: "100%",
            // opacity: isPast ? 0.5 : 1
          }}
          onClick={(e) => Calendar.gotoDate(date)}
          ref={calDayRef}
        >
          <>
            {reducedAllDayStack && reducedAllDayStack.map((event: Event, i: number) => {

              if (!event) {
                return null;
              }

              if (event instanceof Hours) {
                return null;
              }

              const isLeftOffset = i + calendarDay.topOffset === calendarDay.topOffset;

              if (!event.date) {
                return (
                  <ScheduleBlock
                    key={`${event.id()}`}
                    column={date.day()}
                    isStacked={true}
                    date={date}
                    referenceTime={6}
                    event={event}
                    standardHeight={standardHeight}
                    handleView={handleView}
                    handleCreate={handleCreate}
                    handleSelect={handleSelect}
                    handleDragStart={handleDragStart}
                    source={source}
                    swap={swap}
                    style={{
                      position: "absolute",
                      top: `calc(${i + calendarDay.topOffset} * 1.525rem)`,
                      marginLeft: isLeftOffset ? "2.25rem" : "0rem",
                      width: isLeftOffset ? "calc(100% - 2.25rem)" : "100%"
                    }}
                  />
                )
              }

              return (
                <>
                  <MultiDayEventBlock
                    i={i}
                    DayInMonthRef={calDayRef}
                    key={`${event.id()}`}
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
                      top: `calc(${i + calendarDay.topOffset} * 1.525rem)`,
                      marginLeft: isLeftOffset ? "3.75rem" : "0.75rem",
                      gutter: "-1rem"
                    }}
                  />
                </>
              )

            })}
            <Chip
              sx={{
                // marginRight: '0.5rem',
                position: "relative",
                fontWeight: 700,
                minWidth: '2.5rem',
                width: "fit-content",
                // border: '1px solid',
                borderRadius: "0.25rem",
                borderColor: date.isToday() ? theme.palette.primary.main : '#3d3d3d',
                backgroundColor: date.isToday() ? theme.palette.primary.main : theme.palette.background.paper,
                fontSize: isMobile ? "0.75rem" : "0.75rem",
                color: date.isToday() ? theme.palette.primary.contrastText : theme.palette.text.primary
              }}
              label={`${date.format('D')}`}
            />
            <p style={{
              fontWeight: 700,
              fontSize: isMobile ? '0.7rem' : '0.85rem',
              textTransform: "uppercase",
              color: theme.palette.text.primary,
              margin: 0
            }}>
              {date.format('ddd')}
            </p>
          </>
        </ButtonBase >
      ) : (
        <ButtonBase
          component="a"
          onClick={(e) => Calendar.gotoDate(date)}
          ref={calDayRef}
          className='flex between top left'
          disableRipple
          sx={{
            position: 'relative',
            display: 'flex',
            fontFamily: theme.typography.fontFamily,
            alignItems: 'flex-start',
            padding: "1rem 0.5rem",
            height: '100%',
            textAlign: "left",
            marginBottom: 0,
            top: '0rem',
            backgroundColor: reducedAllDayStack && reducedAllDayStack.length === 0 ? 'transparent' : theme.palette.background.paper,
            width: "100%",
            marginTop: "1rem",
            borderRight: `1px solid ${theme.palette.divider}`,

          }}
        >

          {reducedAllDayStack && reducedAllDayStack.map((event: Event, i: number) => {

            if (!event) {
              return;
            }

            if (!event.end_date) {
              return null;
            }
            else if (event.end_date && (event.end_date.diff(event.date, 'd') === 0)) {
              return null;
            }

            const isLeftOffset = true;

            return (
              <>
                <MultiDayEventBlock
                  i={i}
                  DayInMonthRef={calDayRef}
                  key={`${event.id()}`}
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
                    position: 'absolute',
                    top: `calc(${i} * 1.525rem)`,
                    marginLeft: isLeftOffset ? "3.5rem" : "0.75rem",
                    gutter: "-0.15rem",
                    spacing: "0.5rem"
                  }}
                />


              </>
            )
          })}


          <div className="column compact3"
            style={{
              position: 'relative',
              width: "100%",
              paddingLeft: "0rem",
              paddingRight: "0rem",
              marginTop: "-1rem"
              // paddingTop: `calc(0.05rem + (${calendarDay.stack.length} * 1.525rem))`,
            }}
          >


            {reducedAllDayStack && reducedAllDayStack.map((event: Event, i: number) => {

              console.log({ i, event })

              if (!event) {
                return null;
              }

              if (event instanceof Hours) {
                return null;
              }

              const isLeftOffset = true

              if ((event.date && event.end_date) && (event.end_date.diff(event.date, 'd') > 0)) {
                return null;
              }

              if (!event.date) {
                return (
                  <ScheduleBlock
                    key={`${event.id()}`}
                    column={date.day()}
                    isStacked={true}
                    date={date}
                    referenceTime={6}
                    event={event}
                    standardHeight={standardHeight}
                    handleView={handleView}
                    handleCreate={handleCreate}
                    handleSelect={handleSelect}
                    handleDragStart={handleDragStart}
                    source={source}
                    swap={swap}
                    style={{
                      position: "absolute",
                      top: `calc(${i} * 1.525rem)`,
                      marginLeft: isLeftOffset ? "2.75rem" : "0.75rem",
                      width: isLeftOffset ? "calc(100% - 2.75rem)" : "100%",
                      gutter: 0
                    }}
                  />
                )
              }

              return (
                <>
                  <MultiDayEventBlock
                    i={i}
                    DayInMonthRef={calDayRef}
                    key={`${event.id()}`}
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
                      position: 'absolute',
                      top: `calc(${i} * 1.525rem)`,
                      marginLeft: isLeftOffset ? "3rem" : "0.75rem",
                      gutter: "-0.15rem",
                      spacing: "0.5rem"
                    }}
                  />


                </>
              )

            })}
          </div>
          <div className="column left">
          <Chip
            sx={{
              // marginRight: '0.5rem',
              fontWeight: 700,
              width: "fit-content",
              // border: '1px solid',
              fontSize: "1.75rem",
              borderRadius: "0.25rem",
              borderColor: date.isToday() ? theme.palette.primary.main : '#3d3d3d',
              backgroundColor: 'transparent',
              color: date.isToday() ? theme.palette.primary.main : theme.palette.text.primary,
              textAlign: "left",
              '& span': {
                padding: 0
              }
            }}
            label={`${date.format('D')}`}
          />
          </div>
        </ButtonBase>
      )
      }
    </>
  )
}