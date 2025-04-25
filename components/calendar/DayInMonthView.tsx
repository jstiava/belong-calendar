'use client';
import {
  Typography,
  useTheme,
  Chip,
  Button,
  IconButton,
  ButtonBase,
  Popover,
} from '@mui/material';
import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
} from 'react';
import { CalendarEventBox } from '@/components/events/EventBlock';
import dayjs from '@/lib/utils/dayjs';
import { Event, Member } from '@/schema';
import { Mode, Type } from '@/types/globals';
import { AddOutlined, BugReportOutlined, CopyAllOutlined, PlayArrow } from '@mui/icons-material';
import { StartViewer } from '@/lib/global/useView';
import { Hours } from '@/lib/utils/medici';
import { MomentBlock } from '../events/MomentBlock';
import { UseCalendar } from '@/lib/useCalendar';
import { MultiDayEventBlock } from '../events/MultiDayEventBlock';
import { ScheduleBlock } from '../events/ScheduleBlock';
import { UseSession } from '@/lib/global/useSession';
import CalendarDayRendered from '@/lib/CalendarDayRendered';
import { isMoment, isSingleTimeEvent } from '@/lib/CalendarDays';
import CalendarDay from '@/lib/CalendarDay';



const CalendarDayTimeSlot = ({
  time,
  handleMouseDown,
  handleMouseMove,
  handleDayTimeClick,
  standardHeight,
  onContextMenu,
  isPast = false,
}: {
  time: number;
  handleMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
  handleMouseMove?: (e: MouseEvent<HTMLDivElement>) => void;
  handleDayTimeClick?: (e: MouseEvent<HTMLDivElement>) => void;
  standardHeight: number;
  onContextMenu?: any;
  isPast?: boolean;
}) => {


  const theme = useTheme();

  const color = time % 1 == 0 ? theme.palette.text.secondary : theme.palette.action.disabled;
  return (
    <>
      <div
        data-type="emptyEvent"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onContextMenu={onContextMenu}
        style={{
          display: 'flex',
          position: 'relative',
          color: 'grey',
          fontSize: '0.875rem',
          height: standardHeight,
          borderBottom: '1px solid',
          borderColor: color,
          alignItems: 'start',
          // marginRight: '0.5rem',
          width: "100%",
          opacity: isPast ? 0.5 : 1,
          // backgroundColor: "grey"
        }}
      >
        {/* <span style={{ position: "relative", color: "lightGrey", fontSize: "0.7rem", height: 0, padding: 0, margin: 0 }}>{new Chronos(time - 0.5).getHMN()}</span> */}
      </div>
    </>
  );
};

