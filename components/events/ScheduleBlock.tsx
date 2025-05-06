import { LocationOnOutlined, AddOutlined, ScheduleOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Button, getContrastRatio, alpha } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import Chronos from '@/lib/utils/chronos';
import { Event, JunctionStatus, Member, Schedule } from '@/schema';
import { Type, Mode, adjustForContrast } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import { Hours, Segment } from '@/lib/utils/medici';
import { v4 as uuidv4 } from 'uuid';



export const ScheduleBlock = ({
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
  style = {}
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
  swap: (newEvent: Event, oldEvent?: Event) => void;
  style?: any
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const eventRef = useRef<any | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

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

    if (event.collisions === 0) {
      return '0%';
    }

    return `${column * (100 / 3)}%`
  };

  const formatWidth = () => {

    if (event.collisions === 0) {
      return `100%`
    }

    return `${100 / 3}%`
  };

  const [isMember, setIsMember] = useState(false);
  const [segments, setSegments] = useState<Segment[] | null>(null);

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

  const handleRightClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!handleView) {
      return;
    }
    
    handleView(Type.Event, event, {
      e,
      isRightClick: true,
      date
    })
  }

  const onMouseDown = (e: MouseEvent) => {
    console.log(event);
    // handleDragStart(e, {
    //   uuid: event.uuid,
    //   date: event.date,
    //   time: event.start_time.getHMN(),
    //   name: event.name
    // });
  }

  const handleHover = () => {
    setIsHovered(prev => !prev);
  };

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  if (!activeSchedule || !activeHours) {
    return <></>;
  }

  if (typeof activeHours === 'boolean' && !activeHours) {
    return null;
  }

  if (isStacked) {
    return (
      <ButtonBase
        className="eventButton"
        data-type="eventButton"
        ref={eventRef}
        onMouseDown={onMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          handleClick(e);
        }}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        onContextMenu={handleRightClick}
        sx={{
          position: style.position || "relative",
          display: 'flex',
          zIndex: 1,
          textAlign: 'left',
          fontFamily: 'inherit',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: '0.25rem',
          color: event.theme_color ? getContrastRatio(event.theme_color, theme.palette.background.paper) >= 4.5 ? event.theme_color : adjustForContrast(theme.palette.text.primary, 0.15) : theme.palette.text.primary,
          // color: activeSchedule.isNotRegular() ? 'black' : event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText,
          border: '3px solid',
          borderColor: "transparent",
          // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
          padding: '0 0rem',
          // height: end ? standardHeight * Chronos.absDiff(end, start) * 2 : 0,
          height: "1.4rem",
          transition: '0.2s ease-in-out',
          width: style.width || "100%",
          marginLeft: style.marginLeft || 0,
          top: style.top || "unset",
          left: style.top ? 0 : 'unset',
          ...style
        }}
      >
        <div
          className='flex snug middle left'
          style={{
            width: '100%',
            borderRadius: '0.25rem',
          }}
        >
          <div className="flex center middle" style={{
            backgroundColor: activeSchedule.isNotRegular() ? 'gold' :
              'unset',
            borderRadius: "100vh",
            width: "1.1rem",
            height: "1.1rem",
            padding: 0
          }}>
            <ScheduleOutlined fontSize="small" sx={{
              fontSize: "0.75rem",
              width: "0.75rem",
              height: "0.75rem",
              color: 'inherit',
            }} />
          </div>
          <div className="flex snug" style={{
            width: "calc(100% - 1.5rem)"
          }}>

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
        </div>
      </ButtonBase>
    )
  }

  return (
    <>
      {segments && segments.map(({ start, end }) => (
        <ButtonBase
          key={`${start.getHMN()}_{${end.getHMN()}}`}
          className="eventButton"
          data-type="eventButton"
          ref={eventRef}
          onMouseDown={onMouseDown}
          onClick={handleClick}
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onContextMenu={handleRightClick}
          sx={{
            display: 'flex',
            position: 'absolute',
            zIndex: 1,
            top: calculateTop(start) | 0,
            left: formatLeftShift(),
            width: formatWidth(),
            textAlign: 'left',
            fontFamily: 'inherit',
            overflow: 'hidden',
            borderRadius: '0.25rem',
            backgroundColor: isMember ? event.theme_color ? alpha(event.theme_color, 0.15) : alpha(theme.palette.primary.main, 0.15) : `${theme.palette.background.paper}ee`,
            color: event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.text.primary,
            border: '3px dashed',
            borderColor: event.theme_color || theme.palette.primary.main,
            // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
            padding: '0.35rem 0.5rem',
            height: calculateHeight(start, end) | 0,
            alignItems: 'flex-start',
            boxShadow: isHovered
              ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
              : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
            transition: '0.2s ease-in-out',
            // opacity: isPast ? 0.75 : 1
          }}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <span style={{ fontSize: '0.75rem' }}>
              {start.print()}{activeSchedule.isNotRegular() && <> &middot; {activeSchedule.name}</>}
            </span>
            <span style={{ fontSize: '0.75rem', position: "absolute", bottom: "0.25rem" }}>
              {end.print()}
            </span>
            <span style={{ fontSize: '0.75rem' }}>
              <strong>{event.name}</strong>
            </span>
            {event.location_name && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationOnOutlined sx={{ fontSize: '12px', mr: '0.1rem', ml: '-0.2rem', p: 0, mt: "0.15rem" }} />
                  <span style={{ fontSize: '0.75rem' }}>{event.location_name}</span>
                </div>
              </>
            )}
            <div className="flex fit" style={{
              position: "absolute",
              right: 0,
              bottom: 0,
            }}>
              <Button
                size="small"
                startIcon={<AddOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreate(Type.Event, Mode.Create, {
                    ...event.eject(),
                    uuid: String(uuidv4()),
                    schedules: null,
                    date: date.yyyymmdd(),
                    start_time: start.getHMN(),
                    end_time: end.getHMN(),
                    end_date: null
                  })
                }}
                variant="text"
                sx={{
                  color: event.theme_color || theme.palette.text.primary
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </ButtonBase>
      ))}
    </>
  );
};
