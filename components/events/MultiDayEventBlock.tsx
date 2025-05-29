import { LocationOnOutlined, EditOutlined, AddOutlined, BugReportOutlined, DeleteOutline, CalendarMonthOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Popover, Button, alpha, Typography } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect, MutableRefObject } from 'react';
import { Event, JunctionStatus, Member } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';



export const MultiDayEventBlock = ({
  i,
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
  i?: number;
  column: number;
  event: Event & {
    date: Dayjs,
    end_date: Dayjs
  };
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

  const formatWidth = () => {
    if (!DayInMonthRef.current) return;

    const offsetWidth = DayInMonthRef.current.offsetWidth;

    const length = event.end_date.diff(date, "d");
    const toEndOfWeek = 6 - column;

    if (toEndOfWeek === 0) {
      return `calc(${offsetWidth}px - 0.5rem)`;
    }

    if (length < toEndOfWeek) {
      return `calc( calc(${offsetWidth}px * ${length + 1}) - ${style.marginLeft} + calc(${style.gutter}))`;
    }

    return `calc(calc(2.5px * ${toEndOfWeek}) + (${offsetWidth}px * ${toEndOfWeek + 1}) - ${style.marginLeft} + calc(${style.gutter} * 8))`;
  };


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

    if (!handleView) {
      return;
    }

    handleView(Type.Event, event, {
      e,
      date,
      isRightClick: true
    })

  }

  const handleHover = () => {
    setIsHovered(prev => !prev);
  };



  return (
    <>

      <ButtonBase
        disableRipple
        data-type="eventButton"
        ref={eventRef}
        // onMouseDown={onMouseDown}
        className="eventButton"
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        onContextMenu={handleRightClick}
        sx={{
          display: 'flex',
          position: 'absolute',
          alignItems: "center",
          zIndex: 2,
          left: 0,
          width: formatWidth(),
          textAlign: 'left',
          fontFamily: 'inherit',
          overflow: 'hidden',
          borderRadius: '0.25rem',
          backgroundColor: isMember ? event.theme_color ? alpha(event.theme_color, 0.65) : theme.palette.primary.main : theme.palette.primary.main,
          color: isMember ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText : theme.palette.primary.contrastText,
          border: '3px solid transparent',
          padding: '0 0.25rem',
          height: "1.75rem",
          boxShadow: isHovered
            ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
            : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
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
          <div className="flex compact2">
            <CalendarMonthOutlined sx={{
              fontSize: '0.875rem'
            }} />

            <Typography sx={{
              fontSize: '0.75rem',
              lineHeight: '115%'
            }}>{event.name}</Typography>
          </div>
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
