import { Avatar, Button, ButtonBase, Drawer, FormControl, IconButton, InputLabel, ListItemIcon, MenuItem, Select, Skeleton, TextField, ToggleButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Source_Sans_3 } from 'next/font/google';
import { useEffect, useState } from "react";
import { Base, BaseService, UnAuthPageProps } from "@/types/globals";
import { Group, MemberFactory, Profile, Schedule } from "@/schema";
import Divider, { DIVIDER_NO_ALPHA_COLOR } from "@/components/Divider";
import { AddOutlined, ArrowBackIosOutlined, CalendarMonthOutlined, CalendarViewDayOutlined, CalendarViewWeekOutlined, CloseOutlined, EditOutlined, ElectricalServicesOutlined, FilterList, GridView, LocationOnOutlined, LogoutOutlined, MenuOutlined, Mode, MoreHorizOutlined, PeopleOutline, PersonOutline, Search, Settings, SettingsOutlined, StarOutline } from "@mui/icons-material";
import StyledIconButton from "@/components/StyledIconButton";
import ItemStub from "@/components/ItemStub";
import StyledWeekPicker from "@/components/calendar/WeekPicker";
import dayjs from "@/lib/utils/dayjs";
import src from "@emotion/styled";
import { MEDIA_BASE_URI } from "@/lib/useComplexFileDrop";
import { useRouter } from "next/router";
import StyledToggleButtonGroup from "@/components/StyledToggleButtonGroup";
import DeployedCodeIcon from "@/components/icons/DeployedCodeIcon";

const sora = Source_Sans_3({ subsets: ['latin'] });

const SIDEBAR_WIDTH = '20rem';

const session = new Profile({
    "uuid": "a151902a-b398-4016-8a29-68bfa67842f3",
    "name": "jeremystiava",
    "nickname": "jeremystiava",
    "username": "jeremystiava",
    "email": "jeremystiava",
    "valid": false,
    "icon_img": null
})

const source = new Group({
    "uuid": "f3822ce1-dd00-4e7d-86b1-2cfe5ec48237",
    "name": "Jeremy Stiava",
    "theme_color": "#a51417",
    "valid": null,
    "nickname": null,
    "username": "jeremy_stiava",
    "tagline": null,
    "cover_img": null,
    "icon_img": null,
    "access_token": null,
    "access_token_expires": null,
    "refresh_token": null,
    "refresh_token_expires": null,
    "scope": null,
    "integration": null
});


