'use client';
import { useEffect, useRef, useState } from 'react';
import dayjs from '@/lib/utils/dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled, useTheme } from '@mui/material/styles';
import { Badge, Button, CircularProgress, IconButton, lighten, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar, DateCalendarProps, PickersCalendarHeader, PickersCalendarHeaderProps } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Dayjs } from 'dayjs';
import { KeyboardArrowDownOutlined, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUpOutlined, SkipNextOutlined, SkipPreviousOutlined } from '@mui/icons-material';
import { UseCalendar } from '@/lib/useCalendar';
import { Member, Event } from '@/schema';
import { isEventCalendar, isMultiDayEvent, isNotScheduled } from '@/lib/CalendarDays';

interface CustomCalendarHeaderProps extends PickersCalendarHeaderProps<Dayjs> {
  Calendar: UseCalendar;
  source: Member;
}

interface CustomPickerDayProps extends PickersDayProps<dayjs.Dayjs> {
  isSelected: boolean;
}

const CustomCalendarHeaderRoot = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 16px',
  alignItems: 'center',
  height: "250px"
});

export function CustomCalendarHeader(props: CustomCalendarHeaderProps) {
  const { currentMonth, onMonthChange, source } = props;
  const theme = useTheme();

  const selectNextMonth = () => {
    const newMonth = currentMonth.add(1, 'month');
    onMonthChange(newMonth, 'left');
    console.log('select next');
  };
  const selectNextYear = () => onMonthChange(currentMonth.add(1, 'year'), 'left');
  const selectPreviousMonth = () => {
    const newMonth = currentMonth.subtract(1, 'month');
    onMonthChange(newMonth, 'right');
    console.log('select prev');
  };
  const selectPreviousYear = () => onMonthChange(currentMonth.subtract(1, 'year'), 'right');

  try {


    return (
      <CustomCalendarHeaderRoot>
        <div className="flex between" style={{ padding: "0 0.5rem" }}>
          <div className='flex compact2 fit'>
            <div className="flex fit snug">
              {source instanceof Event && isMultiDayEvent(source) && (
                <IconButton onClick={() => props.Calendar.goto(source.date)} title="Go to Start">
                  <SkipPreviousOutlined sx={{
                    color: 'var(--text-color)'
                  }} />
                </IconButton>
              )}
              <IconButton onClick={() => selectPreviousMonth()} title="Previous month">
                <KeyboardArrowLeft sx={{
                  color: 'var(--text-color)'
                }} />
              </IconButton>
            </div>
            <Typography onClick={() => props.Calendar.goToStartOfMonth(currentMonth)} variant="h6" sx={{ color: 'var(--text-color)', cursor: "pointer" }}>{currentMonth.format('MMMM YYYY')}</Typography>
            <div className="flex fit snug">
              <IconButton onClick={() => selectNextMonth()} title="Next month">
                <KeyboardArrowRight sx={{
                  color: 'var(--text-color)'
                }} />
              </IconButton>
              {source instanceof Event && isMultiDayEvent(source) && (
                <IconButton onClick={() => props.Calendar.goto(source.end_date)} title="Go to end">
                  <SkipNextOutlined sx={{
                    color: 'var(--text-color)'
                  }} />
                </IconButton>
              )}
            </div>
          </div>
          {source instanceof Event && isMultiDayEvent(source) ? (
            // <div className="flex compact fit">
            //   <Button variant="contained" size="small" onClick={() => props.Calendar.goto(source.date)}
            //     sx={{
            //       padding: "0.2rem 0.45rem",
            //       fontSize: "0.875rem"
            //     }}
            //   >{source.date.format("MM-DD-YYYY")}</Button>
            //   <Button variant="contained" size="small" onClick={() => props.Calendar.goto(source.end_date)}
            //     sx={{
            //       padding: "0.2rem 0.45rem",
            //       fontSize: "0.875rem"
            //     }}
            //   >{source.end_date.format("MM-DD-YYYY")}</Button>
            // </div>
            <></>
          ) : (
            <Button variant="contained" size="small" onClick={() => props.Calendar.gotoToday()} disabled={props.Calendar.isTodayPresent()}
              sx={{
                padding: "0.2rem 0rem",
                fontSize: "0.875rem"
              }}
            >Today</Button>
          )}
        </div>
      </CustomCalendarHeaderRoot>
    );
  }
  catch (err) {
    return (
      <PickersCalendarHeader {...props} />
    )
  }
}




