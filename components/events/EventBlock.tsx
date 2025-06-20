import { LocationOnOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';

import { Event, JunctionStatus, Member, typeToDirectionality, Chronos, Dayjs } from '@jstiava/chronos';
import { Type, adjustForContrast } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { useSnackbar } from 'notistack';



export const CalendarEventBox = ({
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
  style = {}
}: {
  column: number;
  event: Event & {
    date: Dayjs,
    start_time: Chronos,
    end_date: null,
    end_time: Chronos
  };
  referenceTime: number;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDragStart?: any;
  isSelected: boolean;
  source?: Member | null;
  style?: any
}) => {


  const theme = useTheme();
  const eventRef = useRef<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);

  const top: number | null =
    event.start_time && event.start_time!.getHMN() >= 5.5 && event.start_time!.getHMN() < 24
      ? (event.start_time.getHMN() - (6 - 0.5)) * standardHeight * 2
      : standardHeight * 2 * 18.5 + event.start_time!.getHMN() * standardHeight * 2;

  const start = event.start_time;
  const end = event.end_time;

  const [isMember, setIsMember] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const check = () => {

    if (!source || !event) {
      return;
    }
    const check = `${source.id()}_${typeToDirectionality(event.type, source.type === Type.Event)}`;
    const member = event.junctions.get(check);
    console.log({
      event,
      check,
      member,
      result: !member ? false : member.status === JunctionStatus.Accepted
    })
    if (!member) return;
    if (member.status === JunctionStatus.Accepted) {
      setIsMember(true);
    }
  }


  useEffect(() => {
    check();


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, event]);



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


  const height = standardHeight * Chronos.absDiff(end, start) * 2;


  const formatLeftShift = () => {
    if (event.collisions === 0) {
      return '0%';
    }
    if (column === 1 && event.collisions === 1) {
      return `${100 - (100 / 3)}%`
    }
    return `${column * (100 / 3)}%`
  };


  const formatWidth = () => {
    if (event.collisions === 0) {
      return `100%`
    }
    if (column === 0 && event.collisions === 1) {
      return `${100 - (100 / 3)}%`
    }
    return `${100 / 3}%`
  };

  const DYNAMIC_STYLES = {
    backgroundColor: isMember ? event.theme_color ? event.theme_color : theme.palette.primary.main : `${theme.palette.background.paper}ee`,
    color: isMember ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.main : event.theme_color ? event.theme_color :  theme.palette.primary.main,
    padding: '0.3rem',
  }


  if (!start || !event) {
    return <></>;
  }

  if (height < 50) {

    return (
      <ButtonBase
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
          zIndex: 2,
          top: top ? `${top}px` : 0,
          left: formatLeftShift(),
          width: formatWidth(),
          textAlign: 'left',
          fontFamily: 'inherit',
          // overflow: 'hidden',
          borderRadius: '0.25rem',
          border: isSelected ? '3px solid' : '0',
          borderColor: isSelected ? "#3d3d3d" : 'transparent',
          height: end ? standardHeight * Chronos.absDiff(end, start) * 2 : 0,
          alignItems: 'flex-start',
          boxShadow: isHovered
            ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
            : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
          transition: '0.2s ease-in-out',
          // opacity: isPast ? 0.75 : 1
          ...DYNAMIC_STYLES
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
          <span style={{ fontSize: '0.75rem', }}>
            {event.start_time.to(event.end_time)} <strong> {event && <span dangerouslySetInnerHTML={{ __html: event.name }} />}</strong>
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

        {isHovered && (
          <>
            <div style={{
              position: 'absolute',
              width: "0.5rem",
              height: "0.5rem",
              backgroundColor: DYNAMIC_STYLES.backgroundColor,
              border: `0.15rem solid ${DYNAMIC_STYLES.color}`,
              borderRadius: '100vh',
              bottom: "-0.25rem",
              left: "50%",
              transform: 'translateX(-50%)',
              cursor: "ns-resize",
            }}></div>
            <div style={{
              position: 'absolute',
              width: "0.5rem",
              height: "0.5rem",
              backgroundColor: DYNAMIC_STYLES.backgroundColor,
              border: `0.15rem solid ${DYNAMIC_STYLES.color}`,
              borderRadius: '100vh',
              top: "-0.25rem",
              left: "50%",
              transform: 'translateX(-50%)',
              cursor: "ns-resize",
            }}></div>
          </>
        )}
      </ButtonBase>
    )
  }

  return (
    <ButtonBase
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
        zIndex: 2,
        top: top ? `${top}px` : 0,
        left: formatLeftShift(),
        width: formatWidth(),
        textAlign: 'left',
        fontFamily: 'inherit',
        // overflow: 'hidden',
        borderRadius: '0.25rem',
        border: isSelected ? '3px solid' : '0',
        borderColor: isSelected ? "#3d3d3d" : 'transparent',
        // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
        height,
        alignItems: 'flex-start',
        boxShadow: isHovered
          ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
          : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
        transition: '0.2s ease-in-out',
        ...DYNAMIC_STYLES
        // opacity: isPast ? 0.75 : 1
      }}
    >
      <div
        className="column snug top left"
        style={{
          width: '100%',
          borderRadius: '0.25rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', lineHeight: '115%' }}>
          {event.start_time.to(event.end_time)}
        </span>
        <span style={{ fontSize: '0.75rem', lineHeight: '115%' }}>
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
        {isMember ? (
          <div className="column snug" key="isMember">
             <span style={{ fontSize: '0.75rem' }}>Is Member</span>
          </div>
        ) : (
           <div className="column snug" key="notMember">
             <span style={{ fontSize: '0.75rem' }}>Not member</span>
             <span style={{ fontSize: '0.75rem' }}>{JSON.stringify(check(), null, 2)}</span>
          </div>
        )}

      </div>

      {isHovered && (
        <>
          <div style={{
            position: 'absolute',
            width: "0.5rem",
            height: "0.5rem",
            backgroundColor: DYNAMIC_STYLES.backgroundColor,
            border: `0.15rem solid ${DYNAMIC_STYLES.color}`,
            borderRadius: '100vh',
            bottom: "-0.25rem",
            left: "50%",
            transform: 'translateX(-50%)',
            cursor: "ns-resize",
          }}></div>
          <div style={{
            position: 'absolute',
            width: "0.5rem",
            height: "0.5rem",
            backgroundColor: DYNAMIC_STYLES.backgroundColor,
            border: `0.15rem solid ${DYNAMIC_STYLES.color}`,
            borderRadius: '100vh',
            top: "-0.25rem",
            left: "50%",
            transform: 'translateX(-50%)',
            cursor: "ns-resize",
          }}></div>
        </>
      )}
    </ButtonBase>
  );
};
