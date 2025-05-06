
import {
  PaletteOutlined,
} from '@mui/icons-material';
import {
  Button,
  Tooltip,
  useTheme,
  IconButton,
  Modal,
  TextField,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';

import { adjustForContrast } from '@/types/globals';
import { HexColorPicker } from 'react-colorful';

interface ColorPaletteSelectorProps {
  item: any;
  size?: string;
  fontSize?: string;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, newValue : any) => any;
}

const ensureSingleHashtag = (value: string): `#${string}` => {
  // Remove any leading `#` and add exactly one
  return `#${value.replace(/^#+/, '')}`;
};

export default function ColorPaletteSelector({
  item,
  handleChange,
  size = "2.25rem",
  fontSize = "1rem",
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
          width: size,
          height: size,
          borderRadius: "100vh",
          border: `2px solid ${theme.palette.getContrastText(item.theme_color || theme.palette.divider)}`,
          color: theme.palette.getContrastText(item.theme_color || theme.palette.divider),
          backgroundColor: item.theme_color || theme.palette.divider,
          '&:hover': {
            backgroundColor: `${adjustForContrast(item.theme_color || theme.palette.divider, 0.25)}`,
          }
        }}>
          <PaletteOutlined sx={{
            fontSize: fontSize
          }} />
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