interface StyledPickersDayProps extends PickersDayProps<Dayjs> {
  Calendar: UseCalendar,
  mode?: 'dark' | 'light',
  source: Member;
}


const StyledDay = styled((props: StyledPickersDayProps) => {

  const { Calendar, day, ...rest } = props;

  return (
    <PickersDay
      {...rest}
      key={props.day.toString()}
      day={day}
      disableMargin
    />
  )

})(({ theme, mode, day, Calendar, today, selected, source }) => {

  const base = mode === 'light' ? '#ffffff' : '#000000';
  const isInView = day.isBefore(Calendar.days[0], 'd') || day.isAfter(Calendar.days[Calendar.days.length - 1], 'd') ? false : true;

  const isOpen = source instanceof Event && (!isEventCalendar(source) && !isNotScheduled(source)) ? source.isOpenDetailed(day) : null;

  const determineOpenness = () => {

    if (isOpen?.isOpen) {
      return true;
    }

    return false;
  }

  return ({
    fontSize: "0.85rem",
    fontWeight: '700 !important',
    height: "2.25rem",
    width: "1.5rem",
    opacity: isOpen ? determineOpenness() ? 1 : 0.25 : 1,
    padding: "0.25rem 0.9rem",
    margin: "0.05rem 0rem 0.05rem 0rem",
    color: `${base}`,
    border: `0.25rem solid transparent`,
    borderRadius: '0.25rem',
    ...(isInView && {
      backgroundColor: `${base}10`,
      color: `${base}`,
      '&:hover': {
        backgroundColor: `${base}25`,
      }
    }),
    ...(today && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: `${theme.palette.primary.light} !important`,
      }
    }),
    ...(selected && isInView && {
      backgroundColor: `${base}10 !important`,
      color: `${base} !important`,
      '&:hover': {
        backgroundColor: `${base}25 !important`,
      }
    }),
    '&.MuiPickersDay-dayOutsideMonth': {
      opacity: 0.4
    }
  })
})



interface StyledDateCalendarProps extends DateCalendarProps<Dayjs> {
  Calendar: UseCalendar,
  source: Member,
  mode?: 'dark' | 'light'
}

const StyledWeekPicker = styled((props: StyledDateCalendarProps) => {


  const { mode = 'light', Calendar, source, ...rest } = props;
  const calendarRef = useRef<any>(null);

  if (!Calendar || !Calendar.days) {
    return <CircularProgress />
  }

  return (
    <DateCalendar
      {...rest}
      key={Calendar.days[6].format("YYYYMMDD")}
      ref={calendarRef}
      disableHighlightToday
      value={Calendar.days[6]}
      onChange={(newValue) => Calendar.gotoStartOfWeek(newValue)}
      showDaysOutsideCurrentMonth
      dayOfWeekFormatter={(day) => {
        return day
      }}
      slots={{
        day: props => (
          <StyledDay {...props} Calendar={Calendar} mode={mode} source={source} />
        ),
        calendarHeader: props => (
          <CustomCalendarHeader {...props} Calendar={Calendar} source={source} />
        ),
      }}
    />
  )
})(({ theme, mode = 'light' }) => {
  const base = mode === 'light' ? '#ffffff' : '#000000';
  return ({
    height: "315px !important",
    color: base,
    '& .MuiDayCalendar-root': {
      height: "315px !important",
      color: base,
    },
    '& .MuiDayCalendar-monthContainer': {
      overflow: 'hidden'
    },
    '& .MuiDayCalendar-slideTransition': {
      overflow: 'hidden'
    },
    '& .MuiDayCalendar-weekDayLabel': {
      color: base
    }
  })
})


export default StyledWeekPicker;