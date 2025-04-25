import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
  } from '@dnd-kit/sortable';
  import { AddAPhotoOutlined, CalendarMonthOutlined, DirectionsOutlined, EditOutlined, HistoryOutlined, KeyboardArrowDown, LocationOnOutlined, SaveOutlined, ScheduleOutlined, StarOutlineOutlined, StarRate } from "@mui/icons-material";
  import { EventData, Schedule, ScheduleType } from '@/schema';
  import BackgroundImage, { } from '@/components/Image';
  import { Mode, Type } from '@/types/globals';
  import { Event } from '@/schema';
  import dayjs, { Dayjs } from 'dayjs';
  import { marked } from 'marked';
  import { UseEvents } from '@/lib/global/useEvents';
  import { UseCalendar } from '@/lib/useCalendar';
  import { StartViewer } from '@/lib/global/useView';
  import { StartCreator } from '@/lib/global/useCreate';
  import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
  import { TransitionGroup } from 'react-transition-group';
//   import DraggableLinkCard from '@/components/DraggableLinkCard';
//   import MerchantChildCard from '@/components/MerchantChildCard';
//   import EventLinkButton from '@/components/EventLinkButton';
//   import GlanceableAgenda from '@/components/GlanceableAgenda';
  import { UseSession } from '@/lib/global/useSession';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button, ButtonBase, getContrastRatio, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useRouter } from 'next/router';
import { isNotScheduled } from '@/lib/CalendarDays';

