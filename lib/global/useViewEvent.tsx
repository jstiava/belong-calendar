'use client';
import {
  Typography,
  Box,
  IconButton,
  Button,
  Drawer,
  Link,
  Popover,
  lighten,
  createTheme,
  darken,
  ThemeProvider,
  Theme,
  getContrastRatio,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  EditOutlined,
  LocationOnOutlined,
  LinkOutlined,
  ScheduleOutlined,
  CloseOutlined,
  AddOutlined,
  BugReportOutlined,
  HideSource,
  UpdateOutlined,
  MoreOutlined,
  VisibilityOutlined,
  Delete,
  CalendarMonthOutlined,
  OpenInNew,
  RestaurantRounded
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Event, JunctionStatus, Member, MemberFactory, Schedule, ScheduleData, ScheduleType, Hours, Dayjs, isSingleTimeEvent, Chronos } from '@jstiava/chronos';
import { useRouter } from 'next/router';
import { UseEvents } from '@/lib/global/useEvents';
import { adjustForContrast, Mode, Type } from '@/types/globals';
import { StartCreator } from '../global/useCreate';
import { renderTimeViewClock, TimePicker } from '@mui/x-date-pickers';
import { v4 as uuidv4 } from 'uuid';
import { MEDIA_BASE_URI } from '../useComplexFileDrop';
import { BackgroundImageGallery, PortraitImage } from '@/components/Image';
import HoursMinimap from '@/components/HoursMinimap';
import AnalogClockIcon from '@/components/AnalogClockIcon';


