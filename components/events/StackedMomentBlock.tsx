import { Expand, OpenInFull, LocationOnOutlined, VerifiedOutlined, EditOutlined, AddOutlined, BugReportOutlined, DeleteOutline, HideImageOutlined, CalendarMonthOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Zoom, Fab, Typography, Popover, Tabs, Tab, Button, getContrastRatio, darken, alpha, Checkbox } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect, CSSProperties } from 'react';
import Chronos from '@/lib/utils/chronos';
import { Event, Events, JunctionStatus, Member } from '@/schema';
import { Type, Mode, adjustForContrast } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';


export const StackedMomentBlock = ({
  column,
  event,
  referenceTime,
  standardHeight,
  handleView,
  handleCreate,
  handleSelect,
  handleDragStart,
  isSelected,
  source,
  swap,
  style = {}
}: {
  column: number;
  event: Event & {
    date: Dayjs,
    start_time: Chronos,
    end_date: null,
    end_time: null
  };
  referenceTime: number;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDragStart?: any;
  isSelected: boolean;
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

  // const isPast = dayjs().isAfter(Events.dayjs(event.date.yyyymmdd(), event.end_time))
  const top: number | null =
    event.start_time && event.start_time!.getHMN() >= 5.5 && event.start_time!.getHMN() < 24
      ? (event.start_time.getHMN() - (6 - 0.5)) * standardHeight * 2
      : standardHeight * 2 * 18.5 + event.start_time!.getHMN() * standardHeight * 2;

  const start = event.start_time;
  const end = event.end_time;

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

    handleView(Type.Event, event, { e });
  };

  const handleRightClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!handleView) {
      return;
    }

    handleView(Type.Event, event, {
      e,
      isRightClick: true
    })

  }

  const onMouseDown = (e: MouseEvent) => {
    console.log(event);
    handleDragStart(e, {
      uuid: event.uuid,
      date: event.date,
      time: event.start_time.getHMN(),
      name: event.name
    });
  }

  const handleHover = () => {
    setIsHovered(prev => !prev);
  };


  if (!start) {
    return <></>;
  }

  try {
    return (
      <>
        <ButtonBase
          className="eventButton column center snug"
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
          // disableRipple
          sx={{
            zIndex: 2,
            fontFamily: 'inherit',
            overflow: 'hidden',
            borderRadius: '0.25rem',
            color: isMember ? event.theme_color || theme.palette.primary.main : alpha(theme.palette.text.primary, 0.5),
            border: '0px solid transparent',
            // borderColor: isSelected ? "#3d3d3d" : event.theme_color || theme.palette.primary.main,
            // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
            padding: '0.25rem',
            // height: end ? standardHeight * Chronos.absDiff(end, start) * 2 : 0,
            height: "fit-content",
            alignItems: 'flex-start',
            // boxShadow: isHovered
            //   ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
            //   : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
            transition: '0.2s ease-in-out',
          }}
        >

          <div className="flex between">
            <Typography sx={{
              fontSize: "0.75rem"
            }}>{event.start_time.print(true)}</Typography>
            {/* <CalendarMonthOutlined sx={{
              fontSize: '0.75rem',
            }} /> */}
          </div>
          <div className="flex compact2 left">
            {event.event_type === 'task' && (
              <Checkbox size='small' sx={{
                padding: 0
              }} />
            )}
            <Typography sx={{
              fontSize: "0.75rem",
              width: "100%",
              textAlign: 'left',
              lineHeight: "115%"
            }}>{event.name}</Typography>
          </div>
        </ButtonBase>
      </>
    )
  }
  catch (err) {
    console.log(err);
    return null;
  }
};
