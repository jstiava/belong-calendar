import { AccessTime, AddOutlined, AppsOutlined, CalendarMonthOutlined, CalendarTodayOutlined, CalendarViewDay, Lock, PunchClockOutlined, ScheduleOutlined, TimerOutlined, TodayOutlined, WeekendOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DateCalendar, DatePicker, PickersActionBar, TimePicker, TimePickerProps, renderTimeViewClock } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import AccordionCreateModule, {
  AccordionSummaryCreateModule,
  AccordionDetailsCreateModule,
} from '@/components/accordions/AccordionCreateModule';
import dayjs from '@/lib/utils/dayjs';
import { EventData, Events, Events as EventsService, Schedule } from '@/schema';
import Chronos from '@/lib/utils/chronos';
import { CreatorPanelProps } from '@/lib/global/useCreate';
import RangePicker from '../calendar/RangePicker';
import StyledDatePicker from '../StyledDatePicker';
import StyledTimePicker from '../TimePicker';
import { useState } from 'react';
import HoursMinimap from '../HoursMinimap';



interface DateTimeAccordionModuleProps {
  item: (EventData & CreatorPanelProps) | null;
  handleChange: any;
  expanded: any;
  onChange: any;
  handleMultiChange: any;
  switchToSchedule: any;
  props?: any;
}