export default function useViewEvent(
  source: Member | null,
  Events: UseEvents,
  startCreator: StartCreator,
  parentTheme: Theme
) {
  const { enqueueSnackbar } = useSnackbar();

  const theme = parentTheme;
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRightClick, setIsRightClick] = useState(false);
  const [isOpenDetailed, setIsOpenDetailed] = useState<{ date: Dayjs, hours: Hours | boolean | null, schedule: Schedule | null, isOpen: boolean, context: string, regular: Schedule | null, lateNight: boolean } | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [scheduleAnchorEl, setScheduleAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isDialogOpen = Boolean(anchorEl);
  const isScheduleOpen = Boolean(scheduleAnchorEl);
  const [member, setMember] = useState<any>(null);

  const [schedule, setSchedule] = useState<any | null>(null);

  const [quickScheduleTools, setQuickScheduleTools] = useState<null | {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string,
    closeEarly: Dayjs | null
  }>(null);

  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  const getCloseEarlySuggestedValue = (selected: any) => {
    try {
      const hours = selected.active.getHours(selected.date.day(), new Chronos(12));
      if (typeof hours === 'boolean') {
        return null;
      }
      return hours.getMax().add(-1, false).getDayjs()
    }
    catch (err) {
      return null;
    }
  }

  const setDayToRegularHours = async (e: any, s: {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string
  }) => {
    const theEvent = event;

    if (!source || !theEvent || theEvent instanceof Array) {
      return;
    };

    await MemberFactory.login(theEvent, source);

    const regular = theEvent.getRegularHours(s.date);

    if (!regular) {
      enqueueSnackbar("No regular hours on this day.", {
        variant: "warning"
      })
      return;
    }

    const schedules = theEvent.getSchedulesInFrame(s.date);
    if ((s.active && schedules.length > 1) && (schedules[1].uuid === regular.uuid)) {

      if (!s.active.start_date || !s.active.end_date || !theEvent.schedules || !s.active) {
        return;
      }

      if (s.active.start_date.isSame(s.date, 'd') && s.active.end_date.isSame(s.date, 'd')) {
        try {
          const filtered = theEvent.schedules.filter(x => s.active!.uuid != x.uuid);
          theEvent.schedules = filtered;
          await Events.swap(theEvent);
        }
        catch (err) {
          console.log("Error");
        }
        return;
      }
    }


    const newHours = new Schedule({
      ...regular.eject(),
      uuid: String(uuidv4()),
      name: "Regular Hours",
      schedule_type: 'special'
    });
    newHours.start_date = s.date;
    newHours.end_date = s.date;
    newHours.schedule_type = ScheduleType.Special;
    theEvent.pushSchedule(newHours);
    Events.update(theEvent.eject());
    return;
  }

  const addSchedule = async (e: any, s: {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string
  }) => {

    if (!source) {
      return;
    }

    const theEvent = event;

    if (!theEvent || theEvent instanceof Array) {
      return;
    };

    await MemberFactory.login(theEvent, source);

    const target = e.currentTarget || e.target;
    setScheduleAnchorEl(target)
    setSchedule(new Schedule({
      ...s.active ? s.active.eject() : {},
      uuid: String(uuidv4()),
      name: "New Schedule",
      start_date: s.date.yyyymmdd(),
      end_date: s.date.yyyymmdd(),
      schedule_type: ScheduleType.Special,
    })
    );
  }

  const editSchedule = async (e: any, s: {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string
  }) => {

    const theEvent = event;

    if (!source || !s.active || !theEvent || theEvent instanceof Array) {
      return;
    };

    await MemberFactory.login(theEvent, source);

    startCreator(Type.Schedule, Mode.Modify, {
      ...s.active.eject(),
      callback: (sch: ScheduleData) => {
        const newObject = new Schedule(sch, true);
        console.log({
          sch,
          newObject
        })
        theEvent.pushSchedule(newObject);
        Events.swap(theEvent);
      }
    })

    return;
  }

  const commitCloseEarly = async (e: any, s: {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string,
    closeEarly: Dayjs | null
  }) => {

    if (!s.closeEarly) {
      return;
    }

    const theEvent = event;

    if (!source || !theEvent || theEvent instanceof Array) {
      console.log({
        message: "No event found",
        s
      })
      return;
    }

    await MemberFactory.login(theEvent, source);

    if (!s.active) {
      console.log({
        message: "There is no active schedule.",
        s
      })
      return;
    }
    const hours = s.active.getHours(s.date.day());
    if (typeof hours === 'boolean') {
      console.log({
        message: "The hours for this day are not interesting.",
        s
      })
      return;
    }

    try {
      const props = {
        date: s.date,
        end_date: null,
        start_time: s.closeEarly.toLocalChronos(),
        end_time: hours.getMax()
      }
      console.log(props);
      const newSchedule = props.start_time.getHMN() > hours.getMax().getHMN() ? s.active.add({
        ...props,
        start_time: hours.getMax(),
        end_time: s.closeEarly.toLocalChronos()
      }) : s.active.subtract(props);
      theEvent.pushSchedule(newSchedule);
      await Events.update(theEvent.eject());
    }
    catch (err) {
      console.log(err)
    }
    // replace(theEvent.eject());
    return;
  }

  const commitCloseAllDay = async (e: any, s: {
    active: Schedule | null,
    schedules: Schedule[],
    date: Dayjs,
    uuid: string
  }) => {

    const theEvent = event;

    if (!source || !theEvent || theEvent instanceof Array) {
      return;
    }

    await MemberFactory.login(theEvent, source);
    theEvent.pushSchedule(Schedule.create("Closed All Day", 'closure', "Daily: Closed", s.date, s.date));
    Events.update(theEvent.eject());

    return;
  }


  const handleOpenEventPopover = async (type: Type, theEvent: Member, props: any = {}) => {
    console.log("Checkpoint");

    setIsRightClick(props.isRightClick ? true : false);
    const target = props.e.currentTarget || props.e.target;
    setAnchorEl(target as HTMLButtonElement);

    if (!(theEvent instanceof Event)) {
      return;
    }

    setEvent(theEvent);

    const isOpen = theEvent.isOpenDetailed(props.date);
    setIsOpenDetailed(isOpen);

    if (!theEvent || theEvent instanceof Array || !isOpen) {
      return;
    }
    const theValue = {
      uuid: theEvent.uuid,
      schedules: theEvent.schedules ? theEvent.schedules : [],
      active: isOpen.schedule,
      date: props.date,
      closeEarly: null
    }
    theValue.closeEarly = getCloseEarlySuggestedValue(theValue);

    setQuickScheduleTools(theValue);
  };

  const handleCloseEvent = () => {
    setAnchorEl(null);
    document.body.removeEventListener('wheel', handleCloseEvent);
    document.body.removeEventListener('touchstart', handleCloseEvent, false);
    setScheduleAnchorEl(null);
    return;
  };


  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === 'Escape') {
        handleCloseEvent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {

    if (!event || !source) {
      setMember(null);
      return;
    }
    const member = event.junctions.get(source.id());
    setMember(member);

  }, [source, event])

  const handleEditEventRequest = async () => {
    if (!event) return;
    handleCloseEvent();
    await MemberFactory.getMetadata(event);
    startCreator(Type.Event, Mode.Modify, event, {
      callback: (x: any) => Events.update(x)
    });
    return;
  };

  const warningColor = event && event.theme_color ? getContrastRatio("#FFD700", event.theme_color) > 4.5 ? "#FFD700" : theme.palette.primary.contrastText : theme.palette.primary.contrastText;

  const EventDialog = (
    <>
      <Box className="column snug" sx={{ padding: 0, cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          handleCloseEvent();
          event && router.push(`/event/${event.id()}?base=${router.query.base}`);
        }}>

        {event && event.cover_img && (
          <div className="flex snug"
            style={{
              position: "relative",
              height: "10rem",
              backgroundColor: '#ffffff25'
            }}
          >
            {event.icon_img ? (
              <PortraitImage
                path={`${MEDIA_BASE_URI}/${event.icon_img.path}`}
                diameter="4rem"
                style={{
                  position: "absolute",
                  right: "1rem",
                  bottom: "-2rem",
                  backgroundColor: event.theme_color || "black",
                  zIndex: 5
                }}
              />
            ) : (
              <></>
              // <EventOutlined fontSize='large' sx={{ marginTop: "0.2rem" }} />
            )}
            <BackgroundImageGallery
              base={`${MEDIA_BASE_URI}`}
              keys={event.cover_img ? [event.getCoverImageLink() || ''] : event.metadata.files || []}
              width="100%"
              height="10rem"
            />
          </div>
        )}
        <div className="column" style={{
          padding: "1rem",
        }}>

          <div className="column snug">

            {source && (
              <div style={{
                position: 'absolute',
                right: "1rem",
                top: "1rem"
              }}>
                <Button
                  size='small'
                  sx={{ padding: "0", fontSize: "0.9375rem", color: 'inherit' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEventRequest()
                  }}
                  startIcon={<EditOutlined />}
                >
                  Edit
                </Button>
              </div>
            )}


            <div className="flex between">

              <div style={{ display: 'inline' }}>

                {event && (

                  <Link variant="h5" component="h2"
                    className="hover-underline"
                    sx={{
                      display: 'inline',
                      backgroundImage: `linear-gradient(#00000000, #00000000), linear-gradient(${event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText}, ${event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText})`,
                      textDecoration: `none`,
                      backgroundSize: `100% 0.15rem, 0 0.15rem`,
                      backgroundPosition: `100% 100%,0 100%`,
                      backgroundRepeat: `no-repeat`,
                      transition: `background-size .3s`,
                      color: 'inherit',
                      cursor: "pointer",
                      whiteSpace: "pre-wrap",
                      fontWeight: 700,
                      textAlign: 'left',
                      lineHeight: '115%',
                      fontSize: "1.25rem"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseEvent();
                      const currentQuery = router.query;

                      const pathParts = router.pathname.split('/');
                      const currentTab = pathParts[3];
                      const { base, module, ...rest } = router.query;
                      if (event) {
                        router.push({
                          pathname: `${router.asPath.startsWith('/me') ? '/me/' : '/be/'}${event.id()}${currentTab ? `/${currentTab}` : ``}`,
                          query: {
                            ...rest,
                            base: source?.id()
                          }
                        })
                      }
                    }}>

                    <span dangerouslySetInnerHTML={{ __html: event.name }} />
                  </Link>
                )}
              </div>
              {event && (event.icon_img && !event.cover_img) ? (
                <PortraitImage
                  path={`${MEDIA_BASE_URI}/${event.icon_img.path}`}
                  diameter="4rem"
                  style={{
                    backgroundColor: event.theme_color || "black",
                    zIndex: 5
                  }}
                />
              ) : (
                <></>
              )}
            </div>
            {event && event.subtitle && <Typography variant="caption">{event.subtitle}</Typography>}
          </div>
          {event && (
            <div className="column">
              {event.date && event.end_date && (
                <div className="column compact">
                  <div className="flex compact">
                    <CalendarMonthOutlined fontSize="small" />
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{event.date.to(event.end_date)}</Typography>
                  </div>
                </div>
              )}

              {isOpenDetailed && isOpenDetailed.schedule && (

                <>
                  {isOpenDetailed.schedule.getActiveDaysPerWeek() > 3 ? (

                    <>
                      <div className="column compact" style={{ width: "100%", color: isOpenDetailed.schedule.isNotRegular() ? warningColor : 'inherit' }}>
                        <div className="flex compact" style={{ color: isOpenDetailed.schedule.isNotRegular() ? warningColor : 'inherit' }}>
                          <ScheduleOutlined fontSize='small' />
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{isOpenDetailed.date.format("ddd")} <span style={{ opacity: 0.75 }}>&middot; {isOpenDetailed.hours && isOpenDetailed.hours instanceof Hours ? isOpenDetailed.hours.as_text : isOpenDetailed.hours ? "Open" : "Closed"}{isOpenDetailed.schedule.isNotRegular() && <> &middot; {isOpenDetailed.schedule.name}</>}</span></Typography>
                        </div>
                      </div>
                    </>

                  ) : (
                    <div className="div flex compact">
                      <ScheduleOutlined fontSize='small' />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{isOpenDetailed.schedule.as_text} </Typography>
                    </div>
                  )}
                </>
              )}

              {event && isSingleTimeEvent(event) && (
                <div className="column compact">
                  <div className="flex">
                    <div className="flex compact fit">
                      <CalendarMonthOutlined fontSize="small" />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{event.date.to(event.end_date)}</Typography>
                    </div>
                    <div className="flex compact fit">
                      <AnalogClockIcon
                        hour={event.start_time.getHour()}
                        minute={event.start_time.getMinute()}
                        color={event.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.main}
                      />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{event.start_time.to(event.end_time)}</Typography>
                    </div>
                  </div>
                </div>
              )}



              {event.location_name ? (
                <>
                  <div className="column compact">
                    <div className="flex between">
                      <div className="flex compact top">
                        <LocationOnOutlined fontSize="small" />
                        <div className="column snug">
                          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{event.location_name}</Typography>
                          <Typography sx={{ fontWeight: "normal", fontSize: "0.85rem" }}>{event.location_address}</Typography>
                        </div>
                      </div>
                      <IconButton sx={{ color: "inherit" }} onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/place/?q=place_id:${event.location_place_id}`, "_blank")
                      }}>
                        <LinkOutlined />
                      </IconButton>
                    </div>
                  </div>
                </>
              ) : (
                <>

                </>
              )}
            </div>
          )}

          {(event && event.children) && event.children.some(e => e.link) && (
            (() => {
              const theLink = event.children.find(e => e.link != null);

              if (!theLink || !theLink.link) {
                return null;
              }

              return (
                <Button
                  variant={'flipped'}
                  size="large"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    height: "2.75rem"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(String(theLink.link), '_blank')
                  }}
                >
                  {theLink.name}
                </Button>
              )
            })()
          )}
          <div className="flex right">
           {event && (
             <Button
              variant={'flipped'}
              size="small"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                color: event.theme_color,
                backgroundColor: event.theme_color && theme.palette.getContrastText(event.theme_color)
              }}
              onClick={(e) => {
                e.stopPropagation();
                // window.open(String(theLink.link), '_blank')
              }}
            >
              More
            </Button>
           )}
          </div>
        </div>
      </Box>
    </>
  );

  const EventContextMenu = (

    <>
      <div className="column snug" style={{
        color: theme.palette.text.primary
      }}>

        <Button
          onClick={async () => {
            startCreator(Type.Event, Mode.Modify, event);
            handleCloseEvent();
          }}
          sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<EditOutlined />}>Edit</Button>

        {event && (event.end_date || !event.date) && (
          <>
            {/* {member && member.is_shown && (

              <Button
                onClick={async () => {
                  await event.updateHost(source, {
                    is_shown: false
                  })
                    .then(newEvent => {
                      setEvent(newEvent);
                      Events.hide(event);
                    })
                    .catch(() => {
                      return;
                    })

                  handleCloseEvent();
                }}
                sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<HideSource />}>Hide on Calendar</Button>
            )} */}


            {member && source && !member.is_shown && (

              <Button
                onClick={async () => {
                  await event.updateHost(source, {
                    is_shown: true
                  })
                    .then(newEvent => {
                      setEvent(newEvent);
                      Events.swap(newEvent);
                    })
                    .catch(() => {
                      return;
                    })
                  handleCloseEvent();
                }}
                sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem", color: theme.palette.text.primary }} variant="text" startIcon={<VisibilityOutlined />}>Show on Calendar</Button>
            )}
          </>
        )}


        {(quickScheduleTools && quickScheduleTools.active) && quickScheduleTools.active.isNotRegular() && (
          <Button
            onClick={async (e) => {
              handleCloseEvent();
              setDayToRegularHours(e, quickScheduleTools);
            }}
            sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem", color: theme.palette.text.primary }} variant="text" startIcon={<UpdateOutlined />}>Set to Regular Hours</Button>
        )}

        {event && quickScheduleTools && !event.date && (

          <>

            <Button
              onClick={async (e) => {
                // handleCloseEvent();
                addSchedule(e, quickScheduleTools);
              }}
              sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem", color: theme.palette.text.primary }} variant="text" startIcon={<AddOutlined />}>Add Schedule</Button>
          </>
        )}

        {quickScheduleTools && quickScheduleTools.active && (

          <Button
            onClick={async (e) => {
              handleCloseEvent();
              editSchedule(e, quickScheduleTools);
            }}
            sx={{ color: theme.palette.text.primary, justifyContent: "flex-start", padding: "0.5rem 1rem" }} variant="text" startIcon={<EditOutlined />}>Edit "{quickScheduleTools.active.name}"</Button>
        )}

        {quickScheduleTools && quickScheduleTools.active && quickScheduleTools.date && quickScheduleTools.closeEarly && (
          <div className="flex compact2"
            style={{
              padding: "0.5rem",
            }}
          >
            <TimePicker
              format='h:mm A'
              value={quickScheduleTools.closeEarly}
              onChange={(date) => setQuickScheduleTools((prev: any) => {
                if (!prev) {
                  return null;
                }
                return {
                  ...prev,
                  closeEarly: date
                }
              })}
              label={'Close at'}
              closeOnSelect
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
              slotProps={{
                field: { shouldRespectLeadingZeros: true },
                textField: {
                  variant: 'filled',
                  size: 'small'
                },
              }}
            />
            <Button onClick={async (e) => {
              handleCloseEvent();
              await commitCloseEarly(e, quickScheduleTools);
            }} size="small" sx={{ width: "fit-content" }}>Save</Button>
          </div>
        )}

        {event && quickScheduleTools && !event.date && (

          <Button
            variant="contained"
            color="error"
            onClick={async (e) => {
              handleCloseEvent();
              await commitCloseAllDay(e, quickScheduleTools)
            }}
            sx={{ color: theme.palette.text.primary, justifyContent: "flex-start", padding: "0.5rem 1rem" }}
            startIcon={<CloseOutlined />}>Close All Day</Button>
        )}

        <Button
          variant="text"
          color="error"
          onClick={async () => {
            startCreator(Type.Event, Mode.Delete, null, {
              items: [event]
            });
            handleCloseEvent();
          }}
          sx={{ justifyContent: "flex-start", padding: "0.5rem 1rem" }}
          startIcon={<Delete />}>Delete</Button>


        <Button
          variant="text"
          onClick={async () => {
            console.log({
              message: "Debug",
              event
            })
          }}
          sx={{ color: theme.palette.text.primary, justifyContent: "flex-start", padding: "0.5rem 1rem" }}
          startIcon={<BugReportOutlined />}>Debug</Button>


        {event && (
          <Button
            variant="text"
            onClick={async () => {
              console.log({
                message: "Open In New",
                event
              });
              window.open(`/be/${event.id()}`)
            }}
            sx={{ color: theme.palette.text.primary, justifyContent: "flex-start", padding: "0.5rem 1rem" }}
            startIcon={<OpenInNew />}>Switch</Button>
        )}
        <Popover
          anchorEl={scheduleAnchorEl}
          open={isScheduleOpen}
          // placement='left-start'
          onClose={(e: any) => {
            e.stopPropagation();
            // handleCloseEvent();
            setScheduleAnchorEl(null)
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <div className="column compact"
            style={{
              width: "29rem",
              padding: '1rem 2rem'
            }}>

            <div className="flex">
              {schedule && (
                <HoursMinimap
                  mode={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                  schedule={schedule}
                  onChange={(newSch) => setSchedule(newSch)}
                />
              )}
            </div>
            <div className="flex">
              <Button onClick={e => {
                setSchedule(null);
              }}>Cancel</Button>
              <Button onClick={e => {

                if (!event) {
                  return;
                }
                const newObject = new Schedule(schedule, true);
                event.pushSchedule(newObject);
                Events.update(event.eject());
              }} variant="contained">Save</Button>
            </div>
          </div>
        </Popover>
      </div>

    </>
  )

  const EventPopover = (
    <>
      {isSM ? (
        <Drawer
          anchor='bottom'
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          open={isDialogOpen}
          onClose={() => {
            handleCloseEvent();
          }}
          keepMounted
          sx={{
            zIndex: 4000,
            '& .MuiDrawer-paper': {
              width: '100vw',
              boxShadow: 1,
              backgroundColor: isRightClick ? theme.palette.background.paper : theme.palette.primary.main || lighten(theme.palette.background.paper, 0.05),
              color: isRightClick ? theme.palette.text.primary : event?.theme_color ? theme.palette.getContrastText(event.theme_color) : theme.palette.primary.contrastText,
            },
          }}
        >
          {isRightClick ? EventContextMenu : EventDialog}
        </Drawer>
      ) : (
        <Popover
          anchorEl={anchorEl}
          open={isDialogOpen}
          // placement='left-start'
          onClose={(e: any) => {
            e.stopPropagation();
            handleCloseEvent();
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          // disableScrollLock={true}
          // popperOptions='top-end'
          sx={{
            // zIndex: 4000,
            // top: 0,
            boxShadow: 14,
            '& .MuiPopover-paper': {
              width: isRightClick ? '15rem' : '25rem',
              boxShadow: 5,
              paddingTop: isRightClick ? "0.25rem" : "0",
              backgroundColor: isRightClick ? theme.palette.background.paper : event && event.theme_color || lighten(theme.palette.background.paper, 0.05),
              color: isRightClick ? theme.palette.text.primary : (event && event.theme_color) && theme.palette.getContrastText(event.theme_color) || theme.palette.text.primary,
            }
          }}
        >

          {isRightClick ? EventContextMenu : EventDialog}
        </Popover >
      )}
    </>
  );

  return {
    EventPopover,
    handleOpenEventPopover,
  };
}
