
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
  PaletteOutlined,
  RemoveCircleOutline,
  RemoveOutlined,
  SearchOutlined,
  ShareOutlined,
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
  Modal,
  TextField,
} from '@mui/material';
import { ChangeEvent, Dispatch, MouseEvent, SetStateAction, useState } from 'react';

import { Location, Reservation, EventData } from '@/schema';
import { Type, Mode, adjustForContrast } from '@/types/globals';
import { StartCreator } from '@/lib/global/useCreate';
import { Dayjs } from 'dayjs';
import { UseLocations } from '@/lib/global/useLocations';
import { LocationSearchCard } from './LocationAccordionModule';
import { HexColorPicker } from 'react-colorful';

interface ColorPaletteSelectorProps {
  item: any;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, newValue : any) => any;
}

const ensureSingleHashtag = (value: string): `#${string}` => {
  // Remove any leading `#` and add exactly one
  return `#${value.replace(/^#+/, '')}`;
};

export default function ColorPaletteSelector({
  item,
  handleChange,
  ...props
}: ColorPaletteSelectorProps) {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  if (!item) {
    return <></>
  }


  return (
    <>
      <Tooltip title="Color">
        <IconButton onClick={() => setOpen(true)} sx={{
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "100vh",
          border: `2px solid ${theme.palette.getContrastText(item.theme_color || theme.palette.divider)}`,
          color: theme.palette.getContrastText(item.theme_color || theme.palette.divider),
          backgroundColor: item.theme_color || theme.palette.divider,
          '&:hover': {
            backgroundColor: `${adjustForContrast(item.theme_color || theme.palette.divider, 0.25)}`,
          }
        }}>
          <PaletteOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex center middle"
      >
        <div className="column" style={{ backgroundColor: theme.palette.background.paper, padding: "1rem", maxWidth: '30rem', borderRadius: "0.5rem" }}>
          <HexColorPicker color={item?.theme_color || ""} onChange={(color) => handleChange("theme_color", ensureSingleHashtag(color))} />
          <TextField name="theme_color" value={item?.theme_color || ""} onChange={(e) => handleChange(e, ensureSingleHashtag(e.target.value))} />
          <div className="flex compact">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
