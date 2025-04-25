"use client"
import { UseBase } from "@/lib/global/useBase";
import { UseSession } from "@/lib/global/useSession";
import useViewEvent from "@/lib/global/useViewEvent";
import { MemberFactory, Event, Member, Group, Profile } from "@/schema";
import { BaseService, Mode, Type } from "@/types/globals";
import { CalendarMonthOutlined, LocationOnOutlined, VpnKeyOutlined, EditOutlined, CloseOutlined, CalendarViewDayOutlined, CalendarViewWeekOutlined, Delete, HideSource, MoveToInboxOutlined, SelectAllOutlined, GridView, FilterListOutlined } from "@mui/icons-material";
import { alpha, Button, Chip, CircularProgress, FormControl, InputLabel, ListItemIcon, MenuItem, Select, ToggleButton, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect, RefObject } from "react";
import StyledToggleButtonGroup from "../StyledToggleButtonGroup";
import CalendarSelectedHeader from "../calendar/CalendarSelectedHeader";
import CalendarView from "../calendar/CalendarView";
import Header from "./Header";
import DeployedCodeIcon from "../icons/DeployedCodeIcon";
import { useDroppable } from "@dnd-kit/core";
import EventDashboard from "./EventDashboard";
import DeployMasonryApp from "../DeployMasonryApp";
import IAMView from "../IAMView";


