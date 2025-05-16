"use client"
import { AppsOutlined, CalendarTodayOutlined, CancelOutlined, HandymanOutlined, ScheduleOutlined } from '@mui/icons-material';
import {
  Button,
  ButtonBase,
  Popover,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from '@/lib/utils/dayjs';
import { EventData, Events, Schedule } from '@/schema';
import Chronos from '@/lib/utils/chronos';
import { CreatorPanelProps } from '@/lib/global/useCreate';
import StyledDatePicker from '../StyledDatePicker';
import StyledTimePicker from '../TimePicker';
import { useEffect, useState } from 'react';
import HoursMinimap from '../HoursMinimap';
import StyledIconButton from '../StyledIconButton';



interface DateTimeAccordionModuleProps {
  item: (EventData & CreatorPanelProps) | null;
  handleChange: any;
  expanded: any;
  onChange: any;
  handleMultiChange: any;
  switchToSchedule: any;
  variables: any;
  props?: any;
}

export default function DateTimeAccordionModule({
  item,
  handleChange,
  expanded,
  onChange,
  handleMultiChange,
  switchToSchedule,
  variables,
  ...props
}: DateTimeAccordionModuleProps) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isScheduleOpen = Boolean(anchorEl);
  const [schedule, setSchedule] = useState<Schedule | null>(new Schedule());

  const isTimeless = item ? !item.start_time && !item.date && !item.end_date && !item.end_time : true;

  useEffect(() => {
    if (item && (item.schedules && item.schedules.length > 0)) {
      setSchedule(new Schedule(item.schedules[0]));
    }
  }, []);

  if (!item) {
    return <></>
  }

  if ((schedule && item.schedules) && item.schedules.length > 0) {
    return (
      <div className="flex between top">
        <div className="column left" style={{
          width: "25rem",
        }}>
          {schedule && (
            <HoursMinimap
              mode="dark"
              schedule={schedule}
              onChange={(newSch) => setSchedule(newSch)}
            />
          )}
        </div>
        <div className="flex snug fit">
          <StyledIconButton
            title="Use Variables"
            onClick={(e: any) => {
              return;
            }}
          >
            <HandymanOutlined sx={{
              fontSize: "1.25rem",
            }} />
          </StyledIconButton>
          <StyledIconButton
            title="Remove Scheduling"
            onClick={() => {
              handleMultiChange({
                date: dayjs(),
                start_time: null,
                end_time: null,
                end_date: null,
                schedules: null
              })
            }}
          >
            <CancelOutlined sx={{
              fontSize: "1.25rem"
            }} />
          </StyledIconButton>
        </div>
      </div>
    )
  }

  return (
    <div className="column left" style={{
      padding: '0.5rem 0'
    }}>

      <div className="flex left top">
        <div className="column left compact" style={{
          width: "100%"
        }}>
          {!(isTimeless) && (
            <div className="flex between">
              <div className="flex compact fit">
                <StyledDatePicker
                  value={item.date ? dayjs(String(item.date)) : null}
                  onChange={(date) => handleChange("date", date)}
                  mode={'dark'}
                  label={'Date'}
                  key="event_startDate"
                  sx={{
                    width: '11rem'
                  }}
                />

                {item.end_date ? (
                  <StyledDatePicker
                    value={item.end_date ? dayjs(String(item.end_date)) : null}
                    onChange={(date) => handleChange("end_date", date)}
                    mode={'dark'}
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
                      mode={'dark'}
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

                    <StyledTimePicker
                      // debug
                      format='h:mm A'
                      mode={'dark'}
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
              <div className="flex fit snug">
                <StyledIconButton
                  title="Use Variables"
                  onClick={(e: any) => {
                    return;
                  }}
                >
                  <HandymanOutlined sx={{
                    fontSize: "1.25rem",
                  }} />
                </StyledIconButton>
                <StyledIconButton
                  title="Remove Date/Time"
                  onClick={() => {
                    handleMultiChange({
                      date: null,
                      start_time: null,
                      end_time: null,
                      end_date: null
                    })
                  }}
                >
                  <CancelOutlined sx={{
                    fontSize: "1.25rem"
                  }} />
                </StyledIconButton>
              </div>
            </div>
          )}
          {isTimeless ? (
            <ButtonBase disableRipple key="add_date_time" className="flex middle compact fit" sx={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.25rem"
            }}>
              <ScheduleOutlined sx={{
                fontSize: "1rem"
              }} />
              <div className="flex snug fit"
                onClick={(e) => {
                  handleMultiChange({
                    date: dayjs(),
                    start_time: null,
                    end_time: null
                  })
                }}
              >
                <Typography sx={{
                  whiteSpace: "no-wrap",
                  fontSize: "1rem",
                  textTransform: 'capitalize',
                  fontWeight: 600
                }}>Add Date/Time</Typography>
              </div>
            </ButtonBase>
          ) : (
            <div className="flex compact2">
              <ButtonBase disableRipple key="add_schedule" className="flex middle compact fit" sx={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.25rem"
              }}>
                <AppsOutlined sx={{
                  color: 'var(--text-color)',
                  fontSize: "1rem"
                }} />
                <div className="flex snug fit"
                  onClick={(e) => {
                    const target = e.currentTarget || e.target;
                    setAnchorEl(target)
                  }}
                >
                  <Typography sx={{
                    whiteSpace: "no-wrap",
                    width: 'fit-content',
                    fontSize: "1rem",
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}>Build Schedule</Typography>
                </div>
              </ButtonBase>
              {item.end_date ? (
                <ButtonBase disableRipple key="add_time" className="flex middle compact fit" sx={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.25rem"
                }}>
                  <ScheduleOutlined sx={{
                    fontSize: "1rem"
                  }} />
                  <div className="flex snug fit"
                    onClick={(e) => {
                      handleMultiChange({
                        end_date: null,
                      })
                    }}
                  >
                    <Typography sx={{
                      whiteSpace: "no-wrap",
                      width: 'fit-content',
                      fontSize: "1rem",
                      textTransform: 'capitalize',
                      fontWeight: 600
                    }}>Add Time</Typography>
                  </div>
                </ButtonBase>
              ) : (
                <ButtonBase disableRipple key="all_day" className="flex middle compact fit" sx={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.25rem"
                }}>
                  <CalendarTodayOutlined sx={{
                    fontSize: "1rem"
                  }} />
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
                      whiteSpace: "no-wrap",
                      fontSize: "1rem",
                      textTransform: 'capitalize',
                      fontWeight: 600
                    }}>All Day</Typography>
                  </div>
                </ButtonBase>
              )}

            </div>
          )}
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
          <div
            className='column compact'
            style={{
              width: "29rem",
              padding: '1rem 2rem'
            }}>
            {schedule && (
              <HoursMinimap
                mode="dark"
                schedule={schedule}
                onChange={(newSch) => setSchedule(newSch)}
              />
            )}
            <div className="flex right">
              <Button
                variant="contained"
                onClick={() => {
                  setAnchorEl(null);
                  handleMultiChange({
                    schedules: [schedule]
                  })
                }}
              >Save</Button>
            </div>
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