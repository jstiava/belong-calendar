import { Expand, OpenInFull, LocationOnOutlined, VerifiedOutlined, EditOutlined, AddOutlined, BugReportOutlined, DeleteOutline, HideImageOutlined } from '@mui/icons-material';
import { useTheme, ButtonBase, Zoom, Fab, Typography, Popover, Tabs, Tab, Button, getContrastRatio, darken } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import { Event, Events, JunctionStatus, Member, Chronos, dayjs, Dayjs } from '@jstiava/chronos';
import { Type, Mode } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { useSnackbar } from 'notistack';


const EventQuickCard = ({
  event,
  handleView,
  handleCreate,
  handleSelect,
  source,
  filled = true
}: {
  event: Event;
  handleView?: StartViewer;
  handleCreate?: any;
  handleSelect?: (e: MouseEvent, event: Event) => void;
  source?: Member | null;
  filled?: boolean
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
    setAnchorEl(e.currentTarget);

  }

  const handleHover = () => {
    setIsHovered(prev => !prev);
  };

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  if (!event || !event.date) {
    return null;
  }

  return (
    <>
      <ButtonBase
        className="flex between"
        data-type="eventButton"
        ref={eventRef}
        onClick={handleClick}
        sx={{
          display: 'flex',
          width: "100%",
          textAlign: 'left',
          fontFamily: 'inherit',
          overflow: 'hidden',
          borderRadius: '0.25rem',
          alignItems: 'flex-start',
          padding: "0.25rem 1rem",
          transition: '0.2s ease-in-out',
        }}
      >
        <div className="flex middle">
          <div className="column snug" style={{
            width: "calc(100% - 5rem)"
          }}>
            <Typography variant='h6' sx={{
              fontSize: "0.9rem"
            }}>{event.name}</Typography>
          </div>
          <div className="column snug right middle" style={{
            width: "4.5rem",
            height: '2rem',
            color: filled ? event.theme_color || theme.palette.primary.main : "transparent",
            borderRadius: "0.5rem",
          }}>
            <Typography variant="h5" sx={{
              fontWeight: "800",
              lineHeight: "115%",
              fontSize: "0.9rem"
            }}>{event.date.format("h:mma")}</Typography>
          </div>
        </div>
      </ButtonBase>
    </>
  );
};

export default EventQuickCard;