'use client';
import { ArrowRight, ChevronLeft, ChevronRight, CloseOutlined, Delete, EventNoteTwoTone, Remove } from '@mui/icons-material';
import {
    alpha,
    Button,
    ButtonBase,
    Chip,
    darken,
    Drawer,
    IconButton,
    Link,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, SetStateAction, MouseEvent, useMemo, memo, Dispatch } from 'react';
import TimeLegendColumn from './TimeLegendColumn';
import DayView from '@/components/calendar/DayView';
import CalendarDay from '@/lib/CalendarDay';
import useCalendar, { UseCalendar } from '@/lib/useCalendar';
import { Event, EventData, Member, MemberFactory, Profile, Schedule, Chronos, dayjs, Dayjs } from '@jstiava/chronos';
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps, DragMode } from './DraggableEventBlock';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import WeekLegendColumn from './WeekLegendColumn';
import DayInMonthView from './DayInMonthView';
import useViewEvent from '@/lib/global/useViewEvent';
import Divider from '../Divider';

interface MobileMonthViewProps {
    selected: Event[] | null;
    setSelected: Dispatch<React.SetStateAction<Event[] | null>>;
    Preferences: UsePreferences;
    handleSelect: (e: MouseEvent, event: Event) => void;
    source: Member | null,
    Calendar: UseCalendar,
    days: any;
    handleCreate: StartCreator;
    handleView: any;
    Events: UseEvents;
    schedule?: Partial<Schedule>;
}

