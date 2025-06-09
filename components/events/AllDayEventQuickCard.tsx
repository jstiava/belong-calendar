import { useTheme, ButtonBase, Typography, Slider, SliderValueLabelProps, Tooltip } from '@mui/material';
import { MouseEvent, useState, useRef, useEffect } from 'react';
import { Event, JunctionStatus, Member, Dayjs } from '@jstiava/chronos';
import { Type } from '@/types/globals';
import { StartViewer } from '@/lib/global/useView';
import { useSnackbar } from 'notistack';


function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;
  const theme = useTheme();

  if (!value) {
    return null;
  }

  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      arrow
      title={`${Number(value).toFixed(2)}%`}
    >
      {children}
    </Tooltip>
  );
}

const AllDayEventQuickCard = ({
  date,
  event,
  handleView,
  handleCreate,
  handleSelect,
  source,
  filled = true
}: {
  date: Dayjs;
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
        className="column snug"
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
          // backgroundColor: isMember ? event.theme_color || theme.palette.primary.main : `${theme.palette.background.paper}ee`,
          // color: isMember ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText : event.theme_color || theme.palette.primary.main,
          // border: '3px solid',
          // borderBottom: isSelected ? '3px solid' : `3px solid ${event.theme_color ? darken(event.theme_color, 0.25) : theme.palette.primary.dark} !important`,
          padding: "0",
          alignItems: 'flex-start',
          // boxShadow: isHovered
          //   ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;'
          //   : 'rgba(0, 0, 0, 0.05) 0px 3px 6px, rgba(0, 0, 0, 0.1) 0px 3px 6px;',
          transition: '0.2s ease-in-out',
          height: 'fit-content'
          // opacity: isPast ? 0.75 : 1
        }}
      >
        {/* <BackgroundImageGallery
          base={`${MEDIA_BASE_URI}`}
          keys={event.cover_img ? [event.getCoverImageLink()] : event.metadata.files || []}
          width="100%"
          height="10rem"
          style={{
            // backgroundPosition: 'top',
            borderRadius: "0.5rem",
            marginBottom: "1rem"
          }}
        /> */}
        <div className="flex top">
          <div className="column compact2 center middle" style={{
            width: "3.5rem",
            height: '3.5rem',
            backgroundColor: filled ? event.theme_color || theme.palette.primary.main : "transparent",
            color: filled ? event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText : event.theme_color || theme.palette.primary.main,
            borderRadius: "0.5rem",
            border: filled ? "0.25rem solid transparent" : `0.25rem solid ${theme.palette.primary.dark}`
          }}>
            <Typography variant="h5" sx={{
              fontWeight: "800",
              lineHeight: "100%",
              fontSize: "1.35rem"
            }}>{event.date.format("D")}</Typography>
            <Typography variant="caption" sx={{
              textTransform: 'uppercase',
              fontSize: "0.65rem",
              lineHeight: "100%",
              fontWeight: 700
            }}>{event.date.format("MMM")}</Typography>
          </div>
          <div className="column snug" style={{
            width: "calc(100% - 8rem)"
          }}>
            <Typography variant='h6'>{event.name}</Typography>
            {event.end_date && !(event.date.isSame(event.end_date, 'd')) && (
              <div className="flex between">


                <Slider
                  aria-label="Progress"
                  value={date.diff(event.date, 'day') / event.end_date.diff(event.date, 'day') * 100}
                  valueLabelDisplay="auto"
                  slots={{
                    valueLabel: ValueLabelComponent
                  }}
                  sx={{
                    width: "calc(100% - 5rem)",
                    '& .MuiSlider-thumb': {
                      height: 20,
                      width: 20,
                      backgroundColor: theme.palette.background.paper,
                      border: `0.3rem solid ${event.theme_color || theme.palette.primary.main}`,
                      boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
                      '&:focus, &:hover, &.Mui-active': {
                        boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
                      },
                      '&:before': {
                        boxShadow:
                          '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
                      },
                    },
                    '& .MuiSlider-valueLabel': {
                      fontSize: 12,
                      fontWeight: 'normal',
                      top: -6,
                      backgroundColor: 'unset',
                      color: event.theme_color || theme.palette.text.primary,
                      '&::before': {
                        display: 'none',
                      },
                      '& *': {
                        background: 'transparent',
                        color: '#000',
                        ...theme.applyStyles('dark', {
                          color: '#fff',
                        }),
                      },
                    },
                    '& .MuiSlider-track': {
                      border: 'none',
                      height: 5,
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.5,
                      boxShadow: 'inset 0px 0px 4px -2px #000',
                      backgroundColor: theme.palette.divider,
                    },
                    ...theme.applyStyles('dark', {
                      color: event.theme_color || theme.palette.text.primary,
                    }),
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    width: "5rem",
                    textAlign: "right"
                  }}>{event.end_date.diff(date, 'day') + 1} days left</Typography>
              </div>
            )}

            {event.start_time && !event.end_time && (
              <Typography sx={{
                fontSize: "0.8rem"
              }}>{event.start_time.print()}</Typography>
            )}
            {event.start_time && event.end_time && (
              <Typography sx={{
                fontSize: "0.8rem"
              }}>{event.start_time.to(event.end_time, 1)}</Typography>
            )}
          </div>
          {event.end_date && !(event.date.isSame(event.end_date, 'd')) && (
            <div className="column compact2 center middle" style={{
              width: "3.5rem",
              height: '3.5rem',
              color: theme.palette.text.primary,
              borderRadius: "0.5rem",
              border: `0.25rem solid ${theme.palette.text.primary}`
            }}>
              <Typography variant="h5" sx={{
                fontWeight: "800",
                lineHeight: "100%",
                fontSize: "1.35rem"
              }}>{event.end_date.format("D")}</Typography>
              <Typography variant="caption" sx={{
                textTransform: 'uppercase',
                fontSize: "0.65rem",
                lineHeight: "100%",
                fontWeight: 700
              }}>{event.end_date.format("MMM")}</Typography>
            </div>
          )}
        </div>
      </ButtonBase>
    </>
  );
};

export default AllDayEventQuickCard;