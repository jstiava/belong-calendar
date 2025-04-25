
import {
  Add,
  ScheduleOutlined,
  TimerOutlined,
} from '@mui/icons-material';
import { v4 as uuidv4 } from "uuid";
import {
  AccordionDetails,
  Button,
  useTheme,
} from '@mui/material';
import AccordionCreateModule, {
  AccordionSummaryCreateModule,
} from '@/components/accordions/AccordionCreateModule';
import { EventData, Schedule, ScheduleData, Event } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { CreatorPanelProps, StartCreator } from '@/lib/global/useCreate';
import ScheduleEditCard from '../ScheduleEditCard';
import { SearchDialogConfig } from '@/lib/useSearchDialog';
import HoursMinimap from '../HoursMinimap';
import dayjs from '@/lib/utils/dayjs';
import ScheduleCalendarPreview from '../calendar/ScheduleCalendarPreview';

interface ScheduleManagerAccordionModuleProps {
  item: EventData & CreatorPanelProps;
  handleChange: any;
  handleSelection: (item: any) => void;
  removeSelection: (query: string) => void;
  startCreator: StartCreator;
  expanded: any;
  onChange: any;
  switchToDateTime?: any;
  props?: any;
}

export default function ScheduleManagerAccordionModule({
  item,
  handleChange,
  handleSelection,
  removeSelection,
  startCreator,
  expanded,
  onChange,
  switchToDateTime,
  ...props
}: ScheduleManagerAccordionModuleProps) {
  const theme = useTheme();

  const handleEditSchedule = (item: ScheduleData) => {
    startCreator(Type.Schedule, Mode.Modify, new Schedule(item, true), {
      callback: (item: any) => handleSelection(item),
      connected: true
    })
  }

  const handleCreate = () => {

    if (item.schedules && item.schedules.length > 0) {

      const regularSchedule = new Event(item).getRegularHours();

      if (regularSchedule) {
        startCreator(Type.Schedule, Mode.Create, new Schedule({
          ...regularSchedule.eject(),
          uuid: String(uuidv4()),
          name: "Special Hours",
          start_date: dayjs().yyyymmdd(),
          end_date: dayjs().yyyymmdd(),
          schedule_type: "special",
        }, true), {
          callback: (item: any) => handleSelection(item),
          connected: true
        })
        return;
      }
      startCreator(Type.Schedule, Mode.Create, new Schedule({
        name: "Special Hours",
        schedule_type: "special",
      }, true), {
        callback: (item: any) => handleSelection(item),
        connected: true
      });
      return;
    }
    startCreator(Type.Schedule, Mode.Create, new Schedule({
      name: "Regular Hours",
      schedule_type: "regular",
    }, true), {
      callback: (item: any) => handleSelection(item),
      connected: true
    });
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | boolean) => {
    handleChange('is_group', newValue === 'group')
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const regular = new Event(item).getRegularHours();

  return (
    <AccordionCreateModule expanded={expanded} onChange={onChange}>
      <AccordionSummaryCreateModule
        name={item.schedules && item.schedules[0] ? `${item.schedules[0].as_text}` : "Schedules"}
        expanded={expanded}
        icon={<ScheduleOutlined />}
        preview={<></>}
      />
      <AccordionDetails>
        <div className='column'>
          <>
            {item.schedules && item.schedules.length > 0 ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <div className="flex top" >
                      <div className="flex column " style={{ width: "50%" }}>

                        <div className="column" style={{ width: "100%" }}>
                          {item.schedules.map((sch: ScheduleData) => (
                            <ScheduleEditCard key={sch.uuid} item={sch} onRemove={removeSelection} onEdit={handleEditSchedule} />
                          ))}
                          <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleCreate()}
                          >
                            Create New Schedule
                          </Button>
                        </div>
                      </div>
                      <div className="flex column" style={{ width: "50%", height: "fit-content" }}>
                        {item.schedules && item.schedules.length === 0 && !regular.isNotRegular() ? (
                          <HoursMinimap compact schedule={regular} start_date={dayjs(String(regular.start_date))} end_date={regular.end_date ? dayjs(String(regular.end_date)) : null} />
                        ) : (
                          <ScheduleCalendarPreview item={new Event(item)} onSelect={handleCreate} />
                        )}
                      </div>
                    </div>
                    <div
                      className="column compact"
                      style={{
                        justifyContent: 'flex-end',
                        marginTop: '1rem',
                      }}
                    >
                      <div
                        className="flex"
                        style={{
                          justifyContent: 'flex-end',
                          marginTop: '1rem',
                        }}
                      >
                        <Button
                          startIcon={<TimerOutlined />}
                          onClick={switchToDateTime}
                        >
                          Switch to Date & Time
                        </Button>

                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='column compact'>
                <div
                  className="flex"
                  style={{
                    justifyContent: 'flex-end',
                    marginTop: '1rem',
                  }}
                >
                  <Button
                    startIcon={<TimerOutlined />}
                    onClick={switchToDateTime}
                  >
                    Switch to Date & Time
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleCreate()}
                  >
                    Create New Schedule
                  </Button>
                </div>
              </div>
            )}
          </>
        </div>
      </AccordionDetails>
    </AccordionCreateModule >
  );
}