export default function EventDashboard ({ source, view, setView, Events, Calendar, startViewer, startCreator, updateSource, setSource, quickView, pushNewView, Session }: {
    source: Event,
    Events: UseEvents,
    Calendar: UseCalendar,
    startViewer: StartViewer,
    startCreator: StartCreator,
    updateSource: any,
    setSource: any,
    view: string,
    setView: Dispatch<SetStateAction<string>>,
    quickView: StartViewer,
    pushNewView: (key: string) => void,
    Session: UseSession
  }) {
  
    const theme = useTheme();
    const router = useRouter();
  
    const isSM = useMediaQuery(theme.breakpoints.down('sm'));
    const isMD = useMediaQuery(theme.breakpoints.down('lg'));
  
    const [cache, setCache] = useState<string | null>(null)
    const [merchants, setMerchants] = useState<Event[] | null>(null);
    const [programs, setPrograms] = useState(null);
    const [sortedEvents, setSortedEvents] = useState(null);
    const [links, setLinks] = useState(null);
  
    const [isHoursOpen, setIsHoursOpen] = useState(false);
    const [isOpenDetailed, setIsOpenDetailed] = useState(null);
    const frame = dayjs().startOf('week').getFrame(7);
    const warningColor = source && source.theme_color ? getContrastRatio("#FFD700", theme.palette.background.paper) > 4.5 ? "#FFD700" : "#635712" : theme.palette.primary.contrastText;
  
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    const [hasLinkListOrderChanged, setHasLinkListOrderChanged] = useState(false);
  
    const [editLinkOrder, setEditLinkOrder] = useState(false);
  
  
    function handleDragEnd(event) {
      try {
        const { active, over } = event;
        if (active.id !== over.id) {
          setHasLinkListOrderChanged(true);
          setLinks((items) => {
            const oldIndex = items.findIndex(item => item.uuid === active.id);
            const newIndex = items.findIndex(item => item.uuid === over.id);
            return arrayMove(items, oldIndex, newIndex);
          });
        }
      }
      catch (err) {
        console.log("Drag didn't work")
      }
    }
  
  
    useEffect(() => {
  
      if (!Events.events) {
        setSortedEvents(null);
        setLinks(null);
        return;
      }
  
      const eventsWithDateAndTime : Event[] = [];
      const eventsThatAreLinks: Event[] = [];
  
      Events.events.forEach(x => {
        if (x.link) {
          eventsThatAreLinks.push(x);
          return;
        };
        if (!x.date) return false;
        return eventsWithDateAndTime.push(x);
      })
      const sortByDate = eventsWithDateAndTime.sort((a, b) => {
  
        if (a.date.isSame(b.date, 'day')) {
          return 0;
        }
        return a.date.isAfter(b.date, 'day') ? 1 : -1
      })
  
      eventsThatAreLinks.sort((a, b) => {
        const aMember = a.junctions.get(source.id());
        const bMember = b.junctions.get(source.id());
        if (!aMember && !bMember) {
          return 0;
        }
        if (!aMember) {
          return 1;
        }
        if (!bMember) {
          return -1;
        }
        return aMember.order_index - bMember.order_index;
      })
  
      setLinks(eventsThatAreLinks);
      setSortedEvents(sortByDate);
  
      setCache(source.id());
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, Events.events])
  
    useEffect(() => {
  
      setMerchants([]);
      setPrograms([]);
  
      if (source && Events.events ) {
        let children = Events.events.filter(x => !isNotScheduled(x));
        const iOD = source.isOpenDetailed();
        setIsOpenDetailed(iOD)
  
        if (!children) {
          setMerchants([]);
          setPrograms([]);
          return;
        }
  
        let filtered = [];

        
        children.forEach(x => {
          if (x.schedules.length > 0) {
            const regular = x.getRegularHours();
            const schedule = x.getSchedulesInFrame();
            if (x.id() === source.id()) {
              return;
            }
            if (regular && regular.getActiveDaysPerWeek() > 3 && !x.link) {
              filtered.push(x);
              children = children.filter(y => y.uuid != x.uuid);
            }
          }
        })
  
  
        filtered = filtered.sort((a: Event, b: Event) => {
          const aOpen = a.isOpen();
          const bOpen = b.isOpen();
          if (aOpen === bOpen) {
            return 0;
          }
          return aOpen ? -1 : 1;
        })
        setMerchants(filtered);
  
        const thePrograms = children.filter(x => {
          return !x.link;
        })
        setPrograms(thePrograms);
  
      }
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, Events.events])
  
  
  
    const descriptionAsHTML = source && source.metadata.description && marked(source.metadata.description);
  
    if (!cache || cache != source.id()) {
      return (
        <div className="flex center middle">
  
        </div>
      )
    }
  
    return (
  
      <>
        <div className={`${isMD ? 'column' : 'flex between'} top`}
          style={{
            marginBottom: "10rem",
            padding: `${isSM ? "3.5rem" : "3.5rem"} 0`,
          }}
        >
  
          <div className="column" style={{
            position: "sticky",
            top: "3.5rem",
            width: isMD ? "100%" : "50%",
            // backgroundColor: theme.palette.divider,
            // minHeight: "100vh"
          }}>
            {source.cover_img ? (
              <BackgroundImage
                url={`${MEDIA_BASE_URI}/${source.cover_img.path}`}
                width={"100%"}
                height={"auto"}
                style={{
                  aspectRatio: "1/1"
                }}
              />
            ) : (
              <ButtonBase
                onClick={() => startCreator(Type.Event, Mode.Modify, source, {
                  callback: (x: EventData) => {
                    updateSource(x);
                    const updated = new Event(x, true);
                    // updated.hosts = source.hosts;
                    setSource(updated);
                    return;
                  }
                })}
                sx={{
                  width: "75%",
                  height: "25vh",
                  margin: "3rem auto",
                  border: `1px dashed ${theme.palette.primary.main}`,
                  borderRadius: "0.5rem"
                }}
              >
                <div className="flex fit center middle">
                  <AddAPhotoOutlined sx={{
                    fontSize: "1.5rem"
                  }} />
                  <Typography>Add Cover Image</Typography>
                </div>
              </ButtonBase>
            )}
          </div>
          <div className="column relaxed" style={{
            width: isMD ? "100%" : "65%",
            padding: isSM ? "1.5rem" : "3rem"
          }}>
  
            <div className="flex between" style={{
              maxWidth: "30rem",
              width: "100%"
            }}>
  
              <div className="flex fit compact">
                <Button
                  variant="text"
                  startIcon={<EditOutlined />}
                  onClick={() => startCreator(Type.Event, Mode.Modify, source, {
                    callback: (x: EventData) => {
                      updateSource(x);
                      const updated = new Event(x, true);
                      // updated.hosts = source.hosts;
                      setSource(updated);
                      return;
                    }
                  })}
                  sx={{
                    width: 'fit-content',
                    padding: "0.25rem 0.75rem"
                  }}
                >Edit</Button>
  
  
                <Button
                  variant="text"
                  startIcon={<HistoryOutlined />}
                  onClick={() => {
                    return;
                  }}
                  sx={{
                    width: 'fit-content',
                    padding: "0.25rem 0.75rem",
                    color: theme.palette.text.primary
                  }}
                >{dayjs().duration(dayjs(source.last_updated_on))} ago</Button>
              </div>
  
              {(Session && Session.bases) && Session.bases.some(x => x.id() === source.id()) ? (
                <IconButton
                  color="warning"
                  style={{
                    border: "1px solid"
                  }}
                >
                  <StarRate />
                </IconButton>
              ) : (
                <IconButton
                  color="warning"
                  style={{
                    border: "1px solid"
                  }}
                >
                  <StarOutlineOutlined />
                </IconButton>
              )}
            </div>
  
            {source.wordmark_img ? (
              <>
                <div className="flex">
                  <img
                    src={`${MEDIA_BASE_URI}/${source.wordmark_img.path}`}
                    alt={`${source.name} wordmark`}
                    style={{
                      width: "auto",
                      height: "8rem"
                    }}
                  ></img>
  
                </div>
              </>
            ) : (
              <>
                {source.icon_img && (
                  <div className="flex">
                    <BackgroundImage
                      url={`${MEDIA_BASE_URI}/${source.icon_img.path}`}
                      width={"auto"}
                      height={"5rem"}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: "100%"
                      }}
                    />
                  </div>
                )}
              </>
            )}
  
  
            <div className="flex"
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "0.25rem",
                overflow: 'hidden',
              }}>
              <Typography component="h1" sx={{
                fontSize: "1.15rem",
                fontWeight: 700,
                width: "100%",
                maxWidth: '30rem'
              }}>{source.name}</Typography>
            </div>
  
  
            <div className="column relaxed" >
              {source.date && source.end_date && (
                <div className="column compact">
                  <div className="flex compact">
                    <CalendarMonthOutlined fontSize="small" sx={{
                      fontSize: "1rem"
                    }} />
                    <Typography sx={{ fontSize: "1rem" }}>{source.date.to(source.end_date, true, {
                      month: "MMMM"
                    })}</Typography>
                  </div>
                  {dayjs().isBefore(source.date) ? (
                    <Typography variant="caption">Starts in {dayjs().duration(source.date)}</Typography>
                  ) : (
                    <>
                      {dayjs().isAfter(source.end_date) ? (
                        <Typography variant="caption"><Typography variant="caption">{dayjs().duration(source.end_date)} ago</Typography></Typography>
                      ) : (
                        <Typography variant="caption">{source.end_date.duration(dayjs())} remaining</Typography>
                      )}
                    </>
                  )}
                </div>
              )}
  
              {source.start_time && (
                <div className="column compact">
                  <div className="flex compact">
                    <CalendarMonthOutlined fontSize="small" sx={{
                      fontSize: "1rem"
                    }} />
                    <Typography sx={{ fontSize: "1rem" }}>{source.date.to(source.end_date, true, {
                      month: "MMMM"
                    })}</Typography>
                  </div>
                  <div className="flex compact">
                    <ScheduleOutlined fontSize="small" sx={{
                      fontSize: "1rem"
                    }} />
                    <Typography sx={{ fontSize: "1rem" }}>{source.start_time.to(source.end_time)}</Typography>
                  </div>
                </div>
              )}
  
  
              <div className="column">
                {isOpenDetailed && isOpenDetailed.schedule && (
                  <>
                    {true ? (
                      <>
                        <div className="column compact" style={{ width: "100%", color: isOpenDetailed.schedule.isNotRegular() ? warningColor : theme.palette.text.primary }}>
                          <div className="flex compact" style={{ color: isOpenDetailed.schedule.isNotRegular() ? warningColor : theme.palette.text.primary }}>
                            <ScheduleOutlined fontSize="small" />
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{isOpenDetailed.isOpen ? "OPEN" : "CLOSED"} <span style={{ opacity: 0.75 }}>&middot; {isOpenDetailed.context}{isOpenDetailed.schedule.isNotRegular() && <> &middot; {isOpenDetailed.schedule.name}</>}</span></Typography>
                            <IconButton
                              onClick={() => setIsHoursOpen(prev => !prev)}
                              sx={{
                                transform: isHoursOpen ? "rotate(180deg)" : "unset",
                                color: "inherit"
                              }}>
                              <KeyboardArrowDown />
                            </IconButton>
                          </div>
                          {isHoursOpen && (
                            <div className="column compact2" style={{
                              padding: "0 0 1rem 0", width: "100%", maxWidth: "50rem", color: theme.palette.text.primary
                            }}>
                              <div className="flex snug">
                                <Typography sx={{ width: "30%", fontWeight: 700 }}>DOW</Typography>
                                <Typography sx={{ width: "70%", fontWeight: 700 }}>Hours</Typography>
                              </div>
                              {frame && frame.map((f: Dayjs, i: number) => {
                                const info = source.isOpenDetailed(f);

                                if (!info) {
                                    return <></>
                                }
                                return (
                                  <div className="flex between" key={f.format("YYYYMMDD")} style={{ color: info.regular ? warningColor : "inherit", fontWeight: f.isSame(dayjs(), 'day') ? 700 : "normal" }}>
                                    <Typography sx={{ fontSize: "0.875rem", width: "30%", fontWeight: "inherit" }}>{f.format("dddd")}{info.schedule && info.schedule.isNotRegular() && `  (${info.schedule.name})`}</Typography>
                                    <div className="flex" style={{ width: "70%" }}>
                                      <Typography sx={{ fontSize: "0.875rem", width: "40%", fontWeight: "inherit" }}>{info.schedule ? info.schedule.print(i) : "No Hours / Closed"}</Typography>
                                      <Typography sx={{ fontSize: "0.875rem", width: "40%", opacity: 0.75, fontWeight: "inherit" }}><s>{info.regular && info.regular.print(i)}</s></Typography>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="div flex compact" style={{ paddingBottom: "1rem" }}>
                        <ScheduleOutlined fontSize="small" />
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{isOpenDetailed.schedule.as_text} </Typography>
                      </div>
                    )}
                  </>
                )}
  
  
                {source.location_name ? (
                  <>
                    <div className="column compact">
                      <div className="flex between">
                        <div className="flex compact top">
                          <LocationOnOutlined fontSize="small" />
                          <div className="column snug">
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{source.location_name}</Typography>
                            <Typography sx={{ fontWeight: "normal", fontSize: "0.875rem" }}>{source.location_address}</Typography>
                          </div>
                        </div>
                        <IconButton sx={{ color: "inherit" }} onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${source.location_place_id}`, "_blank")}>
                          <DirectionsOutlined />
                        </IconButton>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="column" style={{
                    width: "30rem",
                    maxWidth: "100%"
                  }}>
                    <Button
                      key={'quick_add_link'}
                      variant="outlined"
                      size="large"
                      sx={{
                        border: "1px dashed",
                      }}
                      onClick={() => {
                        startCreator(Type.Event, Mode.Modify, source)
                        return;
                      }}
                    >
                      Add Location
                    </Button>
                  </div>
                )}
              </div>
  
            </div>
  
            {merchants && merchants.length > 0 && (
              <div className="column">
                <Typography variant="h6" sx={{
                  fontSize: "0.875rem"
                }}>Schedules</Typography>
                <div className="column compact" id="merchants"
                  style={{
                    width: "30rem",
                    maxWidth: "100%",
                  }}
                >
                  {/* <div
                    className="flex between"
                    style={{
                      flexWrap: 'wrap',
                    }}
                    key="sub_event_links"
                  >
                    {merchants.map((x: Event, index: number) => {
                      if (x.link) {
                        return null;
                      };
  
                      if (x.id() === source.id()) {
                        return null;
                      }
  
                      if (index >= 6) {
                        return null;
                      }
  
                      return (
                        <MerchantChildCard
                          key={x.id()}
                          item={x}
                          dateTime={dayjs()}
                          onClick={quickView}
                          style={{
                            marginBottom: "0.5rem"
                          }}
                        />
                      )
                    })}
                  </div> */}
                  {merchants.length > 0 && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={(e) => {
                        pushNewView('table')
                      }}
                    >
                      Manage Schedules
                    </Button>
                  )}
                </div>
              </div>
            )}
  
  
            <div className="column" style={{
              maxWidth: "100%",
              width: "30rem"
            }}>
  
              <Typography variant="h6" sx={{
                fontSize: "0.875rem"
              }}>Actions</Typography>
              {links && links.length > 0 && (
                <>
                  <div className="flex between">
                    <Button
                      size='small'
                      color={editLinkOrder ? 'error' : 'primary'}
                      sx={{ padding: "0", fontSize: "0.9375rem", transition: `0.5s ease-in-out` }}
                      onClick={() => {
                        setEditLinkOrder(prev => !prev);
                      }}
                    >
                      {editLinkOrder ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!hasLinkListOrderChanged}
                      onClick={async () => {
                        const copy = source;
                        await copy.updateChildEvents(links);
                        Events.reload();
                        setLinks(null);
                        setHasLinkListOrderChanged(false);
                        return;
                      }}
                      startIcon={<SaveOutlined />}
                    >
                      Save
                    </Button>
                  </div>
  
                  {/* {!editLinkOrder && (
                    <div className='column compact'>
                      {links.map((x, index) => (
                        <EventLinkButton key={x.id()} x={x} index={index}
                          sx={{
                            width: "100%"
                          }}
                        />
                      ))}
                    </div>
                  )} */}
                </>
              )}
  
  
              {/* {links && editLinkOrder && (
                <DndContext
                  key={source.id()}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  autoScroll={false}
                >
                  <SortableContext
                    key={source.id()}
                    items={links.map(x => {
                      return { id: x.id() }
                    })}
                    strategy={verticalListSortingStrategy}
                  >
                    <TransitionGroup className="column compact">
                      {links.map((x: Event) => {
                        if (!x.link) return null;
  
                        const isDisabled = !x.isOpen();
  
                        return (
                          <DraggableLinkCard
                            id={x.id()}
                            key={`${x.id()}_${source.id()}`}
                            variant="contained"
                            isDisabled={isDisabled}
                            isDisabledHidden={false}
                            item={x}
                            onClick={() => {
                              startCreator(Type.Event, Mode.Modify, x);
                            }}
                          />
                        )
                      })}
  
                    </TransitionGroup>
                  </SortableContext>
                </DndContext>
              )}
   */}
              <Button
                key={'quick_add_link'}
                variant="outlined"
                size="large"
                sx={{
                  border: "1px dashed",
                }}
                onClick={() => {
                  const alwaysSchedule = Schedule.create("Regular Hours", ScheduleType.Regular, "Daily: Open", dayjs(), null);
  
                  const newLink = new Event({
                    name: "",
                    schedules: [alwaysSchedule.eject()],
                    link: `https://belong.day/event/${source.id()}`,
                    junctions: [],
                    theme_color: source.theme_color
                  });
  
                  startCreator(Type.Event, Mode.Create, newLink)
                }}
              >
                Add Link
              </Button>
            </div>
  
            <div className="column compact">
              <Typography variant="h6" sx={{
                fontSize: "0.875rem"
              }}>Description</Typography>
              {descriptionAsHTML ? (
                <>
                  <div className="column snug markdown" style={{
                    '--theme-color': theme.palette.primary.main
                  }} dangerouslySetInnerHTML={{ __html: descriptionAsHTML }} >
                  </div>
                </>
              ) : (
                <>
                  <div className="column" style={{
                    width: "30rem",
                    maxWidth: "100%"
                  }}>
                    <Button
                      key={'quick_add_link'}
                      variant="outlined"
                      size="large"
                      sx={{
                        border: "1px dashed",
                      }}
  
                      onClick={() => {
                        startCreator(Type.Event, Mode.Modify, source);
                      }}
                    >
                      Add Description
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }