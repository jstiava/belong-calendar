'use client';
import { ChevronLeft, ChevronRight, CloseOutlined, EditOutlined } from '@mui/icons-material';
import {
  Avatar,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  createTheme,
  darken,
  lighten,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect, useRef, MouseEvent, Dispatch } from 'react';
import CalendarDay from '@/lib/CalendarDay';
import { UseCalendar } from '@/lib/useCalendar';

import { Event, EventData, Group, Member, MemberFactory, Schedule, dayjs, isAllSingleDay, isMoment, isMultiDayEvent, isNotScheduled, isSingleTimeEvent, Dayjs, Events } from '@jstiava/chronos';
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps } from './DraggableEventBlock';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import DayInMonthView from './DayInMonthView';
import useViewEvent from '@/lib/global/useViewEvent';
import Divider, { DIVIDER_NO_ALPHA_COLOR } from '../Divider';
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiContext, useGridApiRef, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import { IAM } from 'aws-sdk';
import StyledIconButton from '../StyledIconButton';
import MonthView from './MonthView';
import { CustomNoRowsOverlay } from '@/pages/be/[module]/iam';
import ItemStub from '../ItemStub';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import Image from 'next/image';
import BackgroundImage from '../Image';
import { useRouter } from 'next/router';

export const CustomCheckbox = (props: any) => {

  const apiRef = useGridApiContext();
  const isSelected = props.value;

  return (
    <div
      {...props}
      onClick={undefined}
    // size="small"
    />
  )
};

const PREVIEW_SIZE = '30rem';

interface DataViewProps {
  selected: Event[] | null;
  setSelected: Dispatch<React.SetStateAction<Event[] | null>>;
  Preferences: UsePreferences;
  handleSelect: (e: MouseEvent, event: Event) => void;
  source: Member | null,
  Calendar: UseCalendar,
  days: any;
  handleCreate: StartCreator;
  handleView: any;
  Events: UseEvents;
  schedule?: Partial<Schedule>;
}

const addDividers = (events: Event[]) => {

  const today = dayjs();

  const copy = [...events].sort(Events.sortByDate)

  console.log({
    message: "Sorted",
    before: events.map(x => x.name),
    after: copy.map(x => x.name),
  });

  for (let i = 0; i < copy.length - 1; i++) {

    const event = copy[i];
    const next = copy[i + 1].date

    if (!next) {
      continue;
    }

    if (next.isToday() || next.isAfter(today, 'd')) {
      const dividerRow = {
        id: 'divider',
        type: 'divider',
      };
      return [
        ...copy.slice(0, i + 1),
        dividerRow,
        ...copy.slice(i + 1),
      ];
    }
  }

  return copy;
};

