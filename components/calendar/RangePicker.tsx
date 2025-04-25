'use client';
import { useState } from 'react';
import dayjs from '@/lib/utils/dayjs';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { DateCalendar, PickersCalendarHeader, PickersCalendarHeaderProps } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Dayjs } from 'dayjs';
import { EventData } from '@/schema';
import { UseCalendar } from '@/lib/useCalendar';
import { KeyboardArrowUpOutlined, KeyboardArrowDownOutlined } from '@mui/icons-material';
import { IconButton, Typography, Button } from '@mui/material';

interface CustomCalendarHeaderProps extends PickersCalendarHeaderProps<Dayjs> {
  Calendar?: UseCalendar;
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
          <div style={{ display: 'flex', alignItems: "center" }}>
            <IconButton onClick={() => selectPreviousMonth()} title="Previous month">
              <KeyboardArrowUpOutlined />
            </IconButton>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, cursor: "pointer" }}>{currentMonth.format('MMMM YYYY')}</Typography>
            <IconButton onClick={() => selectNextMonth()} title="Next month">
              <KeyboardArrowDownOutlined />
            </IconButton>
          </div>
          {/* <Button variant="contained" size="small" >Today</Button> */}
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

interface CustomPickerDayProps extends PickersDayProps<dayjs.Dayjs> {
  isSelected: boolean;
  isBetween: boolean;
}


const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: prop => prop !== 'isSelected' && prop !== 'isBetween',
})<CustomPickerDayProps>(({ theme, isSelected, isBetween, day }) => ({
  // fontSize: "0.65rem",
  borderRadius: "0.1rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  height: "2rem",
  width: "2rem",
  padding: 0,
  margin: "0.05rem 0.15rem",
  border: "none",
  ...(isBetween && {
    backgroundColor: `${alpha(theme.palette.primary.main, 0.25)} !important`,
  }),
  ...(isSelected && {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.primary.contrastText,
  }),
})) as React.ComponentType<CustomPickerDayProps>;

function Day(
  props: PickersDayProps<Dayjs> & {
    date?: Dayjs | null;
    end_date?: Dayjs | null;
    onMouseDown?: (day: Dayjs) => void;
    onMouseUp?: (day: Dayjs) => void;
  },
) {
  const theme = useTheme();
  const { day, date, end_date, onMouseDown, onMouseUp, ...other } = props;

  const isSelected = date ? day.isSame(date, 'd') ? true : end_date ? day.isSame(end_date, 'd') : false : false;

  return (
    <CustomPickersDay
      key={props.day.toString()}
      {...other}
      sx={{
        cursor: isSelected ? ["move", "grab", "-moz-grab", "-webkit-grab"] : "pointer",
      }}
      day={day}
      selected={false}
      isSelected={isSelected}
      isBetween={date && end_date ? day.isAfter(date, 'date') && day.isBefore(end_date, 'date') : false}
      onMouseDown={() => onMouseDown(day)}
      onMouseUp={() => onMouseUp(day)}
      onClick={undefined}
    />
  );
}

export default function RangePicker({
  item,
  onChange,
}: {
  item: EventData
  onChange: (value: Object) => any,
}) {

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

    setIsSelected(null);

    if (isSelected.isSame(day, 'date')) {


      console.log("Click, no drag")
      if (day.isBefore(dayjs(String(item.date)))) {
        onChange({ date: day })
        return;
      }

      if (!item.end_date) {
        onChange({ date: day })
        return;
      }
      onChange({ end_date: day })
      return;
    }

    // Start
    if (isSelected.isSame(dayjs(String(item.date)), 'date')) {
      console.log("Move start date")
      // If no end_date, move start_date
      if (!item.end_date) {
        onChange({
          date: day
        });
        return;
      }

      // If date after end_date, have to move end_date as well
      if (day.isAfter(dayjs(String(item.end_date)), 'date')) {
        onChange({
          date: item.end_date,
          end_date: day
        })
        return;
      }

      onChange({
        date: day
      })
      return;
    }

    // End
    if (item.end_date && isSelected.isSame(dayjs(String(item.end_date)), 'date')) {
      console.log("Move end_date");
      if (day.isBefore(dayjs(String(item.date)), 'date')) {
        onChange({
          date: day,
          end_date: item.date
        })
        return;
      }
      onChange({
        end_date: day
      })
    }

    return;
  }

  return (
    <DateCalendar
      sx={{
        height: "315px !important",
        '& .MuiDayCalendar-root': {
          height: "315px !important",
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
      onChange={null}
      showDaysOutsideCurrentMonth
      slots={{
        day: Day,
        calendarHeader: props => <CustomCalendarHeader {...props} Calendar={null} />
      }}
      slotProps={{
        day: ownerState =>
        ({
          date: item.date ? dayjs(String(item.date)) : null,
          end_date: item.end_date ? dayjs(String(item.end_date)) : null,
          onMouseDown,
          onMouseUp
        } as any),
      }}
    />
  );
}
