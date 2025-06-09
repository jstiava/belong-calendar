"use client"
import React, { useEffect, useState } from 'react';
import {
  CalendarMonthOutlined as CalendarMonthOutlined,
  MenuOutlined,
  CalendarViewDayOutlined,
  CalendarViewWeekOutlined,
  ElectricalServicesOutlined,
  GridView,
  LocationOnOutlined,
  PeopleOutline,
  PersonOutline,
  Search,
  StarOutline,
  CloseOutlined,
  LogoutOutlined,
  SettingsOutlined,
  DarkModeOutlined,
  KeyOutlined,
  VpnKeyOutlined,
  Star,
  MoreVertOutlined,
  TableViewOutlined,
  MapOutlined,
  PivotTableChartOutlined,
  TimelineOutlined
} from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  MenuItem,
  useTheme,
  Typography,
  useMediaQuery,
  FormControl,
  InputLabel,
  ListItemIcon,
  Select,
  Skeleton,
  TextField,
  ToggleButton,
  ButtonBase,
  Divider,
  Drawer,
  Fade,
  Popover,
} from '@mui/material';
// import useSearchDialog, { UseSearchDialog } from '@/lib/useSearchDialog';
import { UseSession } from '@/lib/global/useSession';
import { DIVIDER_NO_ALPHA_COLOR } from '../Divider';
import DeployedCodeIcon from '../icons/DeployedCodeIcon';
import StyledIconButton from '../StyledIconButton';
import StyledToggleButtonGroup from '../StyledToggleButtonGroup';
import router, { useRouter } from 'next/router';
import ItemStub from '../ItemStub';
import { Member, Event, isMoment } from '@jstiava/chronos';
import { UseBase } from '@/lib/global/useBase';
import StyledWeekPicker from '../calendar/WeekPicker';
const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";