export default function ThemePage(props: UnAuthPageProps) {

    const theme = useTheme();
    const router = useRouter();
    const [color, setColor] = useState("#0fd9c1");
    const Calendar = props.Session.Calendar;
    const [item, setItem] = useState<any>({});
    const Session = props.Session;
    const [view, setView] = useState<string | null>(null);

    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const pushNewView = (tab: string) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, tab }
        }, undefined, { shallow: true });
    };

    const isSm = useMediaQuery(theme.breakpoints.down('sm'));

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

    return (
        <>
            {/* <style>{`* {border: 1px solid red !important }`}</style> */}
            <div className="flex snug">
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
                            position: 'fixed',
                            width: isSm ? '100%' : SIDEBAR_WIDTH,
                            left: 0,
                            top: 0,
                            height: `calc(100vh - env(safe-area-inset-top));`,
                            overflow: "hidden",
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            zIndex: 5,
                            borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                        },
                    }}
                >
                    <Divider />
                    <div id="sidebar_header"
                        className="flex center between"
                        style={{
                            height: "3.5rem",
                            borderBottom: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                            padding: "0 0.5rem 0 1rem"
                        }}>
                        <div className="flex fit" style={{
                            width: 'calc(100% - 2.5rem)',
                        }}>
                            <ItemStub
                                item={Session.session}
                            />
                        </div>
                        <StyledIconButton
                            title="Close Sidebar"
                            onClick={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}>
                            {isSm ? (
                                <CloseOutlined sx={{
                                    fontSize: "1.25rem"
                                }} />
                            ) : (
                                <ArrowBackIosOutlined sx={{
                                    fontSize: "0.875rem"
                                }} />
                            )}
                        </StyledIconButton>
                    </div>
                    <div style={{
                        position: "relative",
                        height: "calc(100% - 3.5rem)",
                        padding: "1rem 0"
                    }}>
                        <div className="flex center middle">
                            <StyledWeekPicker
                                mode="dark"
                                Calendar={Session.Calendar}
                                value={Session.Calendar.frameDate}
                            />
                        </div>
                        <div className="column" style={{
                            padding: "1rem"
                        }}>
                            <Typography variant="h6">Calendars</Typography>

                            <div className="flex between bottom">
                                <Typography variant="h6" sx={{
                                    fontSize: "0.75rem"
                                }}>{dayjs().format("MMM DD, YYYY")}</Typography>
                                <Button size="small" variant="contained">Today</Button>
                            </div>

                        </div>
                        <div
                            className="column compact"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                width: "100%",
                                padding: "1rem"
                            }}>
                            <Button
                                endIcon={<MoreHorizOutlined />}
                                sx={{
                                    color: theme.palette.text.primary
                                }}
                                className="flex between"
                            >
                                More Integrations
                            </Button>
                            <Button
                                startIcon={<AddOutlined />}
                                fullWidth
                                variant="contained"
                            >
                                New Event
                            </Button>
                        </div>
                    </div>
                </Drawer >
                <Divider vertical />
                <div className="column snug" style={{
                    marginLeft: !Session.Preferences.isSidebarDocked ? '0rem' : `calc(${SIDEBAR_WIDTH} - 0.1rem)`,
                    width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH})`,
                    borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                }}>
                    <div
                        className="column snug"
                        style={{
                            position: 'fixed',
                            width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH})`,
                        }}>
                        <Divider />
                        <header
                            id="header"
                            className="flex center between"
                            style={{
                                height: "3.5rem",
                                borderBottom: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                                borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                                padding: isSm ? "0 0.5rem" : "0 1rem",
                                backgroundColor: '#ffffff'
                            }}>
                            <div className="flex fit">
                                {!Session.Preferences.isSidebarDocked && (
                                    <StyledIconButton
                                        title="Open Sidebar"
                                        onClick={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}>
                                        <MenuOutlined />
                                    </StyledIconButton>
                                )}
                                <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>{Session.Calendar.days[6]?.format("MMMM YYYY") || "All Events"}</Typography>


