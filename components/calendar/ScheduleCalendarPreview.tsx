'use client';
import { MouseEventHandler, useEffect, useState } from 'react';
import dayjs from '@/lib/utils/dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Badge, Button, IconButton, lighten, Popover, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar, PickersCalendarHeader, PickersCalendarHeaderProps } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Dayjs } from 'dayjs';
import { ArrowUpwardOutlined, ChevronLeft, ChevronRight, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { UseCalendar } from '@/lib/useCalendar';
import { UseSession } from '@/lib/global/useSession';
import { UseBase } from '@/lib/global/useBase';
import { NodeNextRequest } from 'next/dist/server/base-http/node';
import { overflow } from 'html2canvas/dist/types/css/property-descriptors/overflow';
import { EventData, Event, Schedule, ScheduleData, Member } from '@/schema';
import DayView from './DayView';
import { CustomCalendarHeader } from './WeekPicker';
import { adjustForContrast, Type } from '@/types/globals';
import { Hours } from '@/lib/utils/medici';
import useViewEvent from '@/lib/events/useViewEvent';
import { UseEvents } from '@/lib/global/useEvents';
import { StartCreator } from '@/lib/global/useCreate';
import { StartViewer } from '@/lib/global/useView';

interface CustomPickerDayProps extends PickersDayProps<dayjs.Dayjs> {
  schedule: Schedule | null,
  hours: Hours | boolean | null,
  item: Member,
}


const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: prop => prop !== 'schedule',
})<CustomPickerDayProps>(({ theme, schedule, hours, item, day }) => ({
  // fontSize: "0.65rem",
  // height: "1.75rem",
  // ...(isBetween && {
  //   backgroundColor: `${alpha(theme.palette.primary.main, 0.25)} !important`,
  // }),
  borderRadius: "0.1rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  height: "1.75rem",
  width: "1rem",
  padding: "0.25rem 0.5rem",

  ...(schedule && (hours instanceof Hours || (typeof hours === 'boolean' && hours != false)) && {
    backgroundColor: schedule.schedule_type === 'regular' ? item.theme_color ? adjustForContrast(item.theme_color, 0.65) : theme.palette.primary.main : schedule.schedule_type === "special" ? "gold" : "red",
    color: schedule.schedule_type === 'regular' ? theme.palette.text.primary : schedule.schedule_type === "special" ? "black" : theme.palette.text.primary,
    border: "2px solid transparent",
    // borderColor: schedule.schedule_type === 'regular' ? item.theme_color || theme.palette.primary.main : schedule.schedule_type === "special" ? "gold" : "red",
    '&:hover': {
      // backgroundColor: schedule.schedule_type === 'regular' ? "lightBlue" : schedule.schedule_type === "special" ? "gold" : "red",
      borderColor: schedule.schedule_type === 'regular' ? item.theme_color || theme.palette.primary.main : schedule.schedule_type === "special" ? "gold" : "red",
      color: theme.palette.text.primary,
    },
  }),
})) as React.ComponentType<CustomPickerDayProps>;

function Day(
  props: PickersDayProps<Dayjs> & {
    item: Event;
    onContextMenu: StartViewer;
    onMouseDown?: (day: Dayjs) => void;
    onMouseUp?: (day: Dayjs) => void;
  },
) {
  const theme = useTheme();

  const { day, item, onMouseDown, onMouseUp, onContextMenu, ...other } = props;
  const [context, setContext] = useState<ReturnType<typeof item.isOpenDetailed> | null>(null);

  useEffect(() => {
    const theContext = item.isOpenDetailed(day);

    if (!theContext) {
      return;
    }

    setContext(theContext)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  if (!context) {
    return (
      <CustomPickersDay
        {...other}
        key={props.day.toString()}
        item={item}
        schedule={null}
        hours={null}
        day={day}
        selected={false}
        disableMargin
        sx={{ px: 2.5 }}
        onMouseDown={() => onMouseDown(day)}
        onMouseUp={() => onMouseUp(day)}
      />
    )
  }

  return (
    <>
      <CustomPickersDay
        {...other}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(Type.Event, item, { e, date: day, isRightClick: true })
        }}
        key={day.toString()}
        item={item}
        schedule={context.schedule}
        hours={context.hours}
        day={day}
        selected={false}
        disableMargin
        sx={{ px: 2.5 }}
        onMouseDown={() => onMouseDown(day)}
        onMouseUp={() => onMouseUp(day)}
      />
    </>
  );
}

export default function ScheduleCalendarPreview({
  item,
  onSelect,
}: {
  item: Event
  onSelect: (value: Object) => any,
}) {

  const theme = useTheme();

  const [isSelected, setIsSelected] = useState<Dayjs | null>(null);

  const onMouseDown = (day: Dayjs) => {
    setIsSelected(day);
    return;
  }

  const onMouseUp = (day: Dayjs) => {
    if (!isSelected) {
      console.log("No selected")
      return;
    }

    const start = isSelected;
    setIsSelected(null);

    if (start.isSame(day, 'date')) {
      console.log("Click, no drag")
      onSelect({ date: day, end_date: day })
      return;
    }

    if (start.isAfter(day, 'date')) {
      onSelect({
        date: day,
        end_date: start
      })
      return;
    }

    onSelect({
      date: start,
      end_date: day
    })


    return;
  }

  if (!item) {
    return null;
  }

  return (
    <>
      <DateCalendar

        sx={{
          height: "300px !important",
          '& .MuiDayCalendar-root': {
            height: "300px !important",
          },
          '& .MuiDayCalendar-monthContainer': {
            overflow: 'hidden'
          },
          '& .MuiDayCalendar-slideTransition': {
            overflow: 'hidden'
          }
        }}
        disableHighlightToday
        value={item.date ? dayjs(String(item.date)) : null}
        showDaysOutsideCurrentMonth
        slots={{
          day: Day,
        }}
        slotProps={{
          day: ownerState =>
          ({
            item,
            onMouseDown,
            onMouseUp,
          } as any),
        }}
      />
    </>
  );
}
