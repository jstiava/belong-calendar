'use client';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect, useRef, MouseEvent, Dispatch } from 'react';
import TimeLegendColumn from './TimeLegendColumn';
import DayView from '@/components/calendar/DayView';
import CalendarDay from '@/lib/CalendarDay';
import { UseCalendar } from '@/lib/useCalendar';
import Chronos from '@/lib/utils/chronos';
import { Event, EventData, Member, MemberFactory, Schedule } from "@/schema";
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps } from './DraggableEventBlock';
import DayViewHeader from './DayViewHeader';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import { CalendarDays } from '@/lib/CalendarDays';

interface WeekViewProps {
  containerRef: React.RefObject<HTMLElement>;
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

    await MemberFactory.fetchMetadata(theEvent)
      .then(object => {
        Events.swap(object);
      })
      .catch(err => {
        console.log(err)
      });


    const copy = new Event(theEvent.copy());

    copy.start_time = item.currStart.getDayjs(5).toLocalChronos();
    copy.end_time = item.currEnd.getDayjs(5).toLocalChronos();
    copy.date = item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day') : item.dragDay
    copy.is_local = true;

    const token = await MemberFactory.login(copy, source);
    handleCreate(Type.Event, Mode.Modify, copy);
  }

  const handleUpOnCreate = async (item: DraggedEventBlockProps) => {

    if (!item.dragDay.isSame(item.dragEndDay, 'date')) {

      const presetSchedule = Schedule.createOffDrag(item.dragDay, item.dragEndDay, new Chronos(item.currStart.getHMN(15)), new Chronos(item.currEnd.getHMN(15)));

      const presets: Partial<EventData> = {
        date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        schedules: [presetSchedule.eject()],
        is_local: true
      }

      handleCreate(Type.Event, Mode.Create, new Event(presets), {
        callback: Events.add
      });

      return;
    }

    const presets: Partial<EventData> = {
      uuid: null,
      date: item.currStart.getHMN() < 6 ? item.dragDay.add(1, 'day').yyyymmdd() : item.dragDay.yyyymmdd(),
      end_date: item.dragDay.isSame(item.dragEndDay, 'date') ? null : item.currEnd.getHMN() < 6 ? item.dragEndDay.add(1, 'day').yyyymmdd() : item.dragEndDay.yyyymmdd(),
      start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
      end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
      is_local: true
    }

    handleCreate(Type.Event, Mode.Create, new Event(presets));
  }

  const { block, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(containerRef, standardHeight, containerRef, handleUpOnMove, handleUpOnCreate);


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

  return (
    <>
      <div style={{ width: "100%", height: "fit-content" }}>
        <div
          className="column"
          style={{ padding: "0 0.5rem" }}
          ref={calendarRef}
          onMouseUp={handleMouseUp}
        >
          <div
            style={{
              display: "flex",
              position: "fixed",
              top: "3.55rem",
              width: Preferences.isSidebarDocked ? "calc(100% - 20rem)" : "100%",
              padding: "0 0.5rem 0 0",
              backgroundColor: theme.palette.background.paper,
              zIndex: 10
            }}>
            <div
              style={{
                position: isSM ? 'absolute' : 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '10rem',
                width: TIME_LEGEND_COLUMN_WIDTH,
                margin: 0,
                justifyContent: 'flex-start'
              }}
            >
              <Button size="small" onClick={Calendar.prev} aria-label="Go to Previous Week" startIcon={<ChevronLeft fontSize='small' />}>Prev</Button>
              <Button size="small" onClick={Calendar.next} aria-label="Go to Next Week" endIcon={<ChevronRight fontSize='small' />}>Next</Button>
            </div>

            <div style={{ display: 'flex', width: `calc(100% - ${isSM ? "0rem" : TIME_LEGEND_COLUMN_WIDTH})`, paddingRight: "0.5rem" }}>
              {Calendar.days.map((date, index) => {
                return (
                  <div key={`${date.format("YYYYMMDD")}-weekView`} style={{ width: "calc(100% / 7)" }}>
                    <DayViewHeader
                      date={date}
                      index={index}
                      Calendar={Calendar}
                      calendarDay={days.getOrCreate(date.yyyymmdd())}
                      standardHeight={standardHeight}
                      handleDragStart={handleDragStart}
                      handleView={handleView}
                      selected={selected}
                      handleSelect={handleSelect}
                      source={source}
                      handleCreate={handleCreate}
                      swap={Events.swap}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          {RenderedBlock}
          <div {...handlers} style={{ display: "flex", alignItems: 'flex-start', width: '100%', margin: "8rem 0 4rem 0", position: "relative" }}>
            <>
              {sequence && (
                <>
                  <TimeLegendColumn
                    key="timeLegendColumn"
                    isSM={isSM}
                    width={TIME_LEGEND_COLUMN_WIDTH}
                    Calendar={Calendar}
                    sequence={sequence}
                    standardHeight={standardHeight}
                  />
                  <div style={{ display: 'flex', width: `calc(100% - ${isSM ? "0rem" : TIME_LEGEND_COLUMN_WIDTH})` }}>
                    {Calendar.days.map(date => {
                      return (
                        <DayView
                          index={date.day()}
                          key={`${source ? source.id() : 'no_source_week_view'}-${date.format('YYYYMMDD')}-weekView`}
                          style={{
                            width: "100%"
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
                </>
              )}
            </>
          </div>
        </div>
      </div >
    </>
  );
};

export default WeekView;