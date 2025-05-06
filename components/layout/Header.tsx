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
  Star
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
} from '@mui/material';
// import useSearchDialog, { UseSearchDialog } from '@/lib/useSearchDialog';
import { UseSession } from '@/lib/global/useSession';
import { DIVIDER_NO_ALPHA_COLOR } from '../Divider';
import DeployedCodeIcon from '../icons/DeployedCodeIcon';
import StyledIconButton from '../StyledIconButton';
import StyledToggleButtonGroup from '../StyledToggleButtonGroup';
import router, { useRouter } from 'next/router';
import ItemStub from '../ItemStub';
import { Member } from '@/schema';
import { UseBase } from '@/lib/global/useBase';
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

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [view, setView] = useState<string | null>(null);

  const pushNewView = (tab: string) => {

    let theView = undefined;
    if (['month', 'week', 'day'].some(x => x === tab)) {
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

    router.push({
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


  if (!Session.session) {
    return <></>;
  }

  return (
    <>
      <header
        id="header"
        className="flex center between"
        style={{
          height: "3.5rem",
          borderBottom: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
          borderRight: `0.1rem solid ${DIVIDER_NO_ALPHA_COLOR}`,
          padding: isSm ? "0 0.5rem" : "0 1rem",
          backgroundColor: '#ffffff',

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
          {view === 'calendar' && (
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
            <ToggleButton
              value={'calendar'}
              onClick={() => pushNewView('month')}
            >
              <CalendarMonthOutlined fontSize="small" />
              Calendar
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

            {view === 'iam' && (
              <ToggleButton
                value={'iam'}
              //  onClick={() => pushNewView('month')}
              >
                <VpnKeyOutlined fontSize="small" />
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
              className="flex compact"
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
              className="flex compact"
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
  );
}