export default function DateTimeAccordionModule({
  item,
  handleChange,
  expanded,
  onChange,
  handleMultiChange,
  switchToSchedule,
  ...props
}: DateTimeAccordionModuleProps) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isScheduleOpen = Boolean(anchorEl);
  const [schedule, setSchedule] = useState<Schedule | null>(new Schedule());

  if (!item) {
    return <></>
  }

  return (
    <div className="column left" style={{
      padding: '0.5rem 0'
    }}>

      <div className="flex left top">
        <div className="column left compact fit">
          <div className="flex compact fit">
            <StyledDatePicker
              value={item.date ? dayjs(String(item.date)) : dayjs()}
              onChange={(date) => handleChange("date", date)}
              mode={item.theme_color ? theme.palette.getContrastText(item.theme_color) == "#fff" ? 'light' : 'dark' : 'dark'}
              label={'Date'}
              key="event_startDate"
              sx={{
                width: '11rem'
              }}
            />

            {item.end_date ? (
              <StyledDatePicker
                value={item.end_date ? dayjs(String(item.end_date)) : dayjs()}
                onChange={(date) => handleChange("end_date", date)}
                mode={item.theme_color ? theme.palette.getContrastText(item.theme_color) == "#fff" ? 'light' : 'dark' : 'dark'}
                label={'Date'}
                key="event_endDate"
                sx={{
                  width: '11rem'
                }}
              />
            ) : (
              <div className="flex compact fit">
                <StyledTimePicker
                  // debug
                  format='h:mm A'
                  mode={item.theme_color ? theme.palette.getContrastText(item.theme_color) === '#fff' ? 'light' : 'dark' : 'dark'}
                  label={'Start'}
                  value={item.start_time ? Events.dayjs(item.date || dayjs().yyyymmdd(), new Chronos(Number(item.start_time))) : null}
                  onChange={(date) => {
                    const value = date?.toLocalChronos().getHMN();
                    if (!value) {
                      return;
                    }

                    if (!item.end_time) {
                      handleMultiChange({
                        start_time: value,
                        end_time: value + 1
                      });
                      return;
                    }
                    handleChange("start_time", value)
                  }}
                  sx={{
                    width: "7.5rem"
                  }}
                />
                <div className="column snug fit center" style={{
                  position: 'relative',
                  width: "2rem"
                }}>
                  <div style={{
                    position: 'absolute',
                    width: "3rem",
                    height: "2px",
                    backgroundColor: 'var(--text-color)',
                    opacity: 0.75,
                    top: "1rem",
                    left: "-0.5rem",
                  }}></div>
                  <IconButton sx={{
                    color: `var(--text-color)`,
                    backgroundColor: `var(--bg-color)`,
                    '&:hover': {
                      backgroundColor: `var(--bg-color)`
                    }
                  }} >
                    <Lock
                      sx={{
                        fontSize: "0.9rem",
                      }} />
                  </IconButton>
                  <Typography variant="caption" sx={{
                    marginTop: "-0.5rem",
                    zIndex: 1,
                    width: "fit-content",
                    textAlign: 'center',
                    whiteSpace: "nowrap"
                  }}>{item.start_time && item.end_time ?
                    Events.dayjs(
                      Number(item.end_time) < Number(item.start_time) ? Number(item.date || dayjs().yyyymmdd()) + 1 : item.date || dayjs().yyyymmdd(),
                      new Chronos(Number(item.end_time))
                    )
                      .duration(
                        Events.dayjs(item.date || dayjs().yyyymmdd(), new Chronos(Number(item.start_time), true))
                      ) : ""}
                  </Typography>
                </div>
                <StyledTimePicker
                  // debug
                  format='h:mm A'
                  mode={item.theme_color ? theme.palette.getContrastText(item.theme_color) === '#fff' ? 'light' : 'dark' : 'dark'}
                  label={'End'}
                  value={item.end_time ? Events.dayjs(Number(item.end_time) < Number(item.start_time) ? Number(item.date) + 1 : item.date || dayjs().yyyymmdd(), new Chronos(Number(item.end_time))) : null}
                  onChange={(date) => handleChange("end_time", date?.toLocalChronos().getHMN())}
                  sx={{
                    width: "7.5rem"
                  }}
                // shouldDisableTime={shouldDisableTime}
                />
              </div>
            )}
          </div>
          <div className="flex compact2">
            <ButtonBase key="add_schedule" className="flex middle compact fit" sx={{
              padding: "0.5rem 0.75rem",
               borderRadius: "0.25rem"
            }}>
              <AppsOutlined sx={{
                color: 'var(--text-color)'
              }} />
              <div className="flex snug fit"
                onClick={(e) => {
                  const target = e.currentTarget || e.target;
                  setAnchorEl(target)
                }}
              >
                <Typography sx={{
                  whiteSpace: "no-wrap",
                  width: 'fit-content'
                }}>Build Schedule</Typography>
              </div>
            </ButtonBase>
            {item.end_date ? (
              <ButtonBase key="add_time" className="flex middle compact fit" sx={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.25rem"
              }}>
                <ScheduleOutlined />
                <div className="flex snug fit"
                  onClick={(e) => {
                    handleMultiChange({
                      end_date: null,
                    })
                  }}
                >
                  <Typography sx={{
                    whiteSpace: "no-wrap",
                    width: 'fit-content'
                  }}>Add Time</Typography>
                </div>
              </ButtonBase>
            ) : (
              <ButtonBase key="all_day" className="flex middle compact fit" sx={{
                padding: "0.5rem 0.75rem",
                 borderRadius: "0.25rem"
              }}>
                <CalendarTodayOutlined />
                <div className="flex snug fit"
                  onClick={(e) => {
                    handleMultiChange({
                      end_date: item.date,
                      start_time: null,
                      end_time: null
                    })
                  }}
                >
                  <Typography sx={{
                    whiteSpace: "no-wrap"
                  }}>All Day</Typography>
                </div>
              </ButtonBase>
            )}
          </div>
        </div>

        <Popover
          anchorEl={anchorEl}
          open={isScheduleOpen}
          // placement='left-start'
          onClose={(e: any) => {
            e.stopPropagation();
            setAnchorEl(null)
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
          <div style={{
            width: "29rem",
            padding: '1rem 2rem'
          }}>
            {schedule && (
              <HoursMinimap
                mode="dark"
                schedule={schedule}
                start_date={item.date ? dayjs(item.date) : null}
                end_date={item.end_date ? dayjs(item.end_date) : null}
                onChange={(newSch) => setSchedule(newSch)}
              />
            )}
          </div>
        </Popover>
      </div>

      {/* <Typography>{JSON.stringify({
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time
      })}</Typography> */}
    </div>
  )

}