const DataView = ({
  selected,
  setSelected,
  Preferences,
  handleSelect,
  source,
  Calendar,
  days,
  handleCreate,
  handleView,
  Events,
}: DataViewProps) => {
  const theme = useTheme();
  const isSmall = useMediaQuery("(max-width: 90rem)");
  const TIME_LEGEND_COLUMN_WIDTH = isSmall ? '4rem' : '4.5rem';
  const calendarRef = useRef<HTMLDivElement>(null);
  const [standardHeight, setStandardHeight] = useState(40);
  const apiRef = useGridApiRef();

  const [events, setEvents] = useState<(Event | any)[] | null>(null);

  useEffect(() => {

    if (!Events.events) {
      return;
    }

    const sortedAndDividerAdded = addDividers(Events.events);

    setEvents(sortedAndDividerAdded)

  }, [Events])


  const { EventPopover, handleOpenEventPopover } = useViewEvent(
    source,
    Events,
    handleCreate,
    theme
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [previewed, setPreviewed] = useState<Member | null>(Events.events && Events.events.length > 0 ? Events.events[0] : null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [peekDate, setPeekDate] = useState<Dayjs | null>(dayjs());
  const [weekOfPeekDate, setWeekOfPeekDate] = useState<Dayjs[] | null>(dayjs().startOf('week').getFrame(7));
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setPeekDate(dayjs(String(newValue)));
  };
  const container = useRef(null);
  const [sequence, setSequence] = useState<number[] | null>(null);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


  useEffect(() => {
    const start = 6;
    const increment = 0.5;
    const end = 30;
    const length = Math.floor((end - start) / increment) + 1;
    setSequence(Array.from({ length }, (_, index) => start + index * increment));
  }, []);

  const handlers = useSwipeable({
    onSwipedRight: () => {
      Calendar.prev()
      // Perform your action here
    },
    onSwipedLeft: () => {
      Calendar.next();
    }
  });

  const isLg = useMediaQuery(theme.breakpoints.down('lg'));

  const handleUpOnMove = async (item: DraggedEventBlockProps) => {
    if (!item.uuid) {
      return;
    }
    const theEvent = await Events.get(item.uuid);
    if (!theEvent || theEvent instanceof Array) {
      return;
    }

    // await theEvent.getMetadata()
    //   .then(object => {
    //     Events.swap(object);
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   });

    // theEvent.start_time = item.currStart.getDayjs(5).toLocalChronos();
    // theEvent.end_time = item.currEnd.getDayjs(5).toLocalChronos();
    // theEvent.date = item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day') : item.dragDay
    // theEvent.oldDate = theEvent.date;
    // theEvent.is_local = true;

    handleCreate(Type.Event, Mode.Modify, theEvent);
  }

  const columns: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      width: 50,
      renderCell: (params) => {

        if (params.row.type === 'divider') {
          return <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: theme.palette.primary.main
          }}></div>
        }

        return (
          <div style={{
            width: "100%",
            height: '100%'
          }}
            onClick={e => {
              const isSelected = apiRef.current.getSelectedRows().has(params.id);
              apiRef.current.selectRow(params.id, !isSelected);
            }}
          ></div>
        )
      }
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 300,
      renderCell: (params: GridRenderCellParams<Member | any, any>) => {

        if (params.row.type === 'divider') {
          return <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: theme.palette.primary.main
          }}></div>
        }

        const prefix = params.row instanceof Group ? 'be' : params.row instanceof Event ? 'event' : null;
        return (
          <div className='flex compact left middle' style={{ position: 'relative', height: '100%' }}>
            <ItemStub
              item={params.row}
            />
            <div className="flex fit" style={{
              position: "absolute",
              right: 0
            }}>
              {/* {props.Session.session && props.Session.session.username === params.value.username && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        props.Session.handleLeave();
                                        router.push('/dashboard');
                                    }}
                                >
                                    Leave
                                </Button>
                            )} */}

              <Button
                disableRipple
                size="small"
                variant="outlined"
                onClick={() => {
                  setPreviewed(params.row);
                  setIsPreviewOpen(true)
                }}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  padding: "0.05rem 0.5rem",
                  width: "fit-content",
                  minWidth: 'unset'
                }}
              >
                Open
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      field: 'date',
      headerName: 'Start',
      width: 150,
      renderCell: (params: GridRenderCellParams<Member | any, Dayjs>) => {

        if (params.row.type === 'divider') {
          return <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: theme.palette.primary.main
          }}></div>
        }

        if (!params.value) {
          return null;
        }

        if (params.row instanceof Event && !params.row.start_time) {
          return params.value.format("MMM DD, YYYY")
        }

        return params.value.format("MMM DD, YYYY - h:mm A")
      }
    },
    ...Calendar.days.map((date) => ({
      field: String(date.yyyymmdd()),
      headerName: date.format("ddd, MMM DD"),
      width: 150,
      renderHeader: () => (
        <div className="flex compact fit middle">
          {date.isToday() && (
            <Chip
              size="small"
              label={"Today"}
              variant="filled"
              color="primary"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600
              }}
            />
          )}
          <Typography sx={{
            fontSize: '0.875rem',
            fontWeight: 600
          }}>{date.format("ddd, MMM DD")}</Typography>
        </div>
      ),
      valueGetter: (value: any, row: Event | any) => {
        if (row.type === 'divider') {

          return null;
        }


        if (isMoment(row)) {

          if (row.date.isSame(date, 'd')) {
            return {
              type: 'moment',
              date: row.date,
              start_time: row.start_time
            }
          }

          return {
            type: 'moment',
            date: null,
            start_time: null
          }
        }

        if (isSingleTimeEvent(row)) {

          if (row.date.isSame(date, 'd')) {
            return {
              type: 'single_time',
              date: row.date,
              start_time: row.start_time,
              end_time: row.end_time
            }
          }

          return {
            type: 'single_time'
          }
        }

        if (isAllSingleDay(row)) {
          return {
            type: 'single_day'
          }
        }

        if (isMultiDayEvent(row)) {
          return {
            type: 'multi_day'
          }
        }

        if (!isNotScheduled(row)) {
          const result = row.isOpenDetailed(date);
          return {
            type: 'schedule',
            ...result
          };
        }

        return null;
      },
      renderCell: (params: GridRenderCellParams<Event | any, any>) => {

        if (params.row.type === 'divider') {
          return <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: theme.palette.primary.main
          }}></div>
        }

        if (!params.value) {
          return null;
        }

        if (params.value.type === 'moment') {

          if (params.value.start_time) {
            return (
              <div className="flex left middle" style={{
                width: '100%',
                height: '100%'
              }}>
                <span style={{
                  width: "100%",
                  height: 'fit-content',
                  textAlign: 'left',
                  margin: "auto 0",
                  lineHeight: '115%',
                  whiteSpace: "normal",
                  overflow: "clip",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}>{params.value.start_time.print(true)}</span>
              </div>
            )
          }

          return null;
        }

        if (params.value.type === 'single_time') {

          if (date.yyyymmdd() != params.row.date?.yyyymmdd()) {
            return null;
          }

          return (
            <div className="flex left middle" style={{
              width: '100%',
              height: '100%'
            }}>
              <span style={{
                width: "100%",
                height: 'fit-content',
                textAlign: 'left',
                margin: "auto 0",
                lineHeight: '115%',
                whiteSpace: "normal",
                overflow: "clip",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}>{params.value.start_time.to(params.value.end_time)}</span>
            </div>
          )
        }

        if (params.value.type === 'single_day' && isAllSingleDay(params.row)) {
          if (date.yyyymmdd() != params.row.date?.yyyymmdd()) {
            return null;
          }

          return (
            <ButtonBase className="flex left middle"
              onContextMenu={e => {
                e.preventDefault();
                handleView(Type.Event, params.row, {
                  e,
                  isRightClick: true,
                  date
                })
              }}
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: params.row.theme_color ? params.row.theme_color : theme.palette.primary.main,
                padding: "0 0.5rem",
                color: params.row.theme_color ? theme.palette.getContrastText(params.row.theme_color) : theme.palette.primary.contrastText
              }}>
              <Typography variant="caption">Single All-Day</Typography>
            </ButtonBase>
          )
        }

        if (params.value.type === 'multi_day' && isMultiDayEvent(params.row)) {

          if (date.isAfter(params.row.date.subtract(1, 'd'), 'D') && date.isBefore(params.row.end_date.add(1, 'd'), 'D')) {
            return (
              <ButtonBase className="flex left middle"
                onContextMenu={e => {
                  e.preventDefault();
                  handleView(Type.Event, params.row, {
                    e,
                    isRightClick: true,
                    date
                  })
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: params.row.theme_color ? params.row.theme_color : theme.palette.primary.main,
                  padding: "0 0.5rem",
                  color: params.row.theme_color ? theme.palette.getContrastText(params.row.theme_color) : theme.palette.primary.contrastText
                }}>
                <Typography variant="caption">All-Day</Typography>
              </ButtonBase>
            )
          }

          return null
        }

        if (params.value.type === 'schedule') {
          if (!params.value.hours) {
            return null;
          }

          return (
            <ButtonBase className="flex left middle"
              onContextMenu={e => {
                e.preventDefault();
                handleView(Type.Event, params.row, {
                  e,
                  isRightClick: true,
                  date
                })
              }}
              style={{
                width: '100%',
                height: '100%'
              }}>
              <span style={{
                width: "100%",
                height: 'fit-content',
                textAlign: 'left',
                margin: "auto 0",
                lineHeight: '115%',
                whiteSpace: "normal",
                overflow: "clip",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}>{params.value.hours.as_text}</span>
            </ButtonBase>
          )
        }

        return null;
      },
    }))
  ];

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


      handleCreate(Type.Event, Mode.Create, new Event(presets))

      return;
    }

    const presets: Partial<EventData> = {
      date: item.currStart.getHMN() <= 6 ? item.dragDay.add(1, 'day').yyyymmdd() : item.dragDay.yyyymmdd(),
      start_time: String(item.currStart.getDayjs(5).toLocalChronos().getHMN()),
      end_time: String(item.currEnd.getDayjs(5).toLocalChronos().getHMN()),
      is_local: true
    }

    handleCreate(Type.Event, Mode.Create, new Event(presets), {
      callback: Events.add
    });
  }

  const handleDayTimeClick = (e: MouseEvent) => {
    const RIGHT_CLICK = 2;
    if (e.button === RIGHT_CLICK) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', "Fri", "Sat"];



  if (!events) {
    return null;
  }

  return (
    <div className="flex snug top" style={{
      height: "100%"
    }}>
      <div className="column" style={{
        width: `calc(100% - ${isPreviewOpen ? PREVIEW_SIZE : '0rem'})`,
        height: "100%",
        borderTop: '1px solid transparent',
        borderRight: `0.05rem solid ${theme.palette.divider}`

      }}>
        <DataGrid
          apiRef={apiRef}
          loading={!events}
          getRowId={row => {
            if (row.type && String(row.type).startsWith('divider')) {
              return 'divider'
            }
            return row.id();
          }}
          sortingMode='client'
          rows={events}
          isRowSelectable={(row : any) => row.type !== 'divider'}
          sx={{
            minHeight: "calc(100% - 5rem) !important",
            borderRadius: "0",
            border: 0,
            '--DataGrid-rowBorderColor': theme.palette.divider,
            '& .MuiDataGrid-columnSeparator': {
              color: theme.palette.divider
            },
            '& .MuiDataGrid-withBorderColor': {
              borderColor: theme.palette.divider
            },
            '& .MuiDataGrid-cell': {
              padding: 0
            }
          }}
          columnHeaderHeight={48}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 },
            },
          }}
          disableColumnSorting
          getRowHeight={(params) => {
            if (params.id === 'divider') {
              return 4;
            }
            return 40;
          }}
          disableDensitySelector
          disableColumnSelector
          pageSizeOptions={[50, 100]}
          checkboxSelection
          slots={{
            // baseCheckbox: CustomCheckbox,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
        // slots={{
        //     toolbar: () => (
        //         <CustomToolbar
        //             selected={rowSelectionModel}
        //         />
        //     ),
        //     
        // }}
        // hideFooterPagination
        // onRowSelectionModelChange={newRowSelectionModel => {
        //     setRowSelectionModel(newRowSelectionModel);
        // }}
        // rowSelectionModel={rowSelectionModel}
        // hideFooter
        />
      </div>

      {source && <DataViewPreview
        source={source}
        previewed={previewed}
        handleCreate={handleCreate}
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
      />}


    </div>
  );
};

