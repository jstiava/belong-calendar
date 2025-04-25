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
import { KeyboardArrowDownOutlined, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { UseCalendar } from '@/lib/useCalendar';

interface CustomCalendarHeaderProps extends PickersCalendarHeaderProps<Dayjs> {
  Calendar: UseCalendar;
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
  const { currentMonth, onMonthChange } = props;
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
            <IconButton onClick={() => selectPreviousMonth()} title="Previous month">
              <KeyboardArrowLeft sx={{
                color: 'var(--text-color)'
              }} />
            </IconButton>
            <Typography onClick={() => props.Calendar.goToStartOfMonth(currentMonth)} variant="h6" sx={{ color: 'var(--text-color)', cursor: "pointer" }}>{currentMonth.format('MMMM YYYY')}</Typography>
            <IconButton onClick={() => selectNextMonth()} title="Next month">
              <KeyboardArrowRight sx={{
                color: 'var(--text-color)'
              }} />
            </IconButton>
          </div>
          <Button variant="invert" size="small" onClick={() => props.Calendar.gotoToday()} disabled={props.Calendar.isTodayPresent()}>Today</Button>
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

})(({ theme, mode, day, Calendar, today, selected }) => {

  const base = mode === 'light' ? '#ffffff' : '#000000';
  const isInView = day.isBefore(Calendar.days[0], 'd') || day.isAfter(Calendar.days[Calendar.days.length - 1], 'd') ? false : true;

  return ({
    fontSize: "0.85rem",
    fontWeight: '700 !important',
    height: "2.25rem",
    width: "1.5rem",
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
  mode?: 'dark' | 'light'
}

const StyledWeekPicker = styled((props: StyledDateCalendarProps) => {


  const { mode = 'light', Calendar, ...rest } = props;
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
          <StyledDay {...props} Calendar={Calendar} mode={mode} />
        ),
        calendarHeader: props => (
          <CustomCalendarHeader {...props} Calendar={Calendar} />
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