const MobileMonthView = ({
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
}: MobileMonthViewProps) => {
    
    const theme = useTheme();
    const isSmall = useMediaQuery("(max-width: 90rem)");
    const TIME_LEGEND_COLUMN_WIDTH = isSmall ? '4rem' : '4.5rem';
    const calendarRef = useRef<HTMLDivElement>(null);
    const [standardHeight, setStandardHeight] = useState(40);

    const { EventPopover, handleOpenEventPopover } = useViewEvent(
        source,
        Events,
        handleCreate,
        theme
    );
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [peekDate, setPeekDate] = useState<Dayjs | null>(dayjs());
    const [weekOfPeekDate, setWeekOfPeekDate] = useState<Dayjs[] | null>(dayjs().startOf('week').getFrame(7));
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setPeekDate(dayjs(String(newValue)));
    };
    const container = useRef(null);
    const [sequence, setSequence] = useState<number[] | null>(null);

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    useEffect(() => {
        const start = 6;
        const increment = 0.5;
        const end = 30;
        const length = Math.floor((end - start) / increment) + 1;
        setSequence(Array.from({ length }, (_, index) => start + index * increment));
    }, []);

    const handlers = useSwipeable({
        onSwipedRight: () => {
            Calendar.prev()
            // Perform your action here
        },
        onSwipedLeft: () => {
            Calendar.next();
        }
    });

    const isLg = useMediaQuery(theme.breakpoints.down('lg'));

    const handleUpOnMove = async (item: DraggedEventBlockProps) => {
        if (!item.uuid) {
            return;
        }
        const theEvent = await Events.get(item.uuid);
        if (!theEvent || theEvent instanceof Array) {
            return;
        }

        await MemberFactory.getMetadata(theEvent)
            .then(object => {
                Events.swap(object);
            })
            .catch(err => {
                console.log(err)
            });


        theEvent.start_time = item.currStart.getDayjs(5).toLocalChronos();
        theEvent.end_time = item.currEnd.getDayjs(5).toLocalChronos();
        theEvent.date = item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day') : item.dragDay;
        theEvent.is_local = true;

        handleCreate(Type.Event, Mode.Modify, theEvent);
    }

    const handleUpOnCreate = async (item: DraggedEventBlockProps) => {

        if (!item.dragDay.isSame(item.dragEndDay)) {

            // const newSchedule = Schedule.createOffDrag(
            //   item.dragDay,
            //   item.dragEndDay,
            //   item.currStart.getDayjs(5).toLocalChronos(),
            //   item.currEnd.getDayjs(5).toLocalChronos()
            // ).eject();

            // const presets: Partial<MerchantData> = {
            //   schedules: [newSchedule]
            // }

            // handleCreate(Type.Merchant, Mode.Create, {
            //   ...new Merchant(presets, true).eject(),
            //   callback: Events.addEvent
            // });

            const presets = {
                date: item.dragDay.yyyymmdd(),
                end_date: item.dragEndDay.yyyymmdd()
            }


            handleCreate(Type.Event, Mode.Create, new Event(presets));

            return;
        }

        const presets: Partial<EventData> = {
            date: item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day').yyyymmdd() : item.dragDay.yyyymmdd(),
            start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
            end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
            is_local: true
        }

        handleCreate(Type.Event, Mode.Create, new Event(presets), {
            callback: Events.add
        });
    }

    const { blocks, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(standardHeight, null, handleUpOnMove, handleCreate);


    const handleDayTimeClick = (e: MouseEvent) => {
        const RIGHT_CLICK = 2;
        if (e.button === RIGHT_CLICK) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', "Fri", "Sat"];

    return (
    <>
      <div
        className="column snug"
        style={{ padding: "0 0" }}
        ref={calendarRef}
        onMouseUp={handleMouseUp}
      >
        <div className="flex snug left" style={{
          position: 'sticky',
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 5,
          borderBottom: `0.1rem solid ${theme.palette.divider}`
        }}>

          <div
            className='flex snug'
            style={{
              position: 'relative',
              width: '100%'
            }}
          >
            {/* <Button
              sx={{ position: "absolute", left: 0, color: theme.palette.text.primary }}
              startIcon={<ChevronLeft />}
              onClick={() => Calendar.goToStartOfMonth(Calendar.days[0].add(-1, 'day'))}></Button>
            <Button
              sx={{ position: "absolute", right: 0, color: theme.palette.text.primary }}
              endIcon={<ChevronRight />}
              onClick={() => Calendar.goToStartOfMonth(Calendar.days[6].add(1, 'month'))}></Button> */}
            {daysOfWeek.map(day => {
              return (
                <div key={day} className='flex center middle' style={{ width: "calc(100% / 7)", height: "2rem" }}>
                  <Typography sx={{
                    fontSize: "0.75rem",
                    textTransform: 'uppercase',
                    textAlign: "center",
                    color: darken(theme.palette.text.primary, 0.2),
                    letterSpacing: "0.1rem",
                    fontWeight: 800
                  }}>{day}</Typography>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex left snug"
          style={{
            width: "100%"
          }}
        >

          <div {...handlers} style={{
            display: "flex",
            alignItems: 'flex-start',
            width: `100%`,
            flexWrap: 'wrap'
          }}>
            <>
              <div style={{
                display: 'flex',
                width: `100%`,
                flexWrap: "wrap",
                // border: `0.05px solid ${theme.palette.divider}`, 
                height: "calc(100vh - 6rem)"
              }}>
                {Calendar.days.map((date, index: number) => {

                  const calendarDay = days.getOrCreate(
                    Number(date.format('YYYYMMDD')),
                    () => new CalendarDay(date.yyyymmdd()),
                  );

                  const nextCalendarDay = days.getOrCreate(
                    Number(date.add(1, 'day').format('YYYYMMDD')),
                    () => new CalendarDay(date.add(1, 'day').yyyymmdd()));
                  return (
                    <div
                      className="flex snug"
                      key={String(`${date.yyyymmdd()}-${calendarDay.version}-${nextCalendarDay.version}`)}
                      style={{
                        height: "calc(100% / 5)",
                        width: "calc(100% / 7)",
                      }}
                    >
                      <DayInMonthView
                        index={date.day()}
                        style={{
                          width: "calc(100% - 0.1rem)",
                          height: "100%",
                          borderBottom: `0.1rem solid ${theme.palette.divider}`,
                        }}
                        date={date}
                        handleCreate={handleCreate}
                        calendarDay={calendarDay}
                        nextCalendarDay={nextCalendarDay}
                        standardHeight={standardHeight}
                        handleDragStart={handleDragStart}
                        handleMouseMove={handleMouseMove}
                        handleView={handleOpenEventPopover}
                        selected={selected}
                        handleSelect={handleSelect}
                        handleDayTimeClick={handleDayTimeClick}
                        Calendar={Calendar}
                        source={source}
                        onClick={() => {
                          setPeekDate(date);
                          setWeekOfPeekDate(date.startOf('week').getFrame(7));
                          setIsRightSidebarOpen(true);
                        }}
                        swap={Events.swap}
                      />
                      <Divider vertical />
                    </div>
                  );
                })}

              </div>
            </>
          </div>

        </div>
      </div>

      {EventPopover}
    </>
  );
};

export default MobileMonthView;