export default DataView;


export const DataViewPreview = ({
  previewed, handleCreate, isPreviewOpen, setIsPreviewOpen,
  source
}: {
  previewed: Member | null,
  handleCreate: any,
  isPreviewOpen: boolean,
  setIsPreviewOpen: any,
  source: Member
}) => {

  const theme = useTheme();
  const router = useRouter();

  const hasDataStore = previewed ?
    typeof (previewed as any).data_store === 'object' && (previewed as any).data_store !== null : null;


  if (!previewed) {
    return null;
  }

  return (
    <ThemeProvider theme={createTheme(theme, {
      palette: {
        primary: {
          main: previewed.theme_color,
          contrastText: previewed.theme_color ? theme.palette.getContrastText(previewed.theme_color) : theme.palette.text.primary,
          light: previewed?.theme_color ? lighten(previewed?.theme_color, 0.9) : "#ffffff",
          dark: previewed?.theme_color ? darken(previewed?.theme_color, 0.1) : "#ffffff",
        }
      }
    })}>
      <div className="column top" style={{
        position: 'relative',

        width: PREVIEW_SIZE,
        height: 'calc(100% - 2rem)',
        display: isPreviewOpen ? 'flex' : 'none'
      }}>
        {previewed && (
          <>

            {'cover_img' in previewed && (previewed.cover_img) && (
              <BackgroundImage
                url={`${MEDIA_BASE_URI}/${(previewed.cover_img as any).path}`}
                width={"100%"}
                height="6rem"
                style={{
                  width: "100%",
                  height: "30vh",
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat'
                }} />
            )}
            <div className="column compact" style={{
              position: 'relative',
              margin: '1.5rem',
            }}>
              <div className="column compact">
                {previewed.icon_img && (
                  <Avatar
                    alt={previewed.name}
                    src={`${MEDIA_BASE_URI}/${previewed.getIconPath()}`}
                    sx={{
                      width: "4rem",
                      height: '4rem',
                      border: `0.25rem solid ${previewed.theme_color}`
                    }}></Avatar>
                )}
              </div>
              {previewed instanceof Event && previewed.wordmark_img ? (
                <BackgroundImage
                  url={`${MEDIA_BASE_URI}/${previewed.wordmark_img.path}`}
                  width={"100%"}
                  height="6rem"
                  style={{
                    width: "auto",
                    maxWidth: "100%",
                    backgroundPosition: 'left',
                    filter: theme.palette.mode === 'light' ? 'invert(1)' : "unset",
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat'
                  }} />
              ) : (
                <Typography variant="h4"><span dangerouslySetInnerHTML={{ __html: previewed.name }} /></Typography>
              )}
              <Typography sx={{
                textTransform: 'capitalize'
              }}>{previewed.type}</Typography>


              <div className="column left">
                <div className="flex between">
                  <Typography sx={{
                    fontWeight: 700
                  }}>Unique ID</Typography>
                  <Typography>{previewed.uuid}</Typography>
                </div>
                {previewed instanceof Event && (
                  <>
                    <div className="flex between">
                      <Typography sx={{
                        fontWeight: 700
                      }}>Date</Typography>
                      {previewed.date && <Typography>{previewed.date.format("ddd, MMM DD, YYYY")}</Typography>}
                    </div>
                    <div className="flex between">
                      <Typography sx={{
                        fontWeight: 700
                      }}>Start Time</Typography>
                      {previewed.start_time && <Typography>{previewed.start_time.print()}</Typography>}
                    </div>
                    <div className="flex between">
                      <Typography sx={{
                        fontWeight: 700
                      }}>End Date</Typography>
                      {previewed.end_date && <Typography>{previewed.end_date.format("ddd, MMM DD, YYYY")}</Typography>}
                    </div>
                    <div className="flex between">
                      <Typography sx={{
                        fontWeight: 700
                      }}>End Time</Typography>
                      {previewed.end_time && <Typography>{previewed.end_time.print()}</Typography>}
                    </div>
                  </>
                )}
                {hasDataStore && (
                  <div className="column compact">
                    {Object.entries((previewed as any).data_store).map(([key, value]) => (
                      <div className="flex between" key={key}>
                        <Typography sx={{ fontWeight: 700 }}>{key}</Typography>
                        <Typography>{String(value)}</Typography>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex compact2 right" style={{
                position: 'absolute',
                top: "-1rem",
                right: "-1rem"
              }}>
                <StyledIconButton title="Edit"
                  onClick={(e: any) => {
                    handleCreate(Type.Event, Mode.Modify, previewed);
                  }}
                >
                  <EditOutlined sx={{
                    fontSize: "1rem"
                  }} />
                </StyledIconButton>
                <StyledIconButton title="Close Preview" onClick={() => {
                  setIsPreviewOpen(false);
                }}>
                  <CloseOutlined sx={{
                    fontSize: "1rem"
                  }} />
                </StyledIconButton>
              </div>
            </div>

            <div className="column compact" style={{
              position: 'absolute',
              bottom: "1rem",
              width: '100%',
              padding: "1.5rem"
            }}>
              {previewed instanceof Event && previewed.link && (
                <Button
                  fullWidth
                  variant='text'
                  size="large"
                  onClick={e => {
                    window.open(String(previewed.link), '_blank')
                  }}
                >Open Link</Button>
              )}
              {/* <Button
                fullWidth
                variant='contained'
                size="large"
                onClick={e => {
                  const pathParts = router.pathname.split('/');
                  const currentTab = pathParts[3];
                  const { base, module, ...rest } = router.query;
                  router.push({
                    pathname: `${router.asPath.startsWith('/me') ? '/me/' : '/be/'}${previewed.id()}${currentTab ? `/${currentTab}` : ``}`,
                    query: {
                      ...rest,
                      base: source?.id()
                    }
                  })
                }}
              >Open In Full</Button> */}
              <Button
                fullWidth
                variant='contained'
                size="large"
                onClick={e => {
                  handleCreate(Type.Event, Mode.Modify, previewed);
                }}
              >Edit</Button>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  )
}