
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
import { Location, Reservation, EventData } from '@/schema';
import { Type, Mode } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { Dayjs } from 'dayjs';
import UnverifiedLocationCard from '../UnverifiedLocationCard';
import ReservationCard from '../ReservationCard';
import { UseLocations } from '@/lib/global/useLocations';
import { LocationSearchCard } from './LocationAccordionModule';

interface SingleLocationAccordionModuleProps {
  item: any;
  handleChange: any;
  search: any;
  handleSelection: (item: any) => void;
  removeSelection: (query?: string | null) => void;
  startCreator: StartCreator;
  searchConfig: any,
  expanded: any;
  onChange: any;
  Locations: UseLocations;
  props?: any;
}


export default function SingleLocationAccordionModule({
  item,
  handleChange,
  search,
  handleSelection,
  removeSelection,
  startCreator,
  searchConfig,
  expanded,
  onChange,
  Locations,
  ...props
}: SingleLocationAccordionModuleProps) {
  const theme = useTheme();


  const handleAction = (selected: Location) => {
    toggleSearch(false);

    startCreator(Type.Location, Mode.Create, {
      name: selected.name,
      location: selected
    });
  }


  const handleStart = (selected: Location) => {

    if (selected instanceof Location) {
      handleSelection(selected);
      return;
    }

    const id = uuidv4();
    handleSelection(selected);
  }


  const { SearchForm, SearchButton, toggleSearch }: UseSearchDialog =
    useSearchDialog(searchConfig, handleStart, handleAction, LocationSearchCard);

  return (
    <AccordionCreateModule expanded={expanded} onChange={onChange}>
      <AccordionSummaryCreateModule
        name={item.type === Type.Location ? item.name || "Locations & Places" : item.location_name || "Locations & Places"}
        expanded={expanded}
        icon={<LocationOnOutlined />}
        preview={<></>}
      />
      <AccordionDetails>
        {(item.type === Type.Location ? item.place_id : item.location_place_id) ? (
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
                  {item.type === Type.Location ? (
                    <UnverifiedLocationCard
                      key={item.place_id}
                      selected={item.place_id}
                      item={item}
                      onRemove={removeSelection}
                    />
                  ) : (
                    <UnverifiedLocationCard
                      key={item.location_place_id}
                      selected={item.location_place_id}
                      item={{
                        uuid: item.location_place_id,
                        name: item.location_name,
                        place_name: item.location_name,
                        place_id: item.location_place_id,
                        address: item.location_address
                      }}
                      onRemove={removeSelection}
                    />
                  )}
                </div>
                <div
                  className="column compact"
                  style={{
                    justifyContent: 'flex-end',
                    marginTop: '1rem',
                  }}
                >
                  <Button
                    variant="text"
                    startIcon={<SearchOutlined />}
                    onClick={() => {
                      toggleSearch(true);
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      startCreator(Type.Location, Mode.Create, {
                        callback: (item: any) => handleSelection(item)
                      });
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
                  startCreator(Type.Location, Mode.Create, {
                    callback: (item: any) => handleSelection(item)
                  });
                }}
              >
                Create New Location
              </Button>
            </div>
          </div>
        )}
        {SearchForm}
      </AccordionDetails>
    </AccordionCreateModule >
  );
}