export default function Header({
  Session,
  module,
  Base,
  Module,
}: {
  Session: UseSession,
  module?: Member | null,
  Base?: UseBase,
  Module?: UseBase,
  // children: any,
  // desktopChildren?: JSX.Element,
  // noBack?: boolean
  // pageNavigation?: JSX.Element,
  // rightSide?: JSX.Element
}) {

  const router = useRouter();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  const item = router.asPath.startsWith('/me') ? Session.session : module ? module : (Session.base ? Session.base : Session.session ? Session.session : null);
  const Controller = router.asPath.startsWith('/me') ? Session : module ? Module : Session.base ? Base : Session;

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [view, setView] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<any | null>(null);
  const isPopoverOpen = Boolean(anchorEl);

  const pushNewFormat = (tab: string) => {

    const theModule = router.query.module;
    if (router.query.module) {
      delete router.query.module;
    }
    const { base, ...rest } = router.query;

    if (theModule && base) {
      rest.base = base;
    }

    const isSession = router.asPath.startsWith('/me');

    router.replace({
      pathname: `${isSession ? `/me/` : `/be/${theModule ? `${String(theModule)}/` : Session.base?.id()}/data`}`,
      query: { ...rest, format: tab }
    })
  }

  const pushNewView = (tab: string) => {

    let theView = undefined;

    if (Controller) {
      if (tab === 'month') {
        theView = 'month'
        Controller.Calendar.goToStartOfMonth();
      }
      else if (tab === 'week') {
        theView = 'week'
        Controller.Calendar.gotoStartOfWeek();
      }
    }

    if (tab === 'calendar' && Controller) {
      if (Controller?.Calendar.days.length === 1) {
        theView = 'day'
      }
      else if (Controller?.Calendar.days.length < 8) {
        theView = 'week'
      }
      else {
        theView = 'month'
      }
    }
    else if (['month', 'week', 'day'].some(x => x === tab)) {
      theView = tab;
      tab = 'calendar';
    }

    const theModule = router.query.module;
    if (router.query.module) {
      delete router.query.module;
    }
    const { base, ...rest } = router.query;

    if (theModule && base) {
      rest.base = base;
    }

    const isSession = router.asPath.startsWith('/me');

    router.replace({
      pathname: `${isSession ? `/me/` : `/be/${theModule ? `${String(theModule)}/` : Session.base?.id()}/`}${tab}`,
      query: { ...rest, view: theView }
    })
  };

  useEffect(() => {

    if (!router || !router.asPath) {
      return;
    }
    try {
      const pathParts = router.pathname.split('/');
      if (router.pathname.startsWith('/me')) {
        const currentTab = pathParts[2];
        setView(currentTab ? currentTab : 'dashboard');
      }
      else {
        const currentTab = pathParts[3];
        setView(currentTab ? currentTab : 'dashboard');
      }
    }
    catch (err) {
      setView('dashboard')
    }

  }, [router])


  if (!Session.session || !item || !Controller) {
    return <></>;
  }

  return (
    <>
      <header
        id="header"
        className="flex center between"
        style={{
          height: "3.5rem",
          borderBottom: `0.1rem solid ${theme.palette.divider}`,
          borderRight: `0.1rem solid ${theme.palette.divider}`,
          padding: isSm ? "0 0.5rem" : "0 1rem",
        }}>
        <div className={isSm ? "flex fit compact2" : "flex fit"}>
          {!Session.Preferences.isSidebarDocked && (
            <StyledIconButton
              title="Open Sidebar"
              onClick={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}>
              <MenuOutlined />
            </StyledIconButton>
          )}

          {Controller && (
            <ButtonBase className='flex compact middle fit' sx={{
              padding: "0.5rem 0.75rem",
              borderRadius: '0.25rem'
            }} onClick={() => {
              setIsCalendarOpen(true)
            }}>
              <CalendarMonthOutlined />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>{Controller.Calendar.days[6]?.format("MMMM YYYY") || "All Events"}</Typography>
            </ButtonBase>
          )}

          {!isSm && (
            <>

              {['calendar', 'month', 'week', 'day', 'data'].some(x => x === view) && (
                <div className="flex fit">
                  <FormControl sx={{
                    width: 120
                  }}>
                    <InputLabel id="demo-simple-select-label">View</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={router.query.view}
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
                          pushNewView('month')
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
                          pushNewView('week')
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
                          pushNewView('day')
                        }}
                      >
                        <ListItemIcon>
                          <CalendarViewDayOutlined fontSize="small" />
                        </ListItemIcon>
                        Day
                      </MenuItem>
                      <MenuItem
                        value="data"
                        onClick={() => {
                          pushNewView('data')
                        }}
                      >
                        <ListItemIcon>
                          <TableViewOutlined fontSize="small" />
                        </ListItemIcon>
                        Data
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              )}

              {view === 'data' && (
                <div className="flex fit">
                  <FormControl sx={{
                    width: 120
                  }}>
                    <InputLabel id="demo-simple-select-label">Format</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={router.query.format}
                      label="Format"
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
                        value="timeline"
                        onClick={() => {
                          pushNewFormat('timeline')
                        }}
                      >
                        <ListItemIcon>
                          <TableViewOutlined fontSize="small" />
                        </ListItemIcon>
                        Timeline
                      </MenuItem>

                    </Select>
                  </FormControl>
                </div>
              )}

              <StyledToggleButtonGroup value={view} size='small' isMini={false}>
                <ToggleButton
                  value="dashboard"
                  onClick={() => pushNewView('')}
                >
                  <GridView fontSize="small" />
                  Dashboard
                </ToggleButton>

                {!(item instanceof Event && isMoment(item)) && (

                  <ToggleButton
                    value={'calendar'}
                    onClick={() => pushNewView('calendar')}
                  >
                    <CalendarMonthOutlined fontSize="small" />
                    Calendar
                  </ToggleButton>
                )}

                <ToggleButton
                  value={'data'}
                  onClick={() => pushNewView('data')}
                >
                  <PivotTableChartOutlined fontSize="small" />
                  Data
                </ToggleButton>

                <ToggleButton
                  value={'maps'}
                  onClick={() => pushNewView('maps')}
                >
                  <MapOutlined fontSize="small" />
                  Maps
                </ToggleButton>

                {view === 'integrations' && (
                  <ToggleButton
                    value="integrations"
                  //  onClick={() => pushNewView('integrations')}
                  >
                    <ElectricalServicesOutlined fontSize="small" />
                    Integrations
                  </ToggleButton>
                )}


                {!router.asPath.startsWith('/me') && (
                  <>
                    {view === 'iam' && (
                      <ToggleButton
                        value={'iam'}
                      //  onClick={() => pushNewView('month')}
                      >
                        <PeopleOutline fontSize="small" />
                        IAM
                      </ToggleButton>
                    )}

                    {view === 'settings' && (
                      <ToggleButton
                        value={'settings'}
                      //  onClick={() => pushNewView('month')}
                      >
                        <SettingsOutlined fontSize="small" />
                        Settings
                      </ToggleButton>
                    )}

                    {view === 'apps' && (
                      <ToggleButton
                        value={'apps'}
                      //  onClick={() => pushNewView('month')}
                      >
                        <DeployedCodeIcon fontSize="small" />
                        Apps
                      </ToggleButton>
                    )}
                  </>
                )}

                <Popover
                  anchorEl={anchorEl}
                  open={isPopoverOpen}
                  onClick={(e) => {
                    setAnchorEl(null);
                  }}
                  onClose={(e: any) => {
                    e.stopPropagation();
                    setAnchorEl(null)
                  }}
                  slots={{
                    transition: Fade,
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        maxWidth: "100vw",
                        width: "10rem"
                      }
                    },
                    transition: {
                      timeout: 300,
                    },
                  }}

                >
                  <div className="column snug">
                    {/* <MenuItem className='flex compact' disableRipple onClick={e => pushNewView('integrations')}><ElectricalServicesOutlined fontSize="small" /><Typography>Integrations</Typography></MenuItem> */}


                    <MenuItem className='flex compact' disableRipple onClick={e => pushNewView('iam')}><PeopleOutline fontSize="small" /><Typography>IAM</Typography></MenuItem>
                    <MenuItem className='flex compact' disableRipple onClick={e => pushNewView('locations')}><LocationOnOutlined fontSize="small" /><Typography>Locations</Typography></MenuItem>
                    <MenuItem className='flex compact' disableRipple onClick={e => pushNewView('settings')}><SettingsOutlined fontSize="small" /><Typography>Settings</Typography></MenuItem>
                    <MenuItem className='flex compact' disableRipple onClick={e => pushNewView('apps')}><DeployedCodeIcon fontSize="small" /><Typography>Apps</Typography></MenuItem>
                  </div>
                </Popover>

                {!router.asPath.startsWith('/me') && (

                  <StyledIconButton
                    title="More"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const target = e.currentTarget || e.target;
                      setAnchorEl(target)
                    }}
                  >
                    <MoreVertOutlined fontSize="small" />
                  </StyledIconButton>
                )}


                {/* <ToggleButton
              value="table"
              onClick={() => pushNewView('locations')}
            >
              <LocationOnOutlined fontSize="small" />
              Locations
            </ToggleButton> */}

                {/* <ToggleButton
              value="crm"
              onClick={() => pushNewView('crm')}
            >
              <PeopleOutline fontSize="small" />
              CRM
            </ToggleButton>

            <ToggleButton
              value="apps"
              onClick={() => pushNewView('apps')}
            >
              <DeployedCodeIcon fontSize="small" />
              Apps
            </ToggleButton> */}




              </StyledToggleButtonGroup>
            </>
          )}
        </div>
        <div className="flex compact fit">
          {/* <TextField
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
          /> */}
          {!router.pathname.startsWith('/me') && (
            <IconButton>
              {(module ? Module?.IAM.members?.find(x => x.id() === Session.session?.id()) : Base?.IAM.members?.find(x => x.id() === Session.session?.id())) ? (
                <Star sx={{
                  fontSize: '1.5rem'
                }} />
              ) : (
                <StarOutline sx={{
                  fontSize: '1.5rem'
                }} />
              )}
            </IconButton>
          )}
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

      {isSm && (

        <Drawer
          anchor='top'
          open={isCalendarOpen}
          // onClick={() => setIsCalendarOpen(false)}
          onClose={() => setIsCalendarOpen(prev => !prev)}
          sx={{
            '& .MuiDrawer-paper': {
              display: 'flex',
              flexDirection: 'column',
              // position: 'fixed',
              width: "100%",
              padding: "2rem 1rem",
              height: "fit-content",
              // overflow: "hidden",
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              // zIndex: 5,
              // borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
            },
          }}
        >
          <div className="flex center middle">
            {router.asPath.startsWith('/me') ? (
              <StyledWeekPicker
                mode={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                Calendar={Session.Calendar}
                value={Session.Calendar.frameDate}
                source={item}
              />
            ) : (
              <StyledWeekPicker
                mode={theme.palette.mode === 'dark' ? 'light' : 'dark'}
                Calendar={Controller.Calendar}
                value={Controller.Calendar.frameDate}
                source={item}
              />
            )}
          </div>
        </Drawer>
      )}

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
          <div className="column snug">
            <ButtonBase

              onClick={() => {
                router.push(`/me`)
              }}
              className="flex compact left"
              sx={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem"
              }}
            >
              <PersonOutline sx={{
                fontSize: "1rem"
              }} />
              <Typography>Your Profile</Typography>
            </ButtonBase>
            <ButtonBase

              onClick={() => {
                Session.Preferences.toggleMode()
              }}
              className="flex compact left"
              sx={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem"
              }}
            >
              <DarkModeOutlined sx={{
                fontSize: "1rem"
              }} />
              <Typography>Dark Mode</Typography>
            </ButtonBase>
            <ButtonBase
              className="flex compact left"
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
              className="flex compact left"
              sx={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem"
              }}
              onClick={() => {
                Session.logout();
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
  );
}
