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
import Chronos from '@/lib/utils/chronos';
import dayjs from '@/lib/utils/dayjs';
import { Event, EventData, Member, MemberFactory, Profile, Schedule } from "@/schema";
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { Dayjs } from 'dayjs';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps, DragMode } from './DraggableEventBlock';
import DayViewHeader from './DayViewHeader';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import WeekLegendColumn from './WeekLegendColumn';
import DayInMonthView from './DayInMonthView';
import useViewEvent from '@/lib/global/useViewEvent';

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

    const { block, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(null, standardHeight, null, handleUpOnMove, handleUpOnCreate);


    const handleDayTimeClick = (e: MouseEvent) => {
        const RIGHT_CLICK = 2;
        if (e.button === RIGHT_CLICK) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', "Fri", "Sat"];

    const RightSidebar = (
        <div className='column snug'
            style={{ overflowY: "scroll", backgroundColor: theme.palette.background.paper }}
            onMouseUp={handleMouseUp}
        >
            <div className="column"
                style={{
                    position: 'fixed',
                    top: 0,
                    padding: "1rem",
                    zIndex: 4,
                    backgroundColor: theme.palette.background.default,
                    width: "25rem"
                }}
            >
                {peekDate && weekOfPeekDate && (
                    <div style={{
                        width: "100%",
                        height: "4.5rem",
                        zIndex: 3
                    }}>
                        <Tabs value={peekDate.yyyymmdd()} onChange={handleTabChange} variant="fullWidth" sx={{ height: "100%" }}>
                            {weekOfPeekDate.map((theDate: Dayjs, index) => (
                                <Tab icon={<Typography sx={{ fontSize: "0.75rem" }}>{theDate.format("ddd")}</Typography>} sx={{ minWidth: "unset" }} key={theDate.yyyymmdd()} label={theDate.format("DD")} value={theDate.yyyymmdd()} {...a11yProps(index)} />
                            ))}
                        </Tabs>
                    </div>
                )}
            </div>
            {block ? (
                <div
                    onMouseMove={(e) => handleMouseMove(e, { hoverOverPreview: true })}
                    key="moving-event-block"
                    className="event-block"
                    style={{
                        display: block.display,
                        position: 'absolute',
                        zIndex: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.5),
                        top: block ? `${block.top}px` : 0,
                        width: "20rem",
                        height: block ? block.height : 0,
                        left: "5rem",
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        color: theme.palette.primary.contrastText,
                    }}
                >
                    <span style={{ fontSize: '0.75rem', margin: 0, height: "fit-content" }}>
                        {block.name && <><span style={{ fontWeight: 700 }}>{block.name && block.name}</span> <br /></>}
                        {block.currStart.print(false, 5)} - {block.currEnd.print(false, 5)}
                    </span>
                </div>
            ) : (
                <></>
            )}
            <div className="flex compact2" style={{ width: "100%", padding: "0 1rem 1rem 1rem" }}
                ref={container}
            >
                {peekDate && sequence && Events.days && (
                    <>
                        <TimeLegendColumn
                            key="timeLegendColumn"
                            width={TIME_LEGEND_COLUMN_WIDTH}
                            Calendar={Calendar}
                            sequence={sequence}
                            standardHeight={standardHeight}
                            isSM={false}
                        />
                        {EventPopover}
                        <DayView
                            index={peekDate.day()}
                            key={`${peekDate.format("YYYYMMDD")}`}
                            style={{
                                width: "100%"
                            }}
                            date={peekDate}
                            sequence={sequence}
                            // handleCreate={handleCreate}
                            calendarDay={Events.days.getOrCreate(peekDate.yyyymmdd())}
                            nextCalendarDay={Events.days.getOrCreate(peekDate.add(1, 'day').yyyymmdd())}
                            standardHeight={standardHeight}
                            handleDragStart={handleDragStart}
                            handleMouseMove={handleMouseMove}
                            handleView={handleOpenEventPopover}
                            source={source}
                            swap={Events.swap}
                            replace={Events.update}

                        // selected={selected}
                        // handleSelect={handleSelect}
                        // handleDayTimeClick={handleDayTimeClick}
                        />
                    </>
                )}
            </div>
        </div>
    )


    return (
        <>
            <div style={{ width: "100%", height: "fit-content" }}>
                <div
                    className="column"
                    style={{ padding: "0 0", position: "relative" }}
                    ref={calendarRef}
                    onMouseUp={handleMouseUp}
                >
                    <div
                        className='flex snug'
                        style={{
                            position: 'absolute',
                            top: "3.55rem",
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        <Button sx={{ position: "absolute", left: 0 }} startIcon={<ChevronLeft />} onClick={() => Calendar.goToStartOfMonth(Calendar.days[0].add(-1, 'day'))}></Button>
                        <Button sx={{ position: "absolute", right: 0 }} startIcon={<ChevronRight />} onClick={() => Calendar.goToStartOfMonth(Calendar.days[6].add(1, 'month'))}></Button>
                        {daysOfWeek.map(day => {
                            return (
                                <div key={day} className='flex center middle' style={{ width: "calc(100% / 7)", height: "2rem" }}>
                                    <Typography sx={{
                                        fontSize: "0.75rem",
                                        textTransform: 'uppercase',
                                        textAlign: "center",
                                        color: darken(theme.palette.text.primary, 0.2),
                                        letterSpacing: "15%"
                                    }}>{day}</Typography>
                                </div>
                            )
                        })}
                    </div>
                    <div {...handlers} style={{
                        display: "flex",
                        alignItems: 'flex-start',
                        width: '100%',
                        margin: "5.55rem 0 0 0", // reduced top margin
                        flexWrap: 'wrap'
                    }}>
                        <>
                            <div style={{ display: 'flex', width: `100%`, flexWrap: "wrap", border: `0.05px solid ${theme.palette.divider}`, height: "calc(100vh - 5.55rem)" }}>
                                {Calendar.days.map((date, index: number) => {
                                    return (
                                        <DayInMonthView
                                            index={date.day()}
                                            key={`${source ? source.id() : 'no_source_week_view'}-${date.format('YYYYMMDD')}-monthView`}
                                            style={{
                                                width: "calc(100% / 7)",
                                                height: "calc(100% / 5)"
                                            }}
                                            date={date}
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
                                            Calendar={Calendar}
                                            source={source}
                                            onClick={() => {
                                                console.log("DayInMonthView")
                                                setPeekDate(date);
                                                setWeekOfPeekDate(date.startOf('week').getFrame(7));
                                                setIsRightSidebarOpen(true);
                                            }}
                                            swap={Events.swap}
                                        />
                                    );
                                })}

                            </div>
                        </>
                    </div>
                </div>
            </div >
            <Drawer
                anchor="right"
                open={isRightSidebarOpen}
                onClose={() => setIsRightSidebarOpen(false)}
                keepMounted
                sx={{
                    zIndex: "2000",
                    '& .MuiDrawer-paper': {
                        position: 'absolute',
                        width: '25rem',
                        // padding: "0.5rem 0.5rem"
                    },
                }}
            >
                {RightSidebar}
            </Drawer>
        </>
    );
};

export default MobileMonthView;