export default function SessionMainPage(props:
    { Session: UseSession, containerRef: RefObject<HTMLElement>, prefix: string, item: Member }) {

    const { Session, containerRef, item, ...rest } = props
    const router = useRouter();
    const theme = useTheme();

    const { EventPopover, handleOpenEventPopover } = useViewEvent(
        Session.base,
        Session.Events,
        Session.Creator.startCreator,
        theme
    );

    const pushNewView = (tab: string) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, tab }
        }, undefined, { shallow: true });
    };

    const [selected, setSelected] = useState<Event[] | null>([]);
    const [view, setView] = useState<string | null>(null);

    useEffect(() => {
        console.log(router.query)
        if (router.query.tab) {
            console.log(router.query.tab);
            setView(String(router.query.tab));
            return;
        }
        else {
            const days = Session.Calendar.days;

            if (days.length === 1) {
                setView('day')
            }
            else if (days.length === 7) {
                setView('week')
            }
            else {
                setView('month')
            }
            return;

        }

        setView('week')
    }, [router, router.query, Session.Calendar.days])


    const { setNodeRef } = useDroppable({
        id: 'event_page_drop',
        data: {
            callback: (active: Event) => {
                try {
                    // active.parents.push(event);
                    // Base.Events.add(active.eject());
                    // //   item.addChild(active);
                    // setModule(event);
                }
                catch (err) {
                    console.log(err)
                    return;
                }
            }
        }
    });

    const handleSelect = (e: MouseEvent, event: Event | boolean) => {

        if (typeof event === 'boolean') {
            handleSelectAllInView();
            return;
        }

        if (selected) {
            if (selected.some((item) => item.id() === event.id())) {
                handleUnselect(event.uuid);
                return;
            }
        }
        setSelected((prev) => {
            if (!prev) return [event];
            return [...prev, event]
        })
        return;
    }
    const handleUnselect = (uuid: string) => {
        setSelected((prev) => {
            if (!prev) return null;
            const newSelected = prev.filter((event) => event.uuid !== uuid);
            if (!newSelected || newSelected.length === 0) return null;
            return newSelected;
        })
    }

    const handleSelectAllInView = () => {
        if (!Base.Events.events) {
            return;
        }
        const filtered = Base.Events.events.filter(x => {
            if (x.date) {
                return x.date.isAfter(Base.Calendar.days[0].add(-1, 'day'), 'day') && x.date.isBefore(Base.Calendar.days[Base.Calendar.days.length - 1].add(1, 'day'));
            }
            return false;
        })
        if (!filtered) {
            return;
        }
        setSelected(filtered)
        return;
    }

    const pageSelector = (
        <div style={{
            padding: "0.5rem 0"
        }}>
            <StyledToggleButtonGroup value={view} size='small' isMini={false}>
                <ToggleButton
                    value="dashboard"
                    onClick={() => pushNewView('dashboard')}
                >
                    <GridView fontSize="small" />
                    Dashboard
                </ToggleButton>
                {['month', 'week', 'day', 'events'].some(x => x === view) ? (
                    <ToggleButton
                        value={view || 'events'}
                        onClick={() => pushNewView('month')}
                    >
                        <CalendarMonthOutlined fontSize="small" />
                        Events
                    </ToggleButton>
                ) : (
                    <ToggleButton
                        value={'month'}
                        onClick={() => pushNewView('month')}
                    >
                        <CalendarMonthOutlined fontSize="small" />
                        Events
                    </ToggleButton>
                )}
                <ToggleButton
                    value="table"
                    onClick={() => pushNewView('locations')}
                >
                    <LocationOnOutlined fontSize="small" />
                    Locations
                </ToggleButton>
                <ToggleButton
                    value="iam"
                    onClick={() => pushNewView('iam')}
                >
                    <VpnKeyOutlined fontSize="small" />
                    IAM
                </ToggleButton>
                <ToggleButton
                    value="apps"
                    onClick={() => pushNewView('apps')}
                >
                    <DeployedCodeIcon fontSize="small" />
                    Apps
                </ToggleButton>
                <ToggleButton
                    value="grid"
                    onClick={() => {

                        if (!Session.base) {
                            return;
                        }

                        Session.Creator.startCreator(Type.Profile, Mode.Modify, item, {
                            callback: async (updated: any) => {

                                const newBase = new Profile(updated);
                                BaseService.update(item, newBase)
                                    .then(res => {
                                        return;
                                    })
                                    .catch(err => {
                                        return;
                                    });

                                // Session.setBase(newBase);

                            }
                        })
                    }}
                >
                    <EditOutlined fontSize="small" />
                    Edit
                </ToggleButton>
            </StyledToggleButtonGroup>
        </div>
    )

    const names = [
        'Schedules',
        'Moments'
    ]

    if (!Session.Calendar.days || !view) {
        return <></>
    }

    return (
        <>
            {selected && selected[0] ? (
                <CalendarSelectedHeader>
                    <div className="flex">
                        <Chip className='flex middle fit' label={selected.length} sx={{ width: "2rem", backgroundColor: '#ffffff', color: '#000000', fontWeight: 800 }} />
                        <Button onClick={() => setSelected(null)} variant='contained' startIcon={<CloseOutlined />}>Unselect All</Button>
                        <Button variant="contained" onClick={handleSelectAllInView} startIcon={<SelectAllOutlined />}>Select All</Button>

                        <Button variant='flipped' startIcon={<MoveToInboxOutlined />}
                            onClick={() => {
                                const sorted = selected.sort((a, b) => a.date.yyyymmdd() - b.date.yyyymmdd())
                                // Base.Creator.startCreator(Type.Event, Mode.Create, new Event({
                                //     name: "Group of Events",
                                //     date: sorted[0].date.yyyymmdd(),
                                //     end_date: sorted[sorted.length - 1].date.yyyymmdd(),
                                //     children: selected.map(s => s.eject())
                                // }, true))
                                setSelected(null);
                            }}
                        >Group</Button>
                        <Button onClick={async () => {
                            for (const s of selected) {
                                await s.updateHost(item, {
                                    is_shown: false
                                })
                                router.reload();
                            }
                        }} color="error" variant='contained' startIcon={<HideSource />}>Hide</Button>
                        <Button onClick={() => {
                            Base.Events.remove(selected);
                            setSelected(null);
                        }} color="error" variant='contained' startIcon={<Delete />}>Delete</Button>
                    </div>
                </CalendarSelectedHeader>
            ) : (
                <Header Base={null} Session={Session} desktopChildren={pageSelector}>
                    <div className='flex fit' style={{
                        padding: "0 1rem"
                    }} >
                        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>{Session.Calendar?.days[6]?.format("MMMM YYYY") || "All Events"}</Typography>

                        {['month', 'week', 'day', 'events'].some(x => x === view) && (

                            <FormControl sx={{ minWidth: 120 }} size="small">
                                <InputLabel id="demo-select-small-label">View</InputLabel>
                                <Select
                                    labelId="demo-select-small-label"
                                    id="demo-select-small"
                                    value={view === 'table' ? Session.Calendar.days.length === 7 ? 'week' : 'month' : view}
                                    label="View"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: "7px 12px"
                                        },
                                        '& .MuiListItemIcon-root': {
                                            minWidth: "unset",
                                            marginRight: "0.25rem"
                                        },
                                    }}
                                // onChange={handleChange}
                                >
                                    <MenuItem
                                        value="month"
                                        onClick={() => {
                                            if (view === 'week' || view === 'day' || view === 'month') {
                                                // pushNewView("month")
                                            }
                                            Session.Calendar.goToStartOfMonth()
                                        }}
                                    >
                                        <ListItemIcon>
                                            <CalendarMonthOutlined fontSize="small" />
                                        </ListItemIcon>
                                        Month
                                    </MenuItem>
                                    <MenuItem
                                        value="week"
                                        onClick={() => {

                                            if (view === 'week' || view === 'day' || view === 'month') {
                                                // pushNewView("week")
                                            }
                                            Session.Calendar.gotoStartOfWeek()
                                        }}
                                    >
                                        <ListItemIcon>
                                            <CalendarViewWeekOutlined fontSize="small" />
                                        </ListItemIcon>
                                        Week
                                    </MenuItem>
                                    <MenuItem
                                        value="day"
                                        onClick={() => {
                                            if (view === 'week' || view === 'day' || view === 'month') {
                                                // pushNewView("day")
                                            }
                                            view != 'day' && Session.Calendar.gotoDate(Session.Calendar.frameDate);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <CalendarViewDayOutlined fontSize="small" />
                                        </ListItemIcon>
                                        Day
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <Button
                            variant="text"
                            startIcon={<FilterListOutlined />}
                        >
                            Filters
                        </Button>

                    </div>
                </Header >
            )}
            {!Session || Session.Events.loading && (
                <div className='flex center middle' style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "100vw", color: theme.palette.text.primary, backgroundColor: alpha(theme.palette.background.paper, 0.25) }}>
                    <CircularProgress sx={{ color: theme.palette.text.primary }} />
                    <Typography>No Session. Events are loading. SessionMainPage.</Typography>
                </div>
            )}
            <div id="content">
                <div style={{ width: "100%", height: "fit-content", display: 'flex', justifyContent: "flex-end" }}>
                    {EventPopover}

                    {view === 'dashboard' && (
                        <div className="column left relaxed"
                            style={{
                                // maxWidth: "calc(100% - 2rem)",
                                width: "100%",
                                color: theme.palette.text.primary
                            }}
                        >
                            {item instanceof Event && (
                                <EventDashboard
                                    key={item.id()}
                                    view={view}
                                    setView={setView}
                                    source={item}
                                    Events={Session.Events}
                                    Calendar={Session.Calendar}
                                    startViewer={handleOpenEventPopover}
                                    startCreator={Session.Creator.startCreator}
                                    updateSource={Session.Events.update}
                                    setSource={null}
                                    quickView={handleOpenEventPopover}
                                    pushNewView={pushNewView}
                                    Session={Session}
                                />
                            )}

                            {item instanceof Group && (
                                <></>
                            )}
                        </div>
                    )}

                    {view === 'apps' && (
                        <div className="column left relaxed"
                            style={{
                                // maxWidth: "calc(100% - 2rem)",
                                width: "100%",
                                height: "fit-content",
                                color: theme.palette.text.primary
                            }}
                        >
                            <DeployMasonryApp source={item} Events={Session.Events} startViewer={handleOpenEventPopover} onSubmit={() => {
                                return;
                            }} onCancel={() => setView('view')} />
                        </div>
                    )}

                    {view === 'iam' && (
                        <div className="column left relaxed"
                            style={{
                                // maxWidth: "calc(100% - 2rem)",
                                width: "100%",
                                height: "fit-content",
                                color: theme.palette.text.primary
                            }}
                        >
                            <IAMView {...props} />
                        </div>
                    )}

                    {(view === 'day' || view === 'week' || view === 'month') && (
                        <div style={{ width: "100%", height: "fit-content", display: 'flex', justifyContent: "flex-end" }}>
                            <>
                                <CalendarView
                                    key={item.id()}
                                    containerRef={containerRef}
                                    selected={selected}
                                    setSelected={setSelected}
                                    handleSelect={handleSelect}
                                    Preferences={Session.Preferences}
                                    source={item}
                                    Calendar={Session.Calendar}
                                    handleCreate={Session.Creator.startCreator}
                                    handleView={handleOpenEventPopover}
                                    days={Session.Events.days}
                                    Events={Session.Events}
                                    isCreatorOpen={Session.Creator.isOpen}
                                />
                                <div style={{ height: "2rem" }}></div>
                            </>
                        </div>
                    )}
                    {/* <EventModal render={renderFocus} event={focusedEvent} clearFocusedEvent={clearFocusedEvent} /> */}
                </div>
            </div>
        </>
    )
}