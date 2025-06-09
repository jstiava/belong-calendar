import { AccessTime, CalendarViewWeekOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DatePicker, TimePicker, TimePickerProps, renderTimeViewClock } from '@mui/x-date-pickers';

import AccordionCreateModule, {
  AccordionSummaryCreateModule,
  AccordionDetailsCreateModule,
} from '@/components/accordions/AccordionCreateModule';
import { EventData, Events as EventsService, dayjs, Chronos, Dayjs } from '@jstiava/chronos';

import { CreatorPanelProps } from '@/lib/global/useCreate';

interface DateRangeAccordionModuleProps {
  item: (EventData & CreatorPanelProps) | null;
  handleChange: any;
  expanded: any;
  onChange: any;
  props?: any;
}

export default function DateRangeAccordionModule({
  item,
  handleChange,
  expanded,
  onChange,
  ...props
}: DateRangeAccordionModuleProps) {
  const theme = useTheme();

  if (!item) {
    return <></>
  }

  return (
    <AccordionCreateModule expanded={expanded} onChange={onChange}>
      <AccordionSummaryCreateModule
        name={item.date ? item.end_date ? dayjs(String(item.date)).to(dayjs(String(item.end_date))) : dayjs(String(item.date)).format("MMM D, YYYY") : "Date Range"}
        expanded={expanded}
        icon={<CalendarViewWeekOutlined />}
        aria-controls="panel1-content"
        id="panel1-header"
        preview={
          <></>
        }
      />
      <AccordionDetailsCreateModule>
        <div className="flex">

          <FormControl fullWidth >
            <DatePicker
              format="dddd, MMM D, YYYY"
              value={dayjs(String(item.date))}
              onChange={date => {
                console.log(date);
                if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
                  console.error('Invalid date selected:', date);
                  return;
                }
                handleChange("date", Number(date?.yyyymmdd()))
              }}
              label={'Start Date'}
              key="event_startDate"
              disablePast
              slotProps={{
                textField: {
                  variant: 'filled',
                },
              }}
            />
          </FormControl>
          <FormControl fullWidth >
            <DatePicker
              format="dddd, MMM D, YYYY"
              value={dayjs(String(item.end_date))}
              onChange={date => {
                console.log(date);
                if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
                  console.error('Invalid date selected:', date);
                  return;
                }
                handleChange("end_date", Number(date.yyyymmdd()))
              }}
              label={'End Date'}
              key="event_endDate"
              disablePast
              slotProps={{
                textField: {
                  variant: 'filled',
                },
              }}
            />
          </FormControl>

        </div>
      </AccordionDetailsCreateModule>
    </AccordionCreateModule>
  );
}      
