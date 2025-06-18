'use client';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Button,
  ButtonBase,
  darken,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect, useRef, MouseEvent, Dispatch } from 'react';
import TimeLegendColumn from './TimeLegendColumn';
import DayView from '@/components/calendar/DayView';
import CalendarDay from '@/lib/CalendarDay';
import { UseCalendar } from '@/lib/useCalendar';

import { Event, EventData, Member, MemberFactory, Schedule, Chronos } from '@jstiava/chronos';
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps } from './DraggableEventBlock';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import { CalendarDays } from '@/lib/CalendarDays';
import { DIVIDER_NO_ALPHA_COLOR } from '../Divider';
import DayHeader from './DayHeader';
import { useDraggable } from '@dnd-kit/core';

interface WeekViewProps {
  selected: Event[] | null;
  setSelected: Dispatch<React.SetStateAction<Event[] | null>>;
  Preferences: UsePreferences;
  handleSelect: (e: MouseEvent, event: Event) => void;
  source: Member | null,
  Calendar: UseCalendar,
  days: CalendarDays<CalendarDay>;
  handleCreate: StartCreator;
  handleView: any;
  Events: UseEvents;
  schedule?: Partial<Schedule>;
}

const WeekView = ({
  selected,
  setSelected,
  Preferences,
  handleSelect,
  source,
  Calendar,
  days,
  handleCreate,
  handleView,
  Events
}: WeekViewProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery("(max-width: 90rem)");
  const TIME_LEGEND_COLUMN_WIDTH = isSmall ? '4rem' : '4.5rem';
  const calendarRef = useRef<HTMLDivElement>(null);
  const [standardHeight, setStandardHeight] = useState(40);

  const handlers = useSwipeable({
    onSwipedRight: () => {
      Calendar.prev()
    },
    onSwipedLeft: () => {
      Calendar.next();
    }
  });


  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUpOnMove = async (item: DraggedEventBlockProps) => {
    if (!item.uuid || !source) {
      return;
    }
    const theEvent = await Events.get(item.uuid);
    if (!theEvent || theEvent instanceof Array) {
      return;
    }

    // await MemberFactory.fetchMetadata(theEvent)
    //   .then(object => {
    //     Events.swap(object);
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   });


    const copy = theEvent.copy();

    copy.start_time = item.currStart.getDayjs(5).toLocalChronos();
    copy.end_time = item.currEnd.getDayjs(5).toLocalChronos();
    copy.date = item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day') : item.dragDay
    copy.is_local = true;

    const token = await MemberFactory.login(copy, source);
    handleCreate(Type.Event, Mode.Modify, copy);
  }

 

  const { blocks, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(standardHeight, null, handleUpOnMove, handleCreate);

  const [sequence, setSequence] = useState<number[] | null>(null);

  useEffect(() => {
    const start = 6;
    const increment = 0.5;
    const end = 30;
    const length = Math.floor((end - start) / increment) + 1;
    setSequence(Array.from({ length }, (_, index) => start + index * increment));
  }, []);

  const handleDayTimeClick = (e: MouseEvent) => {
    const RIGHT_CLICK = 2;
    if (e.button === RIGHT_CLICK) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', "Fri", "Sat"];

  if (!sequence) {
    return null;
  }

  return (
    <>
      <div
        className="column snug"
        style={{ padding: "0 0rem" }}
        ref={calendarRef}
        onMouseUp={handleMouseUp}
      >
        <div className="flex snug left" style={{
          position: 'sticky',
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 5,
          borderBottom: `0.1rem solid ${theme.palette.divider}`,
          height: 'fit-content'
          // height: "2.5rem"
        }}>

          <div className="flex center middle" style={{
            width: "5rem",
            padding: "0.25rem",
            borderRight: `0.1rem solid ${theme.palette.divider}`,
          }}>
            <Typography variant='h6' sx={{
              fontSize: "0.75rem",
            }}>Legend</Typography>
          </div>

          <div
            className='flex snug top'
            style={{
              position: 'relative',
              width: 'calc(100% - 5rem)',
              height: 'fit-content'
            }}
          >
            <Button
              sx={{ position: "absolute", left: 0, top: "0.35rem", color: theme.palette.text.primary }}
              startIcon={<ChevronLeft />}
              onClick={() => Calendar.gotoStartOfWeek(Calendar.days[0].add(-1, 'day'))}></Button>
            <Button
              sx={{ position: "absolute", right: 0, top: "0.35rem", color: theme.palette.text.primary }}
              endIcon={<ChevronRight />}
              onClick={() => Calendar.gotoStartOfWeek(Calendar.days[6].add(1, 'day'))}></Button>
            {Calendar.days.map(date => {
              return (
                <div className="column compact2 top" style={{
                  width: "calc(100% / 7)",
                  height: 'fit-content',
                  padding: '0.5rem 0.25rem'
                }} key={date.format("YYYYMMDD")}>


                  <div className="flex center middle compact"

                  >
                    <ButtonBase
                      sx={{
                        display: 'flex',
                        fontWeight: 700,
                        width: '1.75rem',
                        textAlign: "center",
                        margin: "0 0.15rem",
                        height: "1.75rem",
                        // border: '1px solid',
                        borderRadius: "0.15rem",
                        borderColor: date.isToday() ? theme.palette.primary.main : theme.palette.divider,
                        backgroundColor: date.isToday() ? theme.palette.primary.main : theme.palette.divider,
                        color: date.isToday() ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.text.primary,
                        overflow: 'visible',
                        '& span': {
                          padding: 0
                        }
                      }}
                      onClick={(e) => {
                        Calendar.gotoStartOfWeek(date);
                      }}
                    ><Typography sx={{
                      fontSize: "0.85rem",
                      fontWeight: 800
                    }}>{date.format('D')}</Typography></ButtonBase>
                    <Typography sx={{
                      fontSize: "0.75rem",
                      textTransform: 'uppercase',
                      textAlign: "center",
                      color: darken(theme.palette.text.primary, 0.2),
                      letterSpacing: "0.1rem",
                      fontWeight: 800
                    }}>{daysOfWeek[date.day()]}</Typography>
                  </div>


                  <DayHeader
                    index={date.day()}
                    key={`${source ? source.id() : 'no_source_week_view'}-${date.format('YYYYMMDD')}-weekView`}
                    date={date}
                    // sequence={sequence}
                    handleCreate={handleCreate}
                    calendarDay={days.getOrCreate(date.yyyymmdd())}
                    // nextCalendarDay={days.getOrCreate(date.add(1, 'day').yyyymmdd())}
                    standardHeight={standardHeight}
                    handleDragStart={handleDragStart}
                    handleMouseMove={handleMouseMove}
                    handleView={handleView}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleDayTimeClick={handleDayTimeClick}
                    swap={Events.swap}
                    source={source}
                    Calendar={Calendar}
                  // replace={Events.update}
                  />

                </div>
              )
            })}
          </div>
        </div>

        <div className="flex left snug top" data-type="dragging_interface_top">
          <div className="column snug" style={{
            width: "5rem",
            borderRight: `0.1rem solid ${theme.palette.divider}`,
          }}>
            <TimeLegendColumn
              key="timeLegendColumn"
              isSM={isSM}
              width={"100%"}
              Calendar={Calendar}
              sequence={sequence}
              standardHeight={standardHeight}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: 'flex-start',
              position: 'relative',
              width: `calc(100% - 5rem)`,
            }}>

            {RenderedBlock}
            {Calendar.days.map((date, index) => {
              return (
                <DayView
                  index={date.day()}
                  key={`${source ? source.id() : 'no_source_week_view'}-${date.format('YYYYMMDD')}-weekView`}
                  style={{
                    width: "calc(100% / 7)",
                    margin: 0,
                    borderRight: index === Calendar.days.length - 1 ? 'unset' : `0.05rem solid ${theme.palette.divider}`
                  }}
                  date={date}
                  sequence={sequence}
                  handleCreate={handleCreate}
                  calendarDay={days.getOrCreate(date.yyyymmdd())}
                  nextCalendarDay={days.getOrCreate(date.add(1, 'day').yyyymmdd())}
                  standardHeight={standardHeight}
                  handleDragStart={handleDragStart}
                  handleMouseMove={handleMouseMove}
                  handleView={handleView}
                  selected={selected}
                  handleSelect={handleSelect}
                  handleDayTimeClick={handleDayTimeClick}
                  swap={Events.swap}
                  source={source}
                  replace={Events.update}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default WeekView;