import { Expand, OpenInFull, LocationOnOutlined, VerifiedOutlined, EditOutlined, AddOutlined, BugReportOutlined, DeleteOutline, CalendarMonthOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Zoom, Fab, Typography, Popover, Tabs, Tab, Button, getContrastRatio, darken, SxProps, IconButton } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect, MutableRefObject } from 'react';
import Chronos from '@/lib/utils/chronos';
import { Event, Events, JunctionStatus, Member } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';



export const SingleDayEventBlock = ({
  event,
  column,
  referenceTime,
  standardHeight,
  handleView,
  handleCreate,
  handleSelect,
  handleDragStart,
  isSelected,
  source,
  date,
  style = {
    marginLeft: "0",
    gutter: "0"
  },
  DayInMonthRef
}: {
  column: number;
  event: Event;
  referenceTime: number;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDragStart?: any;
  isSelected: boolean;
  source?: Member | null;
  date: Dayjs;
  style?: {
    marginLeft: string | number,
    gutter: string | number,
    [key: string]: string | number
  };
  DayInMonthRef: MutableRefObject<any>;
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const eventRef = useRef<any | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [offsetWidth, setOffsetWidth] = useState(0);

  // Track changes in DayInMonthRef.current.offsetWidth
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setOffsetWidth(entry.contentRect.width);
      }
    });

    if (DayInMonthRef.current) {
      observer.observe(DayInMonthRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [isHovered, setIsHovered] = useState(false);

  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!source) {
      return;
    }
    const member = event.junctions.get(source.id());
    if (!member) return;
    if (member.status === JunctionStatus.Accepted) {
      setIsMember(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log(e)

    if (!e || !handleView) {
      console.log("Error")
      return;
    }
    if (handleSelect && e.shiftKey) {
      handleSelect(e, event);
      return;
    }

    handleView(Type.Event, event, { e });
  };

  const handleRightClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  }

  const handleHover = () => {
    setIsHovered(prev => !prev);
  };



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
          <Button sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<EditOutlined />} onClick={handleClick}>View</Button>
          <Button
            onClick={() => {
              handleCreate(Type.Event, Mode.Create, {
                name: "Pre-Event",
                date: event.date,
                start_time: event.start_time.add(-0.5),
                end_time: event.start_time
              })
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<AddOutlined />}>Prepend</Button>
          <Button
            onClick={() => {
              handleCreate(Type.Event, Mode.Create, {
                name: "Post-Event",
                date: event.date,
                start_time: event.end_time,
                end_time: event.end_time?.add(0.5)
              })
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<AddOutlined />}>Append</Button>
          <Button
            onClick={() => {
              console.log(event)
              handleClose();
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<BugReportOutlined />}>Debug</Button>
          <Button
            onClick={() => {
              console.log(event)
              handleCreate(Type.Event, Mode.Delete, {
                items: [event]
              })
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<DeleteOutline />}>Delete</Button>
        </div>
      </Popover>
      <ButtonBase
        data-type="eventButton"
        ref={eventRef}
        // onMouseDown={onMouseDown}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        onContextMenu={handleRightClick}
        className="eventButton flex center"
        sx={{
          display: 'flex',
          position: "absolute",
          zIndex: 2,
          left: 0,
          width: `calc(${offsetWidth}px - ${style.marginLeft} + ${style.gutter}) !important`,
          textAlign: 'left',
          fontFamily: 'inherit',
          overflow: 'hidden',
          borderRadius: '0.25rem',
          color: isMember ? event.theme_color || theme.palette.primary.main : `${theme.palette.background.paper}ee`,
          backgroundColor: isMember ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText : event.theme_color || theme.palette.primary.main,
          // borderColor: isSelected ? "#3d3d3d" : event.theme_color || theme.palette.primary.main,
          // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
          padding: '0 0.25rem',
          height: "1.5rem",
          alignItems: 'flex-start',
          transition: '0.2s ease-in-out',
          ...style
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
          <span
            className='flex snug'
            style={{
              fontSize: '0.75rem',
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}>
            <CalendarMonthOutlined sx={{
              fontSize: "0.85rem",
            }} />
            <strong style={{
              marginLeft: "0.25rem",
              width: "fit-content"
            }}>{event.name}</strong>
          </span>
          {event.location_name && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOnOutlined sx={{ fontSize: '12px', mr: '0.1rem', ml: '-0.2rem', p: 0, mt: "0.15rem" }} />
                <span style={{ fontSize: '0.75rem' }}>{event.location_name}</span>
              </div>
            </>
          )}

        </div>
      </ButtonBase>
    </>
  );
};
