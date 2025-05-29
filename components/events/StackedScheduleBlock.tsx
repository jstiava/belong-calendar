import { ScheduleOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Typography, alpha } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import { Event, JunctionStatus, Member, Schedule } from '@/schema';
import { Type } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';


export const StackedScheduleBlock = ({
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
  style = {},
  date,
  showHoursForDay = false
}: {
  column: number;
  event: Event & {
    schedules: Schedule[]
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
  style?: any,
  date?: Dayjs,
  showHoursForDay?: boolean
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
  const start = event.start_time;
  const end = event.end_time;

  const [isMember, setIsMember] = useState(false);
  const [isOpenDetailed, setIsOpenDetailed] = useState<any | null>(null);

  useEffect(() => {
    if (!source) {
      return;
    }
    const theIsOpenInfo = event.isOpenDetailed(date);
    console.log({
      message: "Stacked Schedule Block",
      isOpen: theIsOpenInfo,
      date: date?.yyyymmdd()
    })
    setIsOpenDetailed(theIsOpenInfo);


    const member = event.junctions.get(source.id());
    if (!member) return;
    if (member.status === JunctionStatus.Accepted) {
      setIsMember(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, event]);

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
    return;
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

  if (isOpenDetailed && !isOpenDetailed.hours) {
    return null;
  }

  try {
    return (
      <>
        <ButtonBase
          className="eventButton flex compact2 top"
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
          disableRipple
          sx={{
            zIndex: 1,
            fontFamily: 'inherit',
            overflow: 'hidden',
            borderRadius: '0.25rem',
            color: isMember ? event.theme_color || theme.palette.primary.main : alpha(theme.palette.text.primary, 0.5),
            // color: isMember ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.getContrastText(theme.palette.primary.main) : event.theme_color || theme.palette.primary.main,
            border: '0px solid transparent',
            // borderColor: isSelected ? "#3d3d3d" : event.theme_color || theme.palette.primary.main,
            // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
            padding: '0 0.25rem',
            // height: end ? standardHeight * Chronos.absDiff(end, start) * 2 : 0,
            height: "fit-content",
            alignItems: 'flex-start',
            // boxShadow: isHovered
            //   ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
            //   : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
            transition: '0.2s ease-in-out',
            // opacity: isPast ? 0.75 : 1,
            width: `${style.width || '100%'} !important`,
            marginLeft: style.marginLeft || 0
          }}
        >
          <div className="flex fit">
            {/* <Typography sx={{
              fontSize: "0.75rem",
            }}>{event.start_time.print(true)}</Typography> */}
            <ScheduleOutlined sx={{
              fontSize: '0.875rem'
            }} />
          </div>
          <div className="flex left">
            {showHoursForDay && isOpenDetailed ? (
              <Typography
                key={"hours_view"}
                sx={{
                  fontSize: "0.75rem",
                  width: "100%",
                  textAlign: 'left',
                  lineHeight: '115%',
                  whiteSpace: "normal",
                  overflow: "clip",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}>{isOpenDetailed ? isOpenDetailed.isOpen ? isOpenDetailed.hours ? isOpenDetailed.hours.as_text : 'Open' : isOpenDetailed.hours.as_text ? isOpenDetailed.hours.as_text : 'Closed' : 'Error'}</Typography>
            ) : (
              <Typography sx={{
                fontSize: "0.75rem",
                width: "100%",
                textAlign: 'left',
                lineHeight: '115%'
              }}>{event.name}</Typography>
            )}
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
