"use client"
import { UseSession } from "@/lib/global/useSession";
import { Event, Location, Member, MemberFactory } from "@/schema";
import { alpha, Collapse, Drawer, Button, IconButton, Popover, TextField, ThemeProvider, ToggleButton, Typography, useMediaQuery, useTheme, ButtonBase, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { UseBase } from "@/lib/global/useBase";
import { useRouter } from "next/router";
import { AddOutlined, CalendarMonthOutlined, DirectionsWalkOutlined, MoreHoriz, ScheduleOutlined, Search, SortByAlphaOutlined, SortOutlined } from "@mui/icons-material";
import { TransitionGroup } from 'react-transition-group';
import { Mode, Type } from "@/types/globals";
import { useSnackbar } from "notistack";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import ScheduleCalendar from "../calendar/ScheduleCalendar";
import StyledToggleButtonGroup from "../StyledToggleButtonGroup";
import useViewEvent from "@/lib/global/useViewEvent";
import LeftSideBarBaseAccordionModule from "../accordions/LeftSideBarBaseAccordionModule";
import EventSidebarCard from "../EventSidebarCard";
import LocationSidebarCard from "../LocationSidebarCard";
import StyledWeekPicker from "../calendar/WeekPicker";
import axiosInstance from "@/lib/utils/axios";
import axios from "@/lib/utils/axios";

export interface SessionSidebarProps {
  Session: UseSession;
}

export default function SessionSidebar({
  Session,
}: SessionSidebarProps) {

  const router = useRouter();
  const theme = useTheme();

  const [cache, setCache] = useState<string | null>(null);
  const [recommendedActions, setRecommendedActions] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { EventPopover, handleOpenEventPopover } = useViewEvent(
    Session.base,
    Session.Events,
    Session.Creator.startCreator,
    theme
  );

  useEffect(() => {
    if (Session.base && !module) {
      if (cache && cache === Session.base.id()) {
        return;
      }
      if (Session.base.integration) {
        axiosInstance.get(`/api/v1/auth/${Session.base.integration}/actions`, {
          params: {
            uuid: Session.base.id()
          }
        })
        .then(res => {
          setRecommendedActions(res.data.actions);
          setCache(Session.base!.id());
        })
        .catch(err => {
          console.error(err)
          setRecommendedActions(null);
        })
      }
      else {
        setRecommendedActions(null);
      }
    }
  }, [Session.base])


  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popover_id = open ? 'simple-popover' : undefined;


  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { enqueueSnackbar } = useSnackbar();

  const [isBasesViewOpen, setIsBasesViewOpen] = useState<boolean>(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);

  const [isPeak, setIsPeak] = useState(false);

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    setIsBasesViewOpen(prev => !prev);
  };

  const [expanded, setExpanded] = useState<boolean>(false);
  const [eventList, setEventList] = useState<Event[] | null>(null);
  const [sort, setSort] = useState('all');
  const [filter, setFilter] = useState('all');

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    newSort: string | null,
  ) => {

    if (!eventList) {
      return;
    }


    if (newSort === 'alpha') {
      const sorted = eventList.sort((a, b) => a.name.localeCompare(b.name));
      setSort('alpha')
      return;
    }

    if (newSort === 'date') {
      const sorted = eventList.sort((a, b) => {
        if (!a.date || !b.date) {
          if (a.date && !b.date) {
            return -1;
          }
          else if (!a.date && b.date) {
            return 1;
          }
          const aStatus = a.isOpenDetailed();
          const bStatus = b.isOpenDetailed();
          if (!aStatus || !bStatus) {
            return 0;
          }
          return aStatus.isOpen && !bStatus.isOpen ? -1 : 1;
        }

        const dateDiff = a.date.diff(b.date, 'day');
        if (dateDiff != 0) {
          return dateDiff;
        }

        if (a.getMin() && b.getMin()) {
          return a.getMin()!.getHMN() - b.getMin()!.getHMN()
        }
        else if (a.getMin()) {
          return -1;
        }
        else if (b.getMin()) {
          return 1;
        }
        return 0;
      });
      setSort('date')
      return;
    }
  }


  useEffect(() => {
    setEventList(Base.Events.events);
  }, [Base.Events.events]);


  return (
    <>
      {EventPopover}
      <Drawer
        // keepMounted
        hideBackdrop
        variant="persistent"
        anchor="left"
        open={Session.Preferences.isSidebarDocked}
        onClick={() => {
          if (isSm) {
            Session.Preferences.setIsSidebarDocked(false);
          }
        }}
        onClose={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}
        sx={{
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            width: isSm ? '100vw' : '20rem',
            left: 0,
            top: 0,
            height: `calc(100vh - env(safe-area-inset-top));`,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            zIndex: 5
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: "calc(100vh-4rem)", overflowY: 'hidden', alignItems: 'flex-start', overflowX: 'hidden', width: '100%' }}>

          <div style={{
            position: "absolute",
            bottom: 0,
            background: `linear-gradient(${alpha(theme.palette.background.paper, 0)}, ${theme.palette.background.paper})`,
            height: "4rem",
            width: "100%",
            zIndex: 6
          }}></div>

          <LeftSideBarBaseAccordionModule
            Session={Session}
            Base={Base}
            Module={Module}
            module={module}
            expanded={expanded}
            onChange={() => setIsBasesViewOpen(prev => !prev)}
          />

          <TransitionGroup
            className="flex top"
            style={{
              width: "100%",
              height: "calc(100% - 6rem)"
            }}
          >
            <Collapse sx={{ width: "100%" }}>

              {!isSm ? (
                <>
                  {router.query.event && module ? (
                    <ThemeProvider theme={Module.theme}>
                      <div className="column snug" >
                        {module instanceof Event && module.schedules && module.schedules.length > 0 ? (
                          <ScheduleCalendar
                            key={`${(module as Event).version}_${module.id()}`}
                            item={module as Event}
                            Calendar={Module.Calendar}
                            Events={Module.Events}
                            startCreator={Module.Creator.startCreator}
                            onSelect={() => {
                              return;
                            }}
                          />
                        ) : (
                          <StyledWeekPicker
                            mode="dark"
                            Calendar={Module ? Module.Calendar : Session.Calendar}
                            value={Module.Calendar.frameDate}
                          />
                        )}
                        <div style={{ height: "0.5rem" }}></div>
                      </div>
                    </ThemeProvider>
                  ) : (
                    <StyledWeekPicker
                      mode="dark"
                      Calendar={Base ? Base.Calendar : Session.Calendar}
                      value={Module.Calendar.frameDate}
                    />
                  )}
                </>
              ) : (
                <div style={{ height: "1rem" }}></div>
              )}
              <div style={{
                padding: "0 0.5rem 0.5rem 0.5rem"
              }}>
                <TextField
                  size="small"
                  sx={{
                    '& .MuiFilledInput-input': {
                      padding: "8px 0 8px 8px"
                    }
                  }}
                  placeholder="Search"
                  variant="filled"
                  fullWidth
                  name="Search"
                  aria-label="Search"
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  // onChange={async (e) => {
                  //   if (!e.target.value || e.target.value === "") {
                  //     handleFilterChange(e, null);
                  //     return;
                  //   }
                  //   // const filteredBySearch = await Base.Events.search({ q: e.target.value, type: Type.Event });
                  //   setEventList(filteredBySearch);
                  //   setFilter("search");
                  // }}
                  InputProps={{
                    startAdornment: (
                      <Search fontSize="small" />
                    ),
                    endAdornment: (
                      <div className="flex snug fit" style={{
                        position: 'absolute',
                        right: 0,
                        height: 'fit-content'
                      }}>
                        <Popover
                          id={popover_id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', width: "17rem", borderRadius: "1rem", overflow: "hidden" }}>
                            <Typography variant="h6" sx={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.5rem"
                            }}>FILTER</Typography>
                            <StyledToggleButtonGroup value={filter} size='small' isMini={false}>
                              <ToggleButton
                                value="all"
                                onClick={(e) => {
                                  handleFilterChange(e, null);
                                  handleClose();
                                }}
                              >
                                All
                              </ToggleButton>
                              <ToggleButton
                                value="events"
                                onClick={(e) => {
                                  handleFilterChange(e, 'events')
                                  handleClose();
                                }}
                              >
                                Events
                              </ToggleButton>
                              <ToggleButton
                                value="scheduled"
                                onClick={(e) => {
                                  handleFilterChange(e, 'scheduled');
                                  handleClose();
                                }}
                              >
                                Scheduled
                              </ToggleButton>
                            </StyledToggleButtonGroup>
                            <Typography variant="h6" sx={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.5rem"
                            }}>SORT</Typography>
                            <StyledToggleButtonGroup value={sort} size='small' isMini={false} sx={{
                              flexDirection: 'column',
                              '& .MuiButtonBase-root': {
                                justifyContent: 'flex-start',
                                width: "100%"
                              }
                            }}
                            >
                              <ToggleButton
                                value="alpha"
                                onClick={(e) => {
                                  handleSortChange(e, 'alpha');
                                  handleClose();
                                }}
                              >
                                <SortByAlphaOutlined fontSize="small" />
                                Alphabetical
                              </ToggleButton>
                              <ToggleButton
                                value="date"
                                onClick={(e) => {
                                  handleSortChange(e, 'date');
                                  handleClose();
                                }}
                              >
                                <ScheduleOutlined fontSize="small" />
                                Date & Time
                              </ToggleButton>
                            </StyledToggleButtonGroup>

                          </div>
                        </Popover>
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault();
                            setAnchorEl(e.currentTarget)
                          }}
                        >
                          <SortOutlined fontSize="small" />
                        </IconButton>
                      </div>
                    )
                  }}
                />
              </div>



              <div className="column" style={{ padding: "0 0.5rem 8rem 0.5rem", position: "relative", width: "100%", height: isSm ? "calc(100vh - 10rem)" : "calc(100vh - 25rem)", overflowY: "scroll" }}>
                <div className="column snug" style={{ position: "relative", width: "100%" }}>
                  {Session.base && eventList && eventList.map((s: Event) => {
                    return (
                      <EventSidebarCard
                        id={s.id()}
                        key={s.id()}
                        event={s}
                        startCreator={Base.Creator.startCreator}
                        startViewer={handleOpenEventPopover}
                        base={Session.base!}
                      />
                    )
                  })}

                  {Session.base && Base.Locations.locations && Base.Locations.locations.map((l: Location) => {
                    return (
                      <LocationSidebarCard
                        id={l.id()}
                        key={l.id()}
                        location={l}
                        startCreator={Base.Creator.startCreator}
                        startViewer={handleOpenEventPopover}
                        base={Session.base!}
                      />
                    )
                  })}
                </div>
              </div>
            </Collapse>

          </TransitionGroup>
        </div>
        <div
          className="column compact2"
          style={{
            padding: '1rem',
            position: 'absolute',
            width: '100%',
            bottom: 0,
            left: 0,
            zIndex: 10
          }}
        >

          {(Session.base && Base.Events) && Session.base.integration && (
            <div className="column snug">
              {recommendedActions && recommendedActions.map((action : any) => (
                <ButtonBase
                  key={action.id}
                  onClick={() => {
                    axios.post(`/api/v1/auth/${Session.base!.integration}/actions`, {
                      source: MemberFactory.getToken(Session.base!),
                      actions: [action]
                    })
                    .then(res => {
                      router.reload()
                    })
                    .catch(err => {
                      alert("Failed")
                    })
                  }}
                  className="flex between"
                  sx={{
                    padding: "0.5rem",
                    // backgroundColor: theme.palette.primary.light,
                    borderRadius: "0.25rem"
                  }}>
                  <div className="flex compact fit">
                    <Avatar
                      sx={{
                        width: '1.5rem',
                        height: '1.5rem',
                        backgroundColor: theme.palette.primary.contrastText,
                        color: theme.palette.primary.main,
                        border: `2.5px dashed ${theme.palette.primary.main}`
                      }}
                    >
                      <CalendarMonthOutlined sx={{
                        fontSize: "0.85rem"
                      }} />
                    </Avatar>
                    <Typography>{action.name}</Typography>
                  </div>
                  <AddOutlined fontSize="small" />
                </ButtonBase>
              ))}

              <ButtonBase className="flex between" sx={{
                padding: "0.5rem",
                // backgroundColor: theme.palette.primary.light,
                borderRadius: "0.25rem"
              }}>
                <div className="flex compact fit">
                  <Typography>See Integrations</Typography>
                </div>
                <MoreHoriz fontSize="small" />
              </ButtonBase>
            </div>
          )}
          <div className="flex between">
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => {
                if (module) {
                  return;
                }

                Base.Creator.startCreator(Type.Event, Mode.Create);
              }}
            >
              New Event
            </Button>
          </div>
        </div>
      </Drawer >
    </>
  )
}