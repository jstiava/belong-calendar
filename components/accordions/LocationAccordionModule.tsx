
import {
  AccessTime,
  Add,
  AddLocation,
  AddLocationOutlined,
  ChevronRightOutlined,
  ExpandMore as ExpandMoreIcon,
  ForkRight,
  Forward,
  ForwardOutlined,
  LocationOnOutlined,
  OpenInNew,
  RemoveCircleOutline,
  RemoveOutlined,
  SearchOutlined,
  VerifiedOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { v4 as uuidv4 } from "uuid";
import {
  AccordionDetails,
  Button,
  Tooltip,
  Typography,
  useTheme,
  lighten,
  IconButton,
  ButtonBase,
} from '@mui/material';
import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import AccordionCreateModule, {
  AccordionSummaryCreateModule,
  AccordionDetailsCreateModule,
} from '@/components/accordions/AccordionCreateModule';
import useSearchDialog, { UseSearchDialog } from '@/lib/useSearchDialog';
import LocationCard from '../LocationCard';
import { Location, Reservation, EventData, ReservationData, LocationData, Event } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { CreatorPanelProps, StartCreator } from '@/lib/global/useCreate';
import { Dayjs } from 'dayjs';
import UnverifiedLocationCard from '../UnverifiedLocationCard';
import ReservationCard from '../ReservationCard';
import { UseLocations } from '@/lib/global/useLocations';

interface LocationAccordionModuleProps {
  item: (EventData & CreatorPanelProps) | null;
  handleChange: any;
  search: any;
  handleSelection: (item: any) => void;
  removeSelection: (query: string) => void;
  moveSelectionToTop: (uuid: string) => void;
  searchConfig: any;
  startCreator: StartCreator;
  expanded: any;
  onChange: any;
  Locations: UseLocations;
  props?: any;
}


export const LocationSearchCard = ({ item, onClick, onAction, onRemove }: { item: Location; onClick: (e: MouseEvent) => any; onAction?: (item: Location) => any; onRemove?: (id: string) => void }) => {
  return (
    <>
      <ButtonBase
        key={item.id()}
        sx={{
          display: 'flex',
          width: '100%',
          padding: '1rem',
          borderRadius: '0.5rem',
          alignItems: "flex-start"
        }}
        onClick={onClick}
      >
        {item.memberships ? (
          <VerifiedOutlined fontSize="small" />
        ) : (
          <LocationOnOutlined fontSize="small" />

        )}
        <div
          className="flex"
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginLeft: '1rem',
            textAlign: 'left'
          }}
        >
          <Typography variant="body1">{item.getItem().name}</Typography>
          <Typography variant="caption">{item.getItem().address}</Typography>
        </div>
        <div className="flex fit">
          {item.memberships ? (
            <Button color="primary" variant='contained' onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}>Reserve</Button>
          ) : (
            <Button color="primary" variant='outlined' onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}>Add</Button>
          )}
        </div>
      </ButtonBase>
    </>
  )
}




export default function LocationAccordionModule({
  item,
  handleChange,
  search,
  handleSelection,
  removeSelection,
  moveSelectionToTop,
  searchConfig,
  startCreator,
  expanded,
  onChange,
  Locations,
  ...props
}: LocationAccordionModuleProps) {
  const theme = useTheme();

  const [panelRef, setPanelRef] = useState<string[]>([]);

  const addPanelRef = (uuid: string) => {
    return setPanelRef((prev) => {
      prev.push(uuid)
      return prev;
    });
  }

  const addReservation = (item: any) => {
    console.log(item);
    handleSelection(item);
  }

  const handleAction = (selected: Location) => {
    toggleSearch(false);
    startCreator(Type.Location, Mode.Create, {
      name: selected.name,
      location: selected
    });
  }


  const handleStart = (selected: Location) => {

    if (!item) {
      return;
    }

    if (!selected.memberships) {
      handleSelection(selected);
      return;
    }

    const id = uuidv4();
    startCreator(Type.Reservation, Mode.Create, {
      ...new Event({
        uuid: String(uuidv4()),
        name: `Reservation at ${selected.getItem().name}`,
        date: item?.date,
        start_time: item?.start_time,
        end_time: item?.end_time,
        location: selected.eject(),
      }).eject(),
      callback: (selected: any) => addReservation(selected)
    });
  }

  const handleEditRes = (self: ReservationData) => {

    startCreator(Type.Reservation, Mode.Modify, {
      ...self,
      callback: (selected: any) => addReservation(selected)
    });
    removeSelection(self.uuid);
    return;
  }


  const { SearchForm, SearchButton, toggleSearch }: UseSearchDialog =
    useSearchDialog(searchConfig, handleStart, handleAction, LocationSearchCard);

  if (!item) {
    return <></>
  }

  return (
    <AccordionCreateModule expanded={expanded} onChange={onChange}>
      <AccordionSummaryCreateModule
        name={(item.reservations && item.reservations[0] ? (item.reservations[0] as EventData).start_time ? (item.reservations[0] as EventData).location_name : (item.reservations[0] as LocationData).name : null) || "Locations & Places"}
        expanded={expanded}
        icon={<LocationOnOutlined />}
        preview={<></>}
      />
      <AccordionDetails>
        {item.reservations && item.reservations.length > 0 ? (
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
                <div className="column compact">
                  {item.reservations.map((theRes: ReservationData, index: number) => {
                    try {
                      if ((theRes as EventData).start_time) {
                        return (
                          <ReservationCard
                            selected={index === 0}
                            item={theRes as EventData}
                            onClick={() => handleEditRes(theRes)}
                            key={theRes.uuid}
                            onRemove={removeSelection}
                            onEdit={handleEditRes}
                            onPromote={moveSelectionToTop}
                          />
                        )
                      }
                      else {
                        return (
                          <UnverifiedLocationCard
                            selected={index === 0}
                            key={theRes.uuid}
                            item={theRes as LocationData}
                            onRemove={removeSelection}
                            onPromote={moveSelectionToTop}
                          />
                        )
                      }
                    }
                    catch (err) {
                      console.log(err);
                    }
                  })}
                </div>
                <div
                  className="flex compact"
                  style={{
                    justifyContent: 'flex-end',
                    marginTop: '1rem',
                  }}
                >
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<SearchOutlined />}
                    onClick={() => {
                      toggleSearch(true);
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      startCreator(Type.Location, Mode.Create, {});
                    }}
                  >
                    Create New Location
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='column compact'>
            {SearchButton}
            <div
              className="flex"
              style={{
                justifyContent: 'flex-end',
                marginTop: '1rem',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  startCreator(Type.Location, Mode.Create, {});
                }}
              >
                Create New Location
              </Button>
            </div>
          </div>
        )}
      </AccordionDetails>
      {SearchForm}
    </AccordionCreateModule >
  );
}
