import { ScheduleOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Avatar } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import Chronos from '@/lib/utils/chronos';
import { Event, JunctionStatus, Member, Schedule } from '@/schema';
import { Type } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import { Hours, Segment } from '@/lib/utils/medici';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';

export const SourceScheduleBlock = ({
  isStacked = false,
  column,
  event,
  referenceTime,
  date,
  standardHeight,
  handleView,
  handleCreate,
  handleSelect,
  handleDragStart,
  source,
  swap,
  replace,

}: {
  isStacked?: boolean;
  column: number;
  event: Event;
  referenceTime: number;
  date: Dayjs;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDragStart?: any;
  source?: Member | null;
  swap: any,
  replace: any,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const eventRef = useRef<any | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [activeHours, setActiveHours] = useState<Hours | boolean | null>(null);

  const calculateHeight = (min: Chronos, max: Chronos) => {
    return standardHeight * Chronos.absDiff(max, min) * 2;
  }

  const calculateTop = (min: Chronos) => {
    const top: number | null = min.getHMN() >= 5.5 && min.getHMN() < 24
      ? (min.getHMN() - (6 - 0.5)) * standardHeight * 2
      : standardHeight * 2 * 18.5 + min.getHMN() * standardHeight * 2;

    return top;
  };

  const formatLeftShift = () => {

    if (!source) {
      return;
    }

    if (event.collisions === 0) {
      return event.id() === source.id() ? "0rem" : source instanceof Event ? "0.75rem" : "0rem";
    }

    return `calc(calc(${column} * 1rem) + ${source instanceof Event ? "0.75rem" : "0rem"})`
  };

  const [isMember, setIsMember] = useState(false);
  const [segments, setSegments] = useState<Segment[] | null>(null);




  const handleRightClick = async (e: any) => {

    e.preventDefault();

    if (!handleView) {
      return;
    }

    handleView(Type.Event, event, { e, date, isRightClick: true });
    // try {
    //   e.preventDefault();
    //   setAnchorEl(e.currentTarget)

    //   // const theEvent = await Events.getEvent(uuid);
    //   // if (!theEvent || theEvent instanceof Array) {
    //   //   return;
    //   // }
    //   const theValue = {
    //     uuid: event.uuid,
    //     schedules: event.schedules,
    //     active: activeSchedule,
    //     date,
    //     closeEarly: null
    //   }

    //   theValue.closeEarly = getCloseEarlySuggestedValue(theValue)

    //   setSelected(theValue)
    // }
    // catch (err) {
    //   console.log(err);
    //   return;
    // }
  }


  useEffect(() => {
    if (!source) {
      return;
    }

    if (source.id() === source.id()) {
      setIsMember(true);
      return;
    }
    const member = event.junctions.get(source.id());
    if (!member) return;
    if (member.status === JunctionStatus.Accepted) {
      setIsMember(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);


  useEffect(() => {
    if (!event || !date) {
      return;
    }

    const schedules = event.getSchedulesInFrame(date);
    if (!schedules || schedules.length === 0) {
      return;
    }
    setActiveSchedule(schedules[0]);

    const hours = schedules[0].getHours(date.day());
    setActiveHours(hours);

    if (typeof hours != 'boolean') {
      setSegments(hours.toSegments())
    }

  }, [event, date])

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: MouseEvent) => {
    console.log(e)

    if (!e || !handleView) {
      console.log("Error")
      return;
    }
    if (handleSelect && e.shiftKey) {
      handleSelect(e, event);
      return;
    }

    handleView(Type.Event, event, { e, date });
  };

  const onMouseDown = (e: MouseEvent) => {
    console.log(event);
    // handleDragStart(e, {
    //   uuid: event.uuid,
    //   date: event.date,
    //   time: event.start_time.getHMN(),
    //   name: event.name
    // });
  }

  const [hovered, setHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  if (!activeSchedule || !activeHours) {
    return <></>;
  }

  if (typeof activeHours === 'boolean') {
    return null;
  }

  if (!segments) {
    return null;
  }

  if (isStacked) {
    return (
      <>
        <ButtonBase
          className="eventButton"
          data-type="eventButton"
          ref={eventRef}
          onMouseDown={onMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
          // onMouseEnter={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
          onContextMenu={handleRightClick}
          sx={{
            display: 'flex',
            zIndex: 1,
            textAlign: 'left',
            fontFamily: 'inherit',
            overflow: 'hidden',
            borderRadius: '0.25rem',
            backgroundColor: activeSchedule.isNotRegular() ? 'gold' : event.theme_color || theme.palette.primary.main,
            color: activeSchedule.isNotRegular() ? 'black' : event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText,
            border: '3px solid',
            borderColor: "transparent",
            // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
            padding: '0.15rem 0.25rem',
            // height: end ? standardHeight * Chronos.absDiff(end, start) * 2 : 0,
            height: "1.4rem",
            alignItems: 'flex-start',
            boxShadow: isHovered
              ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
              : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
            transition: '0.2s ease-in-out',
            width: "100%"
          }}
        >
          <div
            className='flex compact2 middle left'
            style={{
              width: '100%',
              borderRadius: '0.25rem',
            }}
          >
            <ScheduleOutlined fontSize="small" sx={{ fontSize: "0.75rem" }} />
            <span style={{
              fontSize: '0.75rem',
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}>
              <strong>{event.name}</strong>
            </span>
            {activeSchedule.isNotRegular() && (
              <> <span style={{
                fontSize: '0.75rem',
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden"
              }}>
                &middot; {activeSchedule.name}
              </span></>
            )}
          </div>
        </ButtonBase>
      </>
    )
  }

  return (
    <>

      {segments.map(({ start, end }) => (
        <ButtonBase
          key={`${start.getHMN()}_{${end.getHMN()}}`}
          className="eventButton"
          data-type="eventButton"
          ref={eventRef}
          onMouseDown={onMouseDown}
          onClick={handleClick}
          // onMouseEnter={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
          onContextMenu={handleRightClick}
          sx={{
            display: 'flex',
            position: 'absolute',
            zIndex: Math.max(1, Math.round(3 * (1 / (end.getHMN() - start.getHMN())))),
            top: calculateTop(start) | 0,
            left: formatLeftShift(),
            width: '0.25rem',
            textAlign: 'left',
            fontFamily: 'inherit',
            borderRadius: '0.25rem',
            backgroundColor: event.theme_color || theme.palette.primary.main,
            color: theme.palette.text.primary,
            // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
            padding: 0,
            height: calculateHeight(start, end) | 0,
            alignItems: 'flex-start',
            boxShadow: isHovered
              ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
              : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
            transition: '0.2s ease-in-out',

            // opacity: isPast ? 0.75 : 1
          }}
        >
          <Avatar
            sx={{
              position: 'absolute',
              top: 0,
              width: "2rem",
              height: "2rem",
              transform: "translate(0.2rem, -1.55rem)",
              fontSize: "0.85rem",
              backgroundColor: event.theme_color || theme.palette.background.paper,
              color: event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.text.primary,
              border: `0.25rem solid ${event.theme_color || theme.palette.primary.main}`,
              margin: "0.5rem 0.5rem 0.5rem 0",
              fontWeight: 800
            }}
            alt={event.name || ""}
            src={`${MEDIA_BASE_URI}/${event.getIconPath(true)}`}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            transform: "translate(0, 50%)",
            width: "1rem",
            height: "1rem",
            borderRadius: "100vh",
            borderColor: event.theme_color || theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            border: "0.25rem solid"
          }}></div>
        </ButtonBase>
      ))}
    </>
  );
};