function DayInMonthView({
  index,
  style,
  date,
  handleCreate,
  calendarDay,
  nextCalendarDay,
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
  style: any
  date: dayjs.Dayjs;
  calendarDay: CalendarDay | null;
  nextCalendarDay: CalendarDay | null;
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
        if (!event.start_time || !event.date) {
          continue;
        }
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
          startOffset.push(null);
          continue;
        }
        if (index === 0) {
          result.push(item);
          continue;
        }
        result.push(item);
      }

      console.log({
        date: date.yyyymmdd(),
        theCalendarDayRendered,
        calendarDay
      })


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
    <>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: "15rem", borderRadius: "1rem", overflow: "hidden" }}>
          <Button
            onClick={() => {
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<CopyAllOutlined />}>Copy</Button>
          <Button
            onClick={() => {
              console.log({
                calendarDay,
                date,
                index,
                reducedAllDayStack
              })
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<BugReportOutlined />}>Debug</Button>
        </div>
      </Popover>
      <ButtonBase
        disableRipple
        component="a"
        className='column snug top'
        sx={{
          position: "relative",
          userSelect: 'none',
          margin: 0,
          height: "100%",
          border: `0.05px solid ${theme.palette.divider}`,
          backgroundColor: (source instanceof Event && (source.date && source.end_date)) ? (date.isAfter(source.date.add(-1, 'day'), 'd') && date.isBefore(source.end_date.add(1, 'day'), 'date')) ? 'transparent' : theme.palette.divider : 'transparent',
          // opacity: isPast ? 0.5 : 1,
          ...style,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onContextMenu={(e) => handleRightClick(e)}
        onClick={(e) => {
          if (onClick) {
            onClick();
            return;
          }
          if (!handleCreate) {
            console.log("No creator")
            return;
          }
          handleCreate(Type.Event, Mode.Create, {
            date: date.yyyymmdd(),
            start_time: dayjs().toLocalChronos().getHMN(),
            end_time: dayjs().toLocalChronos().add(1).getHMN()
          })
        }}
        ref={calDayRef}
      >
        {isHovering && (
          <div
            className='flex center middle compact'
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              padding: "0.5rem",
              width: "fit-content",
              zIndex: 5
            }}>
            <IconButton size='small' onClick={
              (e) => {
                e.stopPropagation();
                if (!handleCreate) {
                  console.log("No creator on add button.")
                  return;
                }
                handleCreate(Type.Event, Mode.Create, new Event({
                  date: date.yyyymmdd(),
                  start_time: String(9),
                  end_time: String(10)
                }, true))
              }}>
              <AddOutlined fontSize='small' />
            </IconButton>
          </div>
        )}
        <Chip
          sx={{
            display: 'flex',
            position: 'absolute',
            top: `calc(0.1rem + calc(${calendarDayRendered.topOffset} * 1.525rem))`,
            left: "0",
            fontWeight: 700,
            width: '1.55rem',
            textAlign: "center",
            margin: "0 0.15rem",
            fontSize: "0.85rem",
            height: "1.55rem",
            border: '1px solid',
            borderRadius: "0.15rem",
            borderColor: date.isToday() ? theme.palette.primary.main : theme.palette.divider,
            backgroundColor: date.isToday() ? theme.palette.primary.main : 'transparent',
            color: date.isToday() ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.text.primary,
            overflow: 'visible',
            '& span': {
              padding: 0
            }
          }}
          onClick={(e) => {
            Calendar.gotoStartOfWeek(date);
          }}
          label={`${date.format('D')}`}
        />
        <div
          style={{
            position: 'relative',
            height: "100%",
            padding: "0.1rem 0",
            width: "100%"
          }}
        >
          <div
            className='column compact3'
            style={{
              position: 'relative',
              width: "100%",
              paddingLeft: "0rem",
              paddingRight: "0rem",
              paddingTop: `calc(0.05rem + (${calendarDayRendered.stack.length} * 1.5rem))`,
            }}>

            {/* {!reducedAllDayStack || reducedAllDayStack.length === 0 && (
              <div style={{
                height: "1.4rem"
              }}></div>
            )} */}

            {reducedAllDayStack && reducedAllDayStack.map((event, i) => {

              const isLeftOffset = calendarDayRendered.topOffset === i;

              if (!event) {
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
                      marginLeft: isLeftOffset ? "2.25rem" : "0rem",
                      width: isLeftOffset ? "calc(100% - 2.25rem)" : "100%"
                    }}
                  />
                )
              }

              if (!event.date.isSame(date, 'd') && index != 0) {
                return <></>;
              }

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
                    marginLeft: isLeftOffset ? "2.25rem" : "0.15rem",
                    gutter: "-0.15rem",
                  }}
                />
              )

            })}

            <div className="column snug" style={{
              overflow: "hidden"
            }}>
              {events.map((event, i) => {

                const isLeftOffset = i === calendarDayRendered.topOffset - calendarDayRendered.stack.length;

                const isOverflow = (reducedAllDayStack.length + i) > 7;
                if (isOverflow) {
                  return null;
                }

                try {

                  if (isMoment(event)) {
                    return (
                      <MomentBlock
                        key={`${event.id()}`}
                        isStacked={true}
                        column={index}
                        referenceTime={6}
                        event={event}
                        standardHeight={standardHeight}
                        handleView={handleView}
                        handleCreate={handleCreate}
                        handleSelect={handleSelect}
                        handleDragStart={handleDragStart}
                        isSelected={!selected ? false : selected.some((item) => item.uuid === event.uuid)}
                        swap={swap}
                      />
                    )
                  }

                  if (isSingleTimeEvent(event)) {
                    return (
                      <CalendarEventBox
                        key={`${event.id()}`}
                        isStacked={true}
                        column={index}
                        referenceTime={6}
                        event={event}
                        standardHeight={standardHeight}
                        handleView={handleView}
                        handleCreate={handleCreate}
                        handleSelect={handleSelect}
                        handleDragStart={handleDragStart}
                        isSelected={!selected ? false : selected.some((item) => item.uuid === event.uuid)}
                        source={source}
                        swap={swap}
                        style={{
                          marginLeft: isLeftOffset ? "2.25rem" : "0rem",
                          width: isLeftOffset ? "calc(100% - 2.25rem)" : "100%"
                        }}
                      />
                    )
                  }

                  return (
                    <ScheduleBlock
                      isStacked={true}
                      column={i}
                      key={`${event.id()}`}
                      referenceTime={6}
                      date={date}
                      event={event}
                      standardHeight={standardHeight}
                      handleView={handleView}
                      handleCreate={handleCreate}
                      handleSelect={(e, event) => {
                        return;
                      }}
                      handleDragStart={handleDragStart}
                      source={source}
                      swap={swap}
                      style={{
                        marginLeft: isLeftOffset ? "2.1rem" : "0rem",
                        width: isLeftOffset ? "calc(100% - 2.1rem)" : "100%"
                      }}
                    />
                  )


                }
                catch (err) {
                  console.log(err);
                  return null;
                }
              })}
            </div>

          </div>

          {/* {date.isInDayView(6) && <Now standardHeight={standardHeight} />} */}

        </div>
      </ButtonBase >
    </>
  );
}

export default DayInMonthView;
