'use client';
import { ChevronLeft, ChevronRight, CloseOutlined, EditOutlined } from '@mui/icons-material';
import {
  Avatar,
  Button,
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
import dayjs from '@/lib/utils/dayjs';
import { Event, EventData, Group, Member, MemberFactory, Schedule } from "@/schema";
import { Mode, Type } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { Dayjs } from 'dayjs';
import { UseEvents } from '@/lib/global/useEvents';
import useDraggableEventBlock, { DraggedEventBlockProps } from './DraggableEventBlock';
import { UsePreferences } from '@/lib/global/usePreferences';
import { useSwipeable } from 'react-swipeable';
import DayInMonthView from './DayInMonthView';
import useViewEvent from '@/lib/global/useViewEvent';
import Divider, { DIVIDER_NO_ALPHA_COLOR } from '../Divider';
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid';
import { IAM } from 'aws-sdk';
import StyledIconButton from '../StyledIconButton';
import MonthView from './MonthView';
import { CustomNoRowsOverlay } from '@/pages/be/[module]/iam';
import ItemStub from '../ItemStub';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import Image from 'next/image';
import BackgroundImage from '../Image';
import { isAllSingleDay, isMoment, isMultiDayEvent, isNotScheduled, isSingleTimeEvent } from '@/lib/CalendarDays';

const CustomCheckbox = (props: any) => (
  <Checkbox
    {...props}
    size="small"
  />
);

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


  const { EventPopover, handleOpenEventPopover } = useViewEvent(
    source,
    Events,
    handleCreate,
    theme
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [previewed, setPreviewed] = useState<Member | null>(null);
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
      field: 'name',
      headerName: 'Name',
      width: 300,
      // sortComparator: nameAlphaComparator,
      valueGetter: (value, row) => {
        return row;
      },
      renderCell: (params: GridRenderCellParams<Member, any>) => {
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
      valueGetter: (value: any, row: Event) => {

        if (isMoment(row) || isSingleTimeEvent(row)) {
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
      renderCell: (params: GridRenderCellParams<Member, any>) => {

        if (!params.value) {
          return null;
        }

        if (params.value.type === 'multi_day') {
          return null;
        }

        if (params.value.type === 'schedule') {
          if (!params.value.hours) {
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
              }}>{params.value.hours.as_text}</span>
            </div>
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

  const { block, RenderedBlock, handleDragStart, handleMouseMove, handleMouseUp } = useDraggableEventBlock(standardHeight, null, handleUpOnMove, handleUpOnCreate);


  const handleDayTimeClick = (e: MouseEvent) => {
    const RIGHT_CLICK = 2;
    if (e.button === RIGHT_CLICK) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', "Fri", "Sat"];

  if (!Events.events) {
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
          loading={!Events || !Events.events}
          getRowId={row => {
            return row.id();
          }}
          rows={Events.events}
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
            }
          }}
          columnHeaderHeight={48}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 },
            },
          }}
          getRowHeight={() => {
            return 40;
          }}
          disableDensitySelector
          disableColumnSelector
          pageSizeOptions={[50, 100]}
          checkboxSelection
          slots={{
            baseCheckbox: CustomCheckbox,
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

      <DataViewPreview
        previewed={previewed}
        handleCreate={handleCreate}
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
      />


    </div>
  );
};

export default DataView;


const DataViewPreview = ({
  previewed, handleCreate, isPreviewOpen, setIsPreviewOpen
}: {
  previewed: Member | null,
  handleCreate: any,
  isPreviewOpen: boolean,
  setIsPreviewOpen: any
}) => {

  const theme = useTheme();


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
        margin: '1.5rem',
        width: PREVIEW_SIZE,
        height: 'calc(100% - 2rem)',
        display: isPreviewOpen ? 'flex' : 'none'
      }}>
        {previewed && (
          <>

            <div className="column compact" style={{
              position: 'relative'
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
                <Typography variant="h4">{previewed.name}</Typography>
              )}
              <Typography sx={{
                textTransform: 'capitalize'
              }}>{previewed.type}</Typography>

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
            }}>
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