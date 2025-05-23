"use client"
import { Expand, OpenInFull, LocationOnOutlined, VerifiedOutlined, EditOutlined, AddOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Zoom, Fab, Typography, Popover, Tabs, Tab, Button, getContrastRatio, darken, alpha } from '@mui/material';
import { MouseEvent, useState, useRef } from 'react';
import Chronos from '@/lib/utils/chronos';
import { Event, Events, JunctionStatus } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';


export type Moment = Event & {
  start_time: Chronos,
  date: Dayjs
}

export const MomentBlock = ({
  column,
  event,
  referenceTime,
  standardHeight,
  handleView,
  handleCreate,
  handleSelect,
  handleDragStart,
  isSelected,
  isStacked,
  swap
}: {
  column: number;
  event: Moment;
  referenceTime: number;
  standardHeight: number;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  handleDragStart?: any;
  isSelected: boolean;
  isStacked?: boolean;
  swap: any
}) => {
  const theme = useTheme();
  const eventRef = useRef<any | null>(null);

  const isPast = dayjs().isAfter(Events.dayjs(event.date.yyyymmdd(), event.start_time))

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const top: number | null =
    event.start_time && event.start_time!.getHMN() >= 5.5 && event.start_time!.getHMN() < 24
      ? (event.start_time.getHMN() - (6 - 0.5)) * standardHeight * 2
      : standardHeight * 2 * 18.5 + event.start_time!.getHMN() * standardHeight * 2;

  const start = event.start_time;
  const end = event.end_time;

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
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

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const formatLeftShift = () => {

    if (event.collisions === 0) {
      return '0';
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

  if (!start) {
    return <></>;
  }

  if (isStacked) {
    return (
      <>
        <ButtonBase
          sx={{
            display: 'flex',
            justifyContent: "flex-start",
            zIndex: 2,
            alignItems: 'flex-end',
            width: "100%",
            height: "1.2rem",
            backgroundColor: theme.palette.background.paper,
            opacity: isPast ? 0.75 : 1
            // boxShadow: "rgba(255, 255, 255, 0.35) 0px 5px 15px"
          }}
          onClick={handleClick}
          onContextMenu={handleRightClick}
        >
          <Typography sx={{
            color: event.theme_color || theme.palette.primary.main,
            fontSize: "0.8rem",
            // marginBottom: "1.5rem",
            // padding: "0 0 0 0.5rem",
            display: "inline-block",
            whiteSpace: "nowrap",
            overflow: "clip",
            textOverflow: "ellipsis",
            width: "100%",
            textAlign: "left"
          }}>{event.start_time.print(true)} <span
              dangerouslySetInnerHTML={{ __html: event.name }}
              style={{
                fontWeight: 700,
              }} /></Typography>
        </ButtonBase>
      </>
    )
  }

  return (
    <>
      <ButtonBase
        sx={{
          display: 'flex',
          justifyContent: "flex-start",
          top: `${top}px`,
          zIndex: 2,
          alignItems: 'flex-end',
          position: "absolute",
          width: "100%",
          height: "1.45rem",
          marginTop: "calc(-1.5rem + 1px)",
          // backgroundColor: theme.palette.background.paper,
          borderBottom: "2px solid",
          borderColor: event.theme_color || theme.palette.primary.main,
          opacity: isPast ? 0.75 : 1
          // boxShadow: "rgba(255, 255, 255, 0.35) 0px 5px 15px"
        }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <Typography sx={{
          position: "absolute",
          color: event.theme_color || theme.palette.primary.main,
          fontSize: "0.8rem",
          // marginBottom: "1.5rem",
          fontWeight: 700,
          padding: "0 0 0 0.5rem",
          display: "inline-block",
          whiteSpace: "nowrap",
          overflow: "clip",
          textOverflow: "ellipsis",
          width: "100%",
          textAlign: "left"
        }}>{event.start_time.print(true)} - {event.name}</Typography>
        <div
          style={{
            margin: "0 0 -0.3rem -0.5rem",
            width: "0.5rem",
            height: "0.5rem",
            borderRadius: "100vh",
            border: `3px solid ${event.theme_color || theme.palette.primary.main}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            boxShadow: `${theme.palette.background.paper} 0px 5px 15px`,
          }}></div>
      </ButtonBase>
    </>
  );
};
