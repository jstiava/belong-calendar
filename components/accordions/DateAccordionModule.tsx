import { AccessTime, CalendarMonthOutlined } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
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
import { Events as EventsService, ScheduleData, Chronos, dayjs } from '@jstiava/chronos';
import { CreatorPanelProps } from '@/lib/global/useCreate';

interface DateAccordionModuleProps {
  item: (ScheduleData & CreatorPanelProps) | null;
  handleChange: any;
  expanded: any;
  onChange: any;
  props?: any;
}

export default function DateTimeAccordionModule({
  item,
  handleChange,
  expanded,
  onChange,
  ...props
}: DateAccordionModuleProps) {
  const theme = useTheme();

  if (!item) {
    return <></>
  }

  return (
    <AccordionCreateModule expanded={expanded} onChange={onChange}>
      <AccordionSummaryCreateModule
        name={item.start_date && item.end_date ? `${dayjs(String(item.start_date)).format("MMM DD")} - ${dayjs(String(item.end_date)).format("MMM DD, YYYY")}` : item.start_date ? `Starting on ${dayjs(String(item.start_date)).format("MMM DD, YYYY")}` : "No preview"}
        expanded={expanded}
        icon={<CalendarMonthOutlined />}
        aria-controls="panel1-content"
        id="panel1-header"
        preview={
          <></>
        }
      />
      <AccordionDetailsCreateModule>
        <div className="column compact">

          <div className="flex between" style={{ alignItems: "flex-start" }}>
            <FormControl fullWidth sx={{ width: "calc(50% - 0.5rem)" }}>
              <DatePicker
                format="dddd, MMM D, YYYY"
                value={item.start_date && dayjs(String(item.start_date))}
                onChange={date => {
                  console.log(date);
                  if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
                    console.error('Invalid date selected:', date);
                    return;
                  }
                  handleChange("start_date", date?.yyyymmdd());
                }}
                label={'Start Date'}
                key="event_startDate"
                slotProps={{
                  textField: {
                    variant: 'filled',
                  },
                }}
              />
            </FormControl>
            <div className="column compact" style={{ width: "calc(50% - 0.5rem)" }}>
              <FormControl fullWidth >
                <DatePicker
                  format="dddd, MMM D, YYYY"
                  value={item.end_date && dayjs(String(item.end_date))}
                  onChange={(date) => {
                    console.log(date);
                    if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
                      console.error('Invalid date selected:', date);
                      return;
                    }
                    handleChange("end_date", date.yyyymmdd())
                  }}
                  label={'End Date'}
                  key="event_endDate"
                  slotProps={{
                    textField: {
                      variant: 'filled',
                    },
                  }}
                />
              </FormControl>
              <FormControlLabel control={<Checkbox checked={item.end_date ? false : true} onChange={(e, checked) => {
                if (checked) {
                  handleChange("end_date", null);
                }
                else {
                  handleChange("end_date", item.start_date)
                }
              }} />} label="No end date" />
            </div>
          </div>
        </div>
      </AccordionDetailsCreateModule>
    </AccordionCreateModule>
  );
}      
