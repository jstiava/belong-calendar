'use client';
import {
  Typography,
  useTheme,
  Button,
  ButtonBase,
  Popover,
  IconButton,
} from '@mui/material';
import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
  Fragment,
} from 'react';
import { CalendarEventBox } from '@/components/events/EventBlock';
import CalendarDay from '@/lib/CalendarDay';
import { Event, Member, Hours, dayjs, Chronos, isMoment, isNotScheduled, isSingleTimeEvent } from '@jstiava/chronos';
import { Mode, Type } from '@/types/globals';
import { AddOutlined, BugReportOutlined, ContentPasteOutlined, CopyAllOutlined, PlayArrow } from '@mui/icons-material';
import { StartViewer } from '@/lib/global/useView';
import { MomentBlock } from '../events/MomentBlock';
import { SourceScheduleBlock } from '../events/SourceScheduleBlock';
import { StartCreator } from '@/lib/global/useCreate';
import CalendarDayRendered from '@/lib/CalendarDayRendered';


const Now = ({ standardHeight, startCreator }: { standardHeight: number, startCreator: StartCreator }) => {

  const theme = useTheme();
  const scrollToRef = useRef<any>(null);

  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {

    function update() {
      const now = dayjs().toLocalChronos();
      console.log("Updating at", new Date().toLocaleTimeString());
      setTop(now && now.getHMN() >= 6 && now.getHMN() < 24
        ? (now.getHMN() - (6 - 0.5)) * standardHeight * 2
        : standardHeight * 2 * 18.5 + now.getHMN() * standardHeight * 2)
    }

    if (scrollToRef.current) {
      // Start the interval
      scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setInterval(update, 10000);
    update();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!top) {
    return <></>;
  }

  return (

    <>
      <div
        ref={scrollToRef}
        style={{
          top: `${top}px`,
          marginLeft: "-0.25rem",
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          position: "absolute",
          width: "calc(100% + 0.25rem)",
          height: "3px",
          backgroundColor: theme.palette.text.primary,
          boxShadow: "rgba(255, 255, 255, 0.35) 0px 5px 15px"
        }}>
        <Typography sx={{
          position: "absolute",
          color: theme.palette.text.primary,
          fontSize: "0.8rem",
          marginBottom: "2rem",
          fontWeight: 800,
          backgroundColor: theme.palette.background.paper,
          padding: "0 0.25rem"
        }}>{dayjs().toLocalChronos().print()}</Typography>
        <ButtonBase
          style={{
            position: 'absolute',
            right: 0,
            top: "-1.75rem",
            width: "1.75rem",
            height: "1.5rem",
            borderRadius: "0.25rem"
          }}
        >
          <IconButton onClick={() => {
            startCreator(Type.Event, Mode.Create, new Event({
              date: dayjs().yyyymmdd(),
              start_time: String(dayjs().toLocalChronos().getHMN()),
              end_time: String(dayjs().toLocalChronos().add(1).getHMN())
            }))
          }}>
            <AddOutlined fontSize="small" />
          </IconButton>
        </ButtonBase>
        <div
          style={{
            width: "0.55rem",
            height: "0.55rem",
            borderRadius: "50%",
            backgroundColor: theme.palette.text.primary,
          }}></div>
      </div>
    </>

  )
}

const CalendarDayTimeSlot = ({
  time,
  handleMouseDown,
  handleMouseMove,
  handleDayTimeClick,
  standardHeight,
  onContextMenu,
  isPast = false
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

  const color = time % 1 == 0 ? theme.palette.action.disabled : theme.palette.divider;
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

function DayView({
  index,
  style,
  date,
  sequence,
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
  source,
  swap,
  replace,
}: {
  index: number;
  style: any;
  date: dayjs.Dayjs;
  sequence: number[];
  handleCreate?: StartCreator;
  calendarDay: CalendarDay | null;
  nextCalendarDay: CalendarDay | null;
  standardHeight: number;
  handleDragStart?: (
    e: MouseEvent<HTMLDivElement>,
    props: any
  ) => void;
  handleMouseMove?: (e: MouseEvent<HTMLDivElement>, props: any) => void;
  handleView?: StartViewer;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDayTimeClick?: (e: MouseEvent) => void;
  selected?: Event[] | null;
  source: Member | null;
  swap: (newEvent: Event, oldEvent?: Event) => void;
  replace: any
}) {
  const theme = useTheme();
  const calDayRef = useRef<HTMLDivElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [calendarDayRendered, setCalendarDayRendered] = useState<CalendarDayRendered | null>(null);
  const [nextCalendarDayRendered, setNextCalendarDayRendered] = useState<CalendarDayRendered | null>(null);

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

  useEffect(() => {
    if (calendarDay && date) {

      const theCalendarDayRendered = new CalendarDayRendered(calendarDay.date.yyyymmdd(), calendarDay);
      const theNextCalendarDayRendered = nextCalendarDay ? new CalendarDayRendered(nextCalendarDay.date.yyyymmdd(), nextCalendarDay) : null;
      setCalendarDayRendered(theCalendarDayRendered);
      setNextCalendarDayRendered(theNextCalendarDayRendered);
      // setReducedAllDayStack([...startOffset, ...result]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDay, calendarDay?.version, nextCalendarDay, nextCalendarDay?.version])

  if (!calendarDayRendered || !handleCreate) {
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
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<ContentPasteOutlined />}>Paste</Button>
          <Button
            onClick={() => {
              console.log({
                calendarDayRendered,
                nextCalendarDayRendered
              })
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<BugReportOutlined />}>Debug</Button>
        </div>
      </Popover>
      <div
        style={{
          userSelect: 'none',
          margin: 0,
          ...style
          // opacity: isPast ? 0.8 : 1,
        }}
        ref={calDayRef}
      >

        <div style={{ position: 'relative' }}>
          {/* {source instanceof Event && (!source.start_time && !source.date) && (
            <SourceScheduleBlock
              column={0}
              key={`${source.id()}`}
              referenceTime={6}
              date={date}
              event={source}
              standardHeight={standardHeight}
              handleView={handleView}
              handleCreate={handleCreate}
              handleSelect={handleSelect}
              handleDragStart={handleDragStart}
              source={source}
              swap={swap}
              replace={replace}
            />
          )} */}
          <div style={{ position: 'relative', width: "calc(100% - 1.5rem)", marginLeft: "0.25rem" }}>

            {calendarDayRendered &&
              calendarDayRendered.aside.map((event, index) => {

                if (event.start_time && event.start_time.isBefore(new Chronos(6))) {
                  return null;
                }

                if (isMoment(event)) {
                  return (
                    <MomentBlock
                      key={`${event.id()}`}
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
                    />
                  )

                }

                if (!isNotScheduled(event)) {
                  return (
                    <SourceScheduleBlock
                      column={index}
                      key={`${event.id()}`}
                      referenceTime={6}
                      date={date}
                      event={event}
                      standardHeight={standardHeight}
                      handleView={handleView}
                      handleCreate={handleCreate}
                      handleSelect={handleSelect}
                      handleDragStart={handleDragStart}
                      source={source}
                      swap={swap}
                      replace={replace}
                    />
                  )
                }

                return null;
              })}

            {calendarDayRendered &&
              calendarDayRendered.chaos.map((column, index) => (
                <Fragment key={`${date.yyyymmdd()}-column-${index}}`}>
                  {column.map(event => {


                    if (isMoment(event)) {
                      return (
                        <MomentBlock
                          key={`${event.id()}`}
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
                        />
                      )

                    }

                    if (!isNotScheduled(event)) {
                      return (
                        <SourceScheduleBlock
                          column={index}
                          key={`${event.id()}`}
                          referenceTime={6}
                          date={date}
                          event={event}
                          standardHeight={standardHeight}
                          handleView={handleView}
                          handleCreate={handleCreate}
                          handleSelect={handleSelect}
                          handleDragStart={handleDragStart}
                          source={source}
                          swap={swap}
                          replace={replace}
                        />
                      )
                    }

                    return null;
                  })}
                </Fragment>
              ))}

            {nextCalendarDayRendered &&
              nextCalendarDayRendered.chaos.map((column, index) => (
                <Fragment key={`${date.yyyymmdd()}-nextDay-column-${index}}`}>
                  {column.map((event, index) => {

                    // if (!event.date) {
                    //   return (
                    //     <SourceScheduleBlock
                    //       column={index}
                    //       key={`${event.id()}`}
                    //       referenceTime={6}
                    //       date={date}
                    //       event={event}
                    //       standardHeight={standardHeight}
                    //       handleView={handleView}
                    //       handleCreate={handleCreate}
                    //       handleSelect={handleSelect}
                    //       handleDragStart={handleDragStart}
                    //       source={source}
                    //       swap={swap}
                    //       replace={replace}
                    //     />
                    //   )
                    // }


                    if (event.start_time && event.start_time.isBefore(new Chronos(6))) {

                      if (event instanceof Hours) {
                        return null;
                      }

                      if (isMoment(event)) {
                        return (
                          <MomentBlock
                            key={`${event.id()}`}
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

                      return <Fragment key={index}></Fragment>
                    }
                    else {
                      return <Fragment key={index}></Fragment>
                    }
                  })}
                </Fragment>
              ))}

            {nextCalendarDayRendered &&
              nextCalendarDayRendered.aside.map((event, index) => {

                if (event.start_time && !event.start_time.isBefore(new Chronos(6))) {
                  return null;
                }

                if (isMoment(event)) {
                  return (
                    <MomentBlock
                      key={`${event.id()}`}
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
                    />
                  )

                }

                // if (!isNotScheduled(event)) {
                //   return (
                //     <SourceScheduleBlock
                //       column={index}
                //       key={`${event.id()}`}
                //       referenceTime={6}
                //       date={date}
                //       event={event}
                //       standardHeight={standardHeight}
                //       handleView={handleView}
                //       handleCreate={handleCreate}
                //       handleSelect={handleSelect}
                //       handleDragStart={handleDragStart}
                //       source={source}
                //       swap={swap}
                //       replace={replace}
                //     />
                //   )
                // }

                return null;
              })}




          </div>

          {date.isInDayView(6) && <Now standardHeight={standardHeight} startCreator={handleCreate} />}
          <>
            {sequence.map(time => (
              <CalendarDayTimeSlot
                key={time}
                time={time}
                onContextMenu={handleRightClick}
                handleMouseMove={(e: MouseEvent<HTMLDivElement>) => {
                  handleMouseMove && handleMouseMove(
                    e,
                    {
                      date: date,
                      time: time,
                    });
                }}
                handleMouseDown={(e: MouseEvent<HTMLDivElement>) => {
                  console.log(calDayRef.current?.getBoundingClientRect())
                  handleDragStart && handleDragStart(
                    e,
                    {
                      date: date,
                      time: time,
                    });
                }}
                handleDayTimeClick={handleDayTimeClick}
                standardHeight={standardHeight}
                isPast={date.isBefore(today, 'D') ? true : (date.isSame(today, 'D') && time <= today.toLocalChronos().getHMN(30)) ? true : false}
              />
            ))}
          </>

        </div>

      </div >
    </>
  );
}

export default DayView;
