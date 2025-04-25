"use client"
import React, { useEffect, useState, useRef, JSX } from 'react';
import {
  CalendarMonthOutlined as CalendarMonthOutlined,
  LogoutOutlined,
  AccountCircleOutlined,
  MenuOutlined,
  HubOutlined,
  SearchOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  AddOutlined
} from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  useTheme,
  Typography,
  useMediaQuery,
  Drawer,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
// import useSearchDialog, { UseSearchDialog } from '@/lib/useSearchDialog';
import { Event, EventData, Group, MemberFactory } from '@/schema';
import { UseSession } from '@/lib/global/useSession';
import { UseBase } from '@/lib/global/useBase';
import { Mode, Type } from '@/types/globals';
import useDraggableEventBlock, { DraggedEventBlockProps } from '../calendar/DraggableEventBlock';
import dayjs from '@/lib/utils/dayjs';
import { Dayjs } from 'dayjs';
import useViewEvent from '@/lib/global/useViewEvent';
import LargeBaseCard from '../bases/LargeBaseCard';
const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";


export default function Header({
  Session,
  Base,
  children,
  desktopChildren,
  noBack = false,
  pageNavigation,
  rightSide = <></>
}: {
  Session: UseSession,
  Base?: UseBase,
  children: any,
  desktopChildren?: JSX.Element,
  noBack?: boolean
  pageNavigation?: JSX.Element,
  rightSide?: JSX.Element
}) {
  const router = useRouter();
  const theme = useTheme();
  const [standardHeight, setStandardHeight] = useState(40);
  const [prevScrollPos, setPrevScrollPos] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);
  const [isOpenDropDown, setIsOpenDropDown] = useState<boolean>(false);
  const isSM = useMediaQuery(theme.breakpoints.down("sm"));
  const isXS = useMediaQuery(theme.breakpoints.down("xs"));
  const TIME_LEGEND_COLUMN_WIDTH = '4rem';

  // const handleAction = (selected: Event) => {
  //   Base.Viewer.startViewer(Type.Event, selected);
  //   return;
  // }
  // const { SearchForm, SearchButton, toggleSearch }: UseSearchDialog =
  //   useSearchDialog(searchConfig, handleStart, handleAction, EventCard);

  const { EventPopover, handleOpenEventPopover } = useViewEvent(
    Session.base,
    Session.Events,
    Base ? Base.Creator.startCreator : Session.Creator.startCreator,
    Base ? Base.theme : theme
  );

  const container = useRef(null);

  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [weekOfDate, setWeekOfDate] = useState<Dayjs[] | null>(dayjs().startOf('week').getFrame(7));

  useEffect(() => {
    if (Session.Calendar.days.length != 1) {
      // Session.Calendar.gotoDate(dayjs());
      return;
    }

    const theDate = Session.Calendar.days[0];
    setDate(theDate);

    const startOfWeek = theDate.startOf('week');
    setWeekOfDate(startOfWeek.getFrame(7))

  }, [Session.Calendar.days]);

  const [expanded, setExpanded] = useState(false);


  const handleUpOnMove = async (item: DraggedEventBlockProps) => {
    if (!item.uuid) {
      return;
    }
    const theEvent = await Session.Events.get(item.uuid);
    if (!theEvent || theEvent instanceof Array) {
      return;
    }

    await MemberFactory.getMetadata(theEvent)
      .then(object => {
        Session.Events.swap(object);
      })
      .catch(err => {
        console.log(err)
      });

    const token = await theEvent.getToken();

    theEvent.start_time = item.currStart.getDayjs(5).toLocalChronos();
    theEvent.end_time = item.currEnd.getDayjs(5).toLocalChronos();
    theEvent.date = item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day') : item.dragDay
    theEvent.is_local = true;

    Base.Creator.startCreator(Type.Event, Mode.Modify, theEvent);
  }

  const handleUpOnCreate = async (item: DraggedEventBlockProps) => {

    if (!item.dragDay.isSame(item.dragEndDay)) {

      // const newSchedule = Schedule.createOffDrag(
      //   item.dragDay,
      //   item.dragEndDay,
      //   item.currStart.getDayjs(5).toLocalChronos(),
      //   item.currEnd.getDayjs(5).toLocalChronos()
      // ).eject();

      // const presets: Partial<MerchantData> = {
      //   schedules: [newSchedule]
      // }

      // handleCreate(Type.Merchant, Mode.Create, {
      //   ...new Merchant(presets, true).eject(),
      //   callback: Events.addEvent
      // });

      const presets = {
        date: item.dragDay.yyyymmdd(),
        end_date: item.dragEndDay.yyyymmdd()
      }


      Base.Creator.startCreator(Type.Event, Mode.Create, new Event(presets))

      return;
    }

    const presets: Partial<EventData> = {
      date: Number(item.dragDay.yyyymmdd()),
      start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
      end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
      is_local: true
    }

    Base.Creator.startCreator(Type.Event, Mode.Create, new Event(presets), {
      callback: Session.Events.add
    });
  }


  const handleScroll = () => {
    console.log('Handle scroll');

    if (!prevScrollPos) {
      setPrevScrollPos(window.scrollY);
      console.log('No prev scroll pos');
      return;
    }
    const currentScrollPos = window.scrollY;
    if (!currentScrollPos) return;
    const isVisible = prevScrollPos > currentScrollPos;

    setVisible(isVisible);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    if (!isSM) {
      setIsOpenDropDown(false)
    }
  }, [isSM])


  useEffect(() => {
    try {
      if (!window) return;
      setPrevScrollPos(window.scrollY);
    } catch (err) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!window) return;
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevScrollPos]);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  const [sequence, setSequence] = useState<number[] | null>(null);

  const { block, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(container, standardHeight, container, handleUpOnMove, handleUpOnCreate);

  useEffect(() => {
    const start = 6;
    const increment = 0.5;
    const end = 30;
    const length = Math.floor((end - start) / increment) + 1;
    setSequence(Array.from({ length }, (_, index) => start + index * increment));
  }, []);

  const columns = 2; // Number of columns in the grid
  const delayStep = 100; // Delay in ms between each animation


  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    Session.Calendar.gotoDate(dayjs(String(newValue)))
  };

  const RightSidebar = (
    <div className='column snug'
      style={{ backgroundColor: theme.palette.background.paper }}
      onMouseUp={handleMouseUp}
    >

      <div className='flex compact' style={{
        position: "relative",
        flexWrap: 'wrap',
        marginBottom: '5rem',
        padding: "2rem"
      }}>
        {Session && Session.bases && Session.isRightSidebarOpen && Session.bases.map((m, index) => {

          const row = Math.floor(index / columns);
          const col = index % columns;

          // Compute animation delay
          const delay = (row + col) * delayStep;

          return m instanceof Group ? (
            <LargeBaseCard
              key={m.uuid}
              style={{
                width: `calc(${Number(100 / columns).toFixed(0)}% - (1rem / ${columns}))`,
                height: "10rem",
                marginBottom: "0.5rem",
                animation: `popIn 0.5s ease forwards`,
                animationDelay: `${delay}ms`,
                transform: "scale(0)",
                opacity: 0,
              }}
              groupMember={m}
              onClick={async () => {
                await Session.changeBase(m)
                router.push(`/be/${m.id()}`);
              }}
            />
          ) : null
        })}
        {Session && Session.bases && Session.bases.length === 0 && (
          <Alert>No bases for the session.</Alert>
        )}
      </div>

      <MenuItem
        onClick={() => {
          if (!Base) {
            return;
          }
          Base.Creator.startCreator(Type.Group, Mode.Create, new Group({
            theme_color: theme.palette.primary.main
          }), {
            callback: (newGroup) => Session.addNewBase(newGroup)
          })
          Session.setIsRightSidebarOpen(false);
        }
        }
        className='flex compact'
      >
        <AddOutlined fontSize='small' />
        <Typography >New Group</Typography>
      </MenuItem>

      <div className="column snug">
        <MenuItem
          onClick={() => {
            // Session.logout();
            router.push(`/me/?base=${Session.base?.id()}`)
            Session.setIsRightSidebarOpen(false);
          }}
          className='flex compact'
        >
          <AccountCircleOutlined fontSize='small' />
          <Typography >Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Session.logout();
            router.push(`/me/calendar`)
            Session.setIsRightSidebarOpen(false);
          }}
          className='flex compact'
        >
          <CalendarMonthOutlined fontSize='small' />
          <Typography >Calendar</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            // Session.logout();
            router.push(`/me/integrations`)
            Session.setIsRightSidebarOpen(false);
          }}
          className='flex compact'
        >
          <HubOutlined fontSize='small' />
          <Typography >Integrations</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            Session.Preferences.toggleMode();
          }}
          className='flex compact'
        >
          {Session.Preferences.mode === 'dark' ? <DarkModeOutlined fontSize='small' /> : <LightModeOutlined fontSize='small' />}
          <Typography >{Session.Preferences.mode === 'dark' ? "Go to Light Mode" : "Go to Dark Mode"}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            Session.logout();
            Session.setIsRightSidebarOpen(false);
          }}
          className='flex compact'
        >
          <LogoutOutlined color="error" fontSize='small' />
          <Typography color="error">Logout</Typography>
        </MenuItem>

      {Session.session && (
        <Typography>{Session.session.id()}</Typography>
      )}
      </div>


    </div>
  )

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  if (!Session.session) {
    return <></>;
  }

  return (
    <>

      {isSM && (
        <div className="column snug" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          width: "100vw",
          zIndex: 4
        }}>
          {pageNavigation}
          <div className="div flex between"
            style={{
              height: "5rem",
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              padding: "1rem 1.5rem",
            }}>
            <Tabs
              className="flex"
              sx={{
                width: "100%",
                '& .MuiTabs-flexContainer': {
                  justifyContent: "space-between"
                }
              }}
              onChange={(e) => {
                console.log(e);
              }} aria-label="basic tabs example">
              <Tab onClick={(e) => {
                Session.Preferences.setIsSidebarDocked(prev => !prev);
              }}
                label="Menu"
                icon={<MenuOutlined />}
                {...a11yProps(0)} />
              <Tab label="Search" icon={<SearchOutlined />} {...a11yProps(1)} />
              <Tab label="Create" icon={<AddOutlined />} {...a11yProps(2)} />
            </Tabs>
          </div>
        </div>
      )}
      <header
        id="header"
        className='flex between center snug'
        style={{
          position: "fixed",
          top: 0,
          background: theme.palette.background.default,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
          color: theme.palette.primary.contrastText,
          zIndex: 4,
          width: Session.Preferences.isSidebarDocked ? "calc(100% - 20rem)" : "100%",
          height: "3.55rem",
        }}
      >
        <div className="flex compact" style={{ width: "calc(100% - 3rem)" }}>
          {!Session.Preferences.isSidebarDocked && (
            <Tooltip title="Open Sidebar">
              <IconButton onClick={() => Session.Preferences.setIsSidebarDocked(prev => !prev)}>
                <MenuOutlined color="primary" />
              </IconButton>
            </Tooltip>
          )}
          {children}
          {!isSM && desktopChildren}
        </div>

        <div className="flex fit compact">
          {rightSide}
          <IconButton
            onClick={() => Session.setIsRightSidebarOpen(true)}
          >
            <Avatar
              src={`${MEDIA_BASE_URI}/${Session.session.getIconPath()}`}
              sx={{ width: "2rem", height: "2rem" }}
            />
          </IconButton>
        </div>
        <Drawer
          anchor="right"
          open={Session.isRightSidebarOpen}
          onClose={() => Session.setIsRightSidebarOpen(false)}
          keepMounted
          sx={{
            zIndex: "2000",
            '& .MuiDrawer-paper': {
              position: 'absolute',
              width: '25rem',
              // padding: "0.5rem 0.5rem"
            },
          }}
        >
          {RightSidebar}
        </Drawer>
        {/* {SearchForm} */}
      </header>
    </>
  );
}