<div className="flex fit">


                                <FormControl sx={{
                                    width: 120
                                }}>
                                    <InputLabel id="demo-simple-select-label">View</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={view === 'table' ? Session.Calendar.days.length === 7 ? 'week' : 'month' : view}
                                        label="View"
                                        size="small"
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            '& .MuiSelect-select': {
                                                display: 'flex',
                                                alignItems: 'center',

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
                                </div>

                                <StyledToggleButtonGroup value={view} size='small' isMini={false}>
                                    <ToggleButton
                                        value="dashboard"
                                        onClick={() => pushNewView('dashboard')}
                                    >
                                        <GridView fontSize="small" />
                                        Dashboard
                                    </ToggleButton>
                                    {['month', 'week', 'day', 'calendar'].some(x => x === view) ? (
                                        <ToggleButton
                                            value={view || 'calendar'}
                                            onClick={() => pushNewView('month')}
                                        >
                                            <CalendarMonthOutlined fontSize="small" />
                                            Calendar
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
                                        value="apps"
                                        onClick={() => pushNewView('apps')}
                                    >
                                        <DeployedCodeIcon fontSize="small" />
                                        Apps
                                    </ToggleButton>

                                    <ToggleButton
                                        value="crm"
                                        onClick={() => pushNewView('crm')}
                                    >
                                        <ElectricalServicesOutlined fontSize="small" />
                                        Extensions
                                    </ToggleButton>

                                    <ToggleButton
                                        value="crm"
                                        onClick={() => pushNewView('crm')}
                                    >
                                        <PeopleOutline fontSize="small" />
                                        CRM
                                    </ToggleButton>
                                    <ToggleButton
                                        value="grid"
                                        onClick={() => {

                                            if (!Session.base) {
                                                return;
                                            }

                                            Session.Creator.startCreator(Session.base.type, Mode.Modify, Session.base, {
                                                callback: async (updated: any) => {

                                                    const newBase = MemberFactory.create(updated.type, updated);
                                                    newBase.token = MemberFactory.getToken(Session.base!);

                                                    BaseService.update(Session.base!, newBase)
                                                        .then(res => {
                                                            return;
                                                        })
                                                        .catch(err => {
                                                            return;
                                                        });

                                                    Session.setBase(newBase);

                                                    if (newBase instanceof Event) {
                                                        Base.Events.swap(newBase);
                                                    }

                                                }
                                            })
                                        }}
                                    >
                                        <EditOutlined fontSize="small" />
                                        Edit
                                    </ToggleButton>
                                </StyledToggleButtonGroup>
                            </div>
                            <div className="flex compact fit">
                                <TextField
                                    placeholder="Search"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <Search sx={{
                                                fontSize: '1.25rem',
                                                marginRight: "0.5rem"
                                            }} />
                                        )
                                    }}
                                />
                                <IconButton>
                                    <StarOutline sx={{
                                        fontSize: '1.5rem'
                                    }} />
                                </IconButton>
                                {Session.session ? (
                                    <Avatar
                                        onClick={() => setIsRightSidebarOpen(true)}
                                        alt={Session.session.name}
                                        src={`${MEDIA_BASE_URI}/${Session.session.getIconPath()}`}
                                        sx={{
                                            width: "2rem",
                                            height: "2rem",
                                            border: `0.15rem solid ${Session.session.theme_color || 'transparent'} !important`,
                                            backgroundColor: theme.palette.background.paper,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <PersonOutline sx={{
                                            fontSize: "1rem",
                                            color: Session.session.theme_color
                                        }} />
                                    </Avatar>
                                ) : (
                                    <Skeleton variant="circular" width={"2rem"} height={"2rem"} />
                                )}
                            </div>
                        </header>
                    </div>
                    <div id="content"
                        className="column"
                        style={{
                            marginTop: "3.5rem",
                            // height: "calc(100vh - 6.6rem)",
                            height: "100vh",
                            // backgroundColor: 'lightGrey',
                        }}>
                        <Typography>Content</Typography>
                    </div>
                    <footer id="footer"
                        className="flex center between"
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            height: "3rem",
                            borderTop: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                            borderBottom: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                            backgroundColor: 'white',
                            padding: "0 1rem",
                            width: !Session.Preferences.isSidebarDocked ? "100%" : `calc(100% - ${SIDEBAR_WIDTH} - 0.1rem)`,
                        }}>
                        <div className="flex fit">
                            <Button
                                className="flex compact"
                                sx={{
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    color: theme.palette.text.primary
                                }}
                            >
                                <FilterList sx={{
                                    fontSize: "1rem"
                                }} />
                                <Typography>Filters</Typography>
                            </Button>
                            <Typography>Footer</Typography>
                        </div>
                        <div className="flex fit">
                            <Typography>Status</Typography>
                        </div>
                    </footer>
                </div>
            </div>

            <Drawer
                // hideBackdrop
                // variant="persistent"
                anchor="right"
                open={isRightSidebarOpen}
                onClick={() => setIsRightSidebarOpen(false)}
                onClose={() => setIsRightSidebarOpen(prev => !prev)}
                sx={{
                    '& .MuiDrawer-paper': {
                        display: 'flex',
                        flexDirection: 'column',
                        // position: 'fixed',
                        width: "25rem",
                        padding: "1rem",
                        maxWidth: "100%",
                        // overflow: "hidden",
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        // zIndex: 5,
                        // borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
                    },
                }}
            >

                <div className="column">
                    <div className="flex between center">
                        <div className="flex fit" style={{
                            width: 'calc(100% - 2.5rem)',
                        }}>
                            <ItemStub
                                item={Session.session}
                            />
                        </div>
                        <IconButton
                            onClick={() => setIsRightSidebarOpen(false)}
                        >
                            <CloseOutlined sx={{
                                fontSize: '1rem'

                            }} />
                        </IconButton>
                    </div>
                    <Divider />
                    <div className="column compact">
                        <ButtonBase
                            className="flex compact"
                            sx={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem"
                            }}
                        >
                            <SettingsOutlined sx={{
                                fontSize: "1rem"
                            }} />
                            <Typography>Settings</Typography>
                        </ButtonBase>
                        <ButtonBase
                            className="flex compact"
                            sx={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem"
                            }}
                        >
                            <LogoutOutlined sx={{
                                fontSize: "1rem"
                            }} />
                            <Typography>Logout</Typography>
                        </ButtonBase>
                    </div>

                </div>
            </Drawer >
        </>
